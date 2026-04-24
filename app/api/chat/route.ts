import { groq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `Eres un asistente de inventario experto.
REGLAS:
1. Para AGREGAR productos: usa "agregar_producto".
2. Para CONSULTAR: usa "consultar_inventario".
3. Responde siempre de forma corta y amable en español.`,
      messages,
      maxSteps: 5,
      tools: {
        consultar_inventario: tool({
          description: 'Muestra el inventario actual.',
          parameters: z.object({}),
          execute: async () => {
            const { data } = await supabase.from('inventory_items').select('*');
            return data;
          },
        }),
        agregar_producto: tool({
          description: 'Agrega un producto al inventario.',
          parameters: z.object({
            modelo: z.string().describe('Nombre del modelo'),
            talla: z.string().describe('Talla'),
            formato: z.string().describe('cajas o unidades'),
            cantidad: z.number().describe('Cantidad'),
          }),
          execute: async ({ modelo, talla, formato, cantidad }) => {
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              size: talla,
              format: formato,
              quantity: cantidad
            }]);
            return error ? { error: error.message } : { success: true };
          },
        }),
      },
    });
    // Si la IA no genera texto pero sí ejecutó herramientas, devolvemos un éxito
    const finalResponse = result.text || "✅ ¡Listo! He procesado tu solicitud.";
    return Response.json({ text: finalResponse });
  } catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
