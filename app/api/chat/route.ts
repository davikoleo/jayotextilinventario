import { groq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `Eres un asistente de inventario de ropa infantil. 
- Responde siempre de forma corta y amable.
- IMPORTANTE: Para agregar productos, usa la herramienta "agregar_producto".
- Si hay varias tallas, usa la herramienta una vez por cada talla.
- Formato de caja: 1 caja = 3 unidades.`,
      messages,
      maxSteps: 5,
      tools: {
        consultar_inventario: tool({
          description: 'Mira todo el stock actual.',
          parameters: z.object({}),
          execute: async () => {
            const { data } = await supabase.from('inventory_items').select('*');
            return data;
          },
        }),
        agregar_producto: tool({
          description: 'Guarda un producto en la base de datos.',
          parameters: z.object({
            modelo: z.string().describe('Nombre del modelo, ej: "Girasol"'),
            talla: z.string().describe('Talla, ej: "16"'),
            formato: z.enum(['cajas', 'unidades']).describe('El formato de empaque'),
            cantidad: z.number().describe('La cantidad numérica'),
          }),
          execute: async ({ modelo, talla, formato, cantidad }) => {
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              size: talla,
              format: formato,
              quantity: cantidad
            }]);
            if (error) return { error: error.message };
            return { success: true };
          },
        }),
      },
    });
    return Response.json({ text: result.text || "✅ Operación lista." });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
