import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Helper for DB querying inside the AI tools
async function dbQuery(sqlStr: string) {
  // Since we are using standard supabase client, raw sql is tricky.
  // Instead of raw sql, we'll map specific operations so the AI can use them.
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    // @ts-ignore: Bypass ai SDK version mismatch
    model: google('models/gemini-1.5-pro-latest'),
    system: "Eres un asistente experto en inventarios de una tienda de ropa infantil. Puedes consultar stock, decir qué tallas faltan (stock < 10) y agregar o quitar inventario. Responde siempre de forma corta, amable y directa. El formato de caja es 1 caja = 3 unidades.",
    messages,
    tools: {
      get_inventory: tool({
        description: 'Consulta todo el inventario actual para saber cantidades y stock.',
        parameters: z.object({}),
        execute: async () => {
          const { data } = await supabase.from('inventory_items').select('*');
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

  return result.toDataStreamResponse();
}
