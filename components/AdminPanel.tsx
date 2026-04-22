'use client';

import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProductContent, deleteProduct } from '@/app/actions';
import { InventoryItem } from '@/lib/supabase';
import { Settings, Plus, Save, Trash2, Edit2, X } from 'lucide-react';

export default function AdminPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // New Product Form
  const [newModel, setNewModel] = useState('');
  const [newFormat, setNewFormat] = useState<'cajas' | 'unidades'>('cajas');
  const [newSize, setNewSize] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getProducts();
    setItems(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    await updateProductContent(id, editQuantity);
    setEditingId(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del sistema?')) {
      await deleteProduct(id);
      fetchData();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProduct(newModel, newFormat, newSize, newQuantity);
    setIsAdding(false);
    setNewModel('');
    setNewSize('');
    setNewQuantity(0);
    fetchData();
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Cargando panel de administración...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Panel de Administración (Actualizar/Agregar)
        </h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Agregar Producto
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Modelo</label>
            <input required type="text" value={newModel} onChange={(e) => setNewModel(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm" placeholder="Ej. Avion (H-11)" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Talla</label>
            <input required type="text" value={newSize} onChange={(e) => setNewSize(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm" placeholder="Ej. 10" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Formato</label>
            <select value={newFormat} onChange={(e) => setNewFormat(e.target.value as any)} className="w-full border-slate-300 rounded-lg p-2 text-sm bg-white">
              <option value="cajas">Cajas</option>
              <option value="unidades">Unidades Sueltas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Cantidad Ingresada</label>
            <input required type="number" min="0" value={newQuantity} onChange={(e) => setNewQuantity(parseInt(e.target.value))} className="w-full border-slate-300 rounded-lg p-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg font-bold text-sm transition">Guardar</button>
            <button type="button" onClick={() => setIsAdding(false)} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-lg font-bold text-sm transition">Cancelar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Modelo</th>
              <th className="px-6 py-4">Talla</th>
              <th className="px-6 py-4">Formato</th>
              <th className="px-6 py-4">Cantidad Input</th>
              <th className="px-6 py-4">Total Real</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{item.model_name}</td>
                <td className="px-6 py-4"><span className="bg-slate-200 px-2 py-1 rounded text-xs font-bold">{item.size}</span></td>
                <td className="px-6 py-4 capitalize">{item.format}</td>
                
                <td className="px-6 py-4">
                  {editingId === item.id ? (
                    <input 
                      type="number" 
                      className="border-indigo-500 border-2 rounded p-1 w-20 text-center" 
                      value={editQuantity} 
                      onChange={(e) => setEditQuantity(parseInt(e.target.value))}
                    />
                  ) : (
                    <span>{item.quantity} {item.format === 'cajas' ? 'cjs' : 'unds'}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 font-bold text-indigo-700">
                  {editingId === item.id 
                    ? (item.format === 'cajas' ? editQuantity * 3 : editQuantity) + ' unid.' 
                    : item.total_units + ' unid.'}
                </td>
                
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => handleUpdate(item.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200" title="Guardar">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200" title="Cancelar">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(item.id); setEditQuantity(item.quantity); }} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Editar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
