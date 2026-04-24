import { groq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      // CAMBIO DE PRUEBA: Si el asistente no dice exactamente esto, Vercel no se ha actualizado.
      system: `Eres el ASISTENTE NUEVO V3. 
      Responde siempre empezando con la frase: "CONTROL DE INVENTARIO V3 ACTIVO."
      REGLAS:
      - Usa "agregar_producto" para guardar datos.`,
      messages,
      maxSteps: 5,
      tools: {
        agregar_producto: tool({
          description: 'Agregar producto.',
          parameters: z.object({
            modelo: z.string(),
            talla: z.string(),
            formato: z.string(),
            cantidad: z.number(),
          }),
          execute: async ({ modelo, talla, formato, cantidad }) => {
            await supabase.from('inventory_items').insert([{
              model_name: modelo, size: talla, format: formato, quantity: cantidad
            }]);
            return { success: true };
          },
        }),
      },
    });
    return Response.json({ text: result.text || "✅ Procesado." });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
