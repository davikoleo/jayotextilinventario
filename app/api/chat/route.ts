import { groq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return Response.json(
        { error: "Falta la clave de API de Groq en el servidor. Configura GROQ_API_KEY en las variables de entorno." },
        { status: 500 }
      );
    }

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: "Eres un asistente experto en inventarios de una tienda de ropa infantil. Puedes consultar stock, decir qué tallas faltan (stock < 10) y agregar o quitar inventario. Responde siempre de forma corta, amable y directa. El formato de caja es 1 caja = 3 unidades.",
      messages,
      maxSteps: 5,
      tools: {
        get_inventory: tool({
          description: 'Consulta todo el inventario actual para saber cantidades y stock.',
          parameters: z.object({}),
          execute: async () => {
            const { data, error } = await supabase.from('inventory_items').select('*');
            if (error) throw new Error(error.message);
            return data;
          },
        }),
        add_product: tool({
          description: 'Agrega mercadería nueva al inventario.',
          parameters: z.object({
            modelName: z.string().describe('El nombre del modelo a agregar, ej: "Sirenita", "Boxer Niño Color Entero"'),
            format: z.string().describe('Debe ser exactamente "cajas" o "unidades"'),
            size: z.string().describe('La talla del modelo, ej: "4", "6", "8"'),
            quantity: z.number().describe('La cantidad en formato físico (cuantas cajas o cuantas unidades)'),
          }),
          execute: async ({ modelName, format, size, quantity }) => {
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelName,
              format: format,
              size: size,
              quantity: quantity
            }]);
            if (error) return { success: false, error: error.message };
            return { success: true, message: `Agregado exitosamente: ${quantity} ${format} de ${modelName} talla ${size}` };
          },
        }),
        delete_product: tool({
          description: 'Elimina un producto del inventario mediante su nombre de modelo y talla.',
          parameters: z.object({
            modelName: z.string(),
            size: z.string()
          }),
          execute: async ({ modelName, size }) => {
            const { error } = await supabase.from('inventory_items').delete().eq('model_name', modelName).eq('size', size);
            if (error) return { success: false, error: error.message };
            return { success: true, message: `Eliminado correctamente el modelo ${modelName} talla ${size}` };
          }
        })
      },
    });

    const responseText = result.text?.trim() || "✅ ¡Listo! La operación se completó correctamente.";
    return Response.json({ text: responseText });
  } catch (error: any) {
    console.error("Error en /api/chat:", error);
    return Response.json(
      { error: "Error en el servidor: " + (error.message || "Desconocido") },
      { status: 500 }
    );
  }
}

