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
      system: `Eres un asistente de inventario de ropa infantil. Respondes siempre en español, corto y directo.
1 caja = 3 unidades.
REGLAS PARA USAR HERRAMIENTAS:
- Para agregar producto: usa "agregar_producto" con los parametros: modelo, formato, talla, cantidad.
- Si el usuario da varias tallas, llama la herramienta UNA VEZ POR CADA TALLA.
- Ejemplo: "agrega Girasol 2 cajas talla 4 y 1 caja talla 6" = 2 llamadas separadas.
- Para consultar inventario: usa "consultar_inventario" sin parametros.
- Para eliminar: usa "eliminar_producto" con modelo y talla.`,
      messages,
      maxSteps: 10,
      tools: {
        consultar_inventario: tool({
          description: 'Consulta todo el inventario actual.',
          parameters: z.object({}).passthrough(),
          execute: async () => {
            const { data, error } = await supabase.from('inventory_items').select('*');
            if (error) throw new Error(error.message);
            return data;
          },
        }),
        agregar_producto: tool({
          description: 'Agrega UN producto al inventario. Parametros: modelo (string), formato (string "cajas" o "unidades"), talla (string), cantidad (number). Llama una vez por talla.',
          parameters: z.object({
            modelo: z.string().describe('Nombre del modelo'),
            formato: z.string().describe('"cajas" o "unidades"'),
            talla: z.string().describe('Talla del producto'),
            cantidad: z.number().describe('Cantidad numerica'),
          }).passthrough(),
          execute: async (params: any) => {
            const modelo = params.modelo || params.model_name || params.modelName || 'Sin nombre';
            const formato = params.formato || params.format || 'cajas';
            const talla = String(params.talla || params.size || params.talla_size || '');
            const cantidad = Number(params.cantidad || params.quantity || params.qty || 0);
            if (!talla || !cantidad) {
              return { success: false, error: 'Faltan datos: se necesita talla y cantidad.' };
            }
            const { error } = await supabase.from('inventory_items').insert([{
              model_name: modelo,
              format: formato,
              size: talla,
              quantity: cantidad
            }]);
            if (error) return { success: false, error: error.message };
            return { success: true, message: `✅ Agregado: ${cantidad} ${formato} de ${modelo} talla ${talla}` };
          },
        }),
        eliminar_producto: tool({
          description: 'Elimina un producto del inventario. Parametros: modelo (string), talla (string).',
          parameters: z.object({
            modelo: z.string().describe('Nombre del modelo'),
            talla: z.string().describe('Talla a eliminar')
          }).passthrough(),
          execute: async (params: any) => {
            const modelo = params.modelo || params.model_name || params.modelName || '';
            const talla = String(params.talla || params.size || '');
            const { error } = await supabase.from('inventory_items').delete()
              .eq('model_name', modelo).eq('size', talla);
            if (error) return { success: false, error: error.message };
            return { success: true, message: `✅ Eliminado: ${modelo} talla ${talla}` };
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
