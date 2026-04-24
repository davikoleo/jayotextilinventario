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
      system: `Eres un asistente de inventario experto.
REGLAS:
- Para agregar: usa "agregar_producto" (modelo, formato, talla, cantidad).
- Si son varias tallas, llama la herramienta UNA VEZ POR CADA TALLA.
- Responde siempre corto, amable y en español.`,
      messages,
      maxSteps: 10,
      tools: {
        consultar_inventario: tool({
          description: 'Consulta el inventario actual.',
          parameters: z.any(),
          execute: async () => {
            const { data, error } = await supabase.from('inventory_items').select('*');
            return error ? { error: error.message } : data;
          },
        }),
        agregar_producto: tool({
          description: 'Agrega un producto al inventario. Parámetros: modelo, formato, talla, cantidad.',
          parameters: z.any(),
          execute: async (params: any) => {
            // Extraemos los datos de forma flexible
            const modelo = params.modelo || params.model || params.modelName || 'Producto';
            const formato = params.formato || params.format || 'unidades';
            const talla = String(params.talla || params.size || '');
            const cantidad = Number(params.cantidad || params.quantity || 0);
            if (!talla || !cantidad) return { error: 'Faltan datos' };
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              format: formato,
              size: talla,
              quantity: cantidad
            }]);
            
            if (error) return { success: false, error: error.message };
            return { success: true, message: `✅ Agregado: ${cantidad} ${formato} de ${modelo} (Talla ${talla})` };
          },
        }),
        eliminar_producto: tool({
          description: 'Elimina un producto.',
          parameters: z.any(),
          execute: async (params: any) => {
            const modelo = params.modelo || params.model || '';
            const talla = String(params.talla || params.size || '');
            const { error } = await supabase.from('inventory_items').delete().eq('model_name', modelo).eq('size', talla);
            return error ? { success: false, error: error.message } : { success: true };
          }
        })
      },
    });
    const responseText = result.text?.trim() || "✅ Operación completada.";
    return Response.json({ text: responseText });
  } catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
