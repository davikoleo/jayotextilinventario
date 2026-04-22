import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type InventoryItem = {
  id: string;
  model_name: string;
  format: 'cajas' | 'unidades';
  size: string;
  quantity: number;
  total_units: number;
  created_at: string;
  updated_at: string;
};
