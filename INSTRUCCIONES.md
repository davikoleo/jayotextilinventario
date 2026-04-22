# Instrucciones para iniciar el Proyecto

Noté que la herramienta `npx` de Node.js no está instalada o reconocida en tu sistema. Para ejecutar una aplicación Next.js, necesitas tener Node.js instalado.

## Paso 1: Instalar Node.js
1. Ve a [https://nodejs.org/](https://nodejs.org/)
2. Descarga e instala la versión recomendada (LTS).
3. Una vez instalado, reinicia tu terminal o tu editor de código.

## Paso 2: Crear el proyecto
Abre tu terminal en la carpeta `Desktop/inventario` y ejecuta exactamente este comando:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm
```
(Si te hace alguna otra pregunta el asistente de Next.js, dile que **Sí / Yes** a todo, especialmente a Tailwind CSS).

## Paso 3: Instalar las dependencias adicionales del diseño
Una vez creado el proyecto base, instala las librerías gráficas y de Supabase:
```bash
npm install @supabase/supabase-js recharts lucide-react
```

## Paso 4: Preparar los Archivos
Ya tienes estos archivos creados aquí mismo en la carpeta listos para ser usados en tu proyecto Next.js recién creado:
- `schema.sql`: Ejecútalo en el editor SQL de tu panel de Supabase.
- `lib/supabase.ts`: Funciones de conexión con Supabase.
- `components/InventoryDashboard.tsx`: ¡Todo el Dashboard con Tailwind de manera premium!
- `app/page.tsx`: Reemplaza el archivo por defecto de Next.js.
- `.env.local`: Completa ahí tus variables de Supabase obtenidas de tu panel en Settings > API.

## Paso 5: Probar y Desplegar
Ejecuta localmente:
```bash
npm run dev
```

Para subirlo a Vercel, simplemente vincula tu repositorio de GitHub a tu cuenta de Vercel y añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` a los "Environment Variables" de Vercel.
