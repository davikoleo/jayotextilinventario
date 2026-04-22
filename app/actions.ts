'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// Fetch
export async function getProducts() {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('model_name', { ascending: true })
    .order('size', { ascending: true });
  
  if (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
  return data;
}

// Create
export async function addProduct(modelName: string, format: 'cajas' | 'unidades', size: string, quantity: number) {
  const { error } = await supabase
    .from('inventory_items')
    .insert([{ 
      model_name: modelName, 
      format: format, 
      size: size, 
      quantity: quantity 
    }]);

  if (error) {
    console.error('Error inserting product:', error);
    return { success: false, error: 'No se pudo agregar el producto.' };
  }
  
  revalidatePath('/');
  return { success: true };
}

// Update
export async function updateProductContent(id: string, newQuantity: number) {
  const { error } = await supabase
    .from('inventory_items')
    .update({ quantity: newQuantity })
    .eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'No se pudo actualizar el producto.' };
  }
  
  revalidatePath('/');
  return { success: true };
}

// Delete
export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'No se pudo eliminar el producto.' };
  }
  
  revalidatePath('/');
  return { success: true };
}
