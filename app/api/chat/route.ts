import { groq } from '@ai-sdk/groq';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `Eres el ASISTENTE DE INVENTARIO. Responde corto y en español.
      REGLA: Usa la herramienta "agregar_producto" para guardar datos.`,
      messages,
      maxSteps: 5,
      tools: {
        agregar_producto: tool({
          description: 'Guarda un producto. Recibe: modelo, talla, formato, cantidad.',
          // Aceptamos cualquier propiedad extra para que no dé error de validación
          parameters: z.object({
            modelo: z.string().optional(),
            talla: z.string().optional(),
            formato: z.string().optional(),
            cantidad: z.number().optional(),
          }).passthrough(),
          execute: async (params: any) => {
            // Buscamos los datos sin importar cómo los llame la IA
            const m = params.modelo || params.model || "Modelo";
            const t = String(params.talla || params.size || "Única");
            const f = params.formato || params.format || "unidades";
            const c = Number(params.cantidad || params.quantity || 1);
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: m, size: t, format: f, quantity: c
            }]);
            return error ? { error: error.message } : { success: true };
          },
        }),
      },
    });
    return Response.json({ text: result.text || "✅ ¡Inventario actualizado!" });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
