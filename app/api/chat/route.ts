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
        consultar_inventario: tool({
          description: 'Consulta todo el inventario actual para saber cantidades y stock.',
          parameters: z.object({}),
          execute: async () => {
            const { data, error } = await supabase.from('inventory_items').select('*');
            if (error) throw new Error(error.message);
            return data;
          },
        }),
        agregar_producto: tool({
          description: 'Agrega mercadería nueva al inventario. Llama esta herramienta UNA VEZ por cada combinación de modelo+talla.',
          parameters: z.object({
            modelo: z.string().describe('Nombre completo del modelo, ej: "Girasol (B-21)", "Boxer Niño Color Entero"'),
            formato: z.string().describe('Debe ser exactamente "cajas" o "unidades"'),
            talla: z.string().describe('La talla, ej: "2", "4", "6", "8", "10", "12", "14", "16"'),
            cantidad: z.number().describe('Cantidad numérica (cuántas cajas o cuántas unidades)'),
          }),
          execute: async ({ modelo, formato, talla, cantidad }) => {
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              format: formato,
              size: talla,
              quantity: cantidad
            }]);
            if (error) return { success: false, error: error.message };
            return { success: true, message: `Agregado: ${cantidad} ${formato} de ${modelo} talla ${talla}` };
          },
        }),
        eliminar_producto: tool({
          description: 'Elimina un producto del inventario mediante su nombre de modelo y talla.',
          parameters: z.object({
            modelo: z.string().describe('Nombre del modelo a eliminar'),
            talla: z.string().describe('Talla del producto a eliminar')
          }),
          execute: async ({ modelo, talla }) => {
            const { error } = await supabase.from('inventory_items').delete().eq('model_name', modelo).eq('size', talla);
            if (error) return { success: false, error: error.message };
            return { success: true, message: `Eliminado correctamente: ${modelo} talla ${talla}` };
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

