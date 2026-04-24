import { groq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  try {
    console.log("--- Nueva solicitud de chat ---");
    const { messages } = await req.json();
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `Eres un asistente de inventario amable. 
      REGLAS:
      1. Usa "agregar_producto" para guardar datos.
      2. Si son varias tallas, úsala varias veces.
      3. Responde corto y en español.`,
      messages,
      maxSteps: 5,
      tools: {
        consultar_inventario: tool({
          description: 'Consultar stock.',
          parameters: z.object({}),
          execute: async () => {
            const { data } = await supabase.from('inventory_items').select('*');
            return data;
          },
        }),
        agregar_producto: tool({
          description: 'Agregar producto.',
          parameters: z.object({
            modelo: z.string(),
            talla: z.string(),
            formato: z.string(),
            cantidad: z.number(),
          }),
          execute: async ({ modelo, talla, formato, cantidad }) => {
            console.log("Intentando agregar:", { modelo, talla, formato, cantidad });
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              size: talla,
              format: formato,
              quantity: cantidad
            }]);
            if (error) console.error("Error Supabase:", error);
            return error ? { error: error.message } : { success: true };
          },
        }),
      },
    });
    return Response.json({ text: result.text || "✅ Procesado correctamente." });
  } catch (error: any) {
    console.error("Error crítico:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
