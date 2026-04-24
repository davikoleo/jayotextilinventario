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
        { error: "Falta la clave de API de Groq. Configura GROQ_API_KEY." },
        { status: 500 }
      );
    }
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `Eres un asistente de inventario. 1 caja = 3 unidades.
REGLAS:
- Para agregar: usa "agregar_producto" (modelo, formato, talla, cantidad).
- Si son varias tallas, llama la herramienta una vez por cada talla.
- Responde siempre corto y en español.`,
      messages,
      maxSteps: 10,
      tools: {
        consultar_inventario: tool({
          description: 'Consulta el inventario.',
          parameters: z.object({}).passthrough(),
          execute: async () => {
            const { data, error } = await supabase.from('inventory_items').select('*');
            return error ? { error: error.message } : data;
          },
        }),
        agregar_producto: tool({
          description: 'Agrega un producto.',
          // Usamos un objeto flexible para evitar errores de validación
          parameters: z.record(z.any()).passthrough(),
          execute: async (params: any) => {
            // Extraemos los valores sin importar cómo los llame la IA
            const modelo = params.modelo || params.model || params.modelName || 'Producto';
            const formato = params.formato || params.format || 'unidades';
            const talla = String(params.talla || params.size || 'S');
            const cantidad = Number(params.cantidad || params.quantity || 1);
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              format: formato,
              size: talla,
              quantity: cantidad
            }]);
            
            if (error) return { success: false, error: error.message };
            return { success: true, message: `✅ ${cantidad} ${formato} de ${modelo} (Talla ${talla}) agregados.` };
          },
        }),
        eliminar_producto: tool({
          description: 'Elimina un producto.',
          parameters: z.record(z.any()).passthrough(),
          execute: async (params: any) => {
            const modelo = params.modelo || params.model || '';
            const talla = String(params.talla || params.size || '');
            const { error } = await supabase.from('inventory_items').delete().eq('model_name', modelo).eq('size', talla);
            return error ? { success: false, error: error.message } : { success: true };
          }
        })
      },
    });
    const responseText = result.text?.trim() || "✅ Operación completada con éxito.";
    return Response.json({ text: responseText });
  } catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
