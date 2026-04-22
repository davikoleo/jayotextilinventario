'use client';

import React, { useEffect, useState } from 'react';
import { supabase, InventoryItem } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Package, AlertTriangle, Layers, Search, Filter } from 'lucide-react';

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModel, setFilterModel] = useState('Todos');
  const [filterSize, setFilterSize] = useState('Todas');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('model_name', { ascending: true })
      .order('size', { ascending: true });

    if (error) console.error('Error fetching inventory:', error);
    else setItems(data || []);
    setLoading(false);
  };

  // KPIs
  const totalUnits = items.reduce((acc, item) => acc + item.total_units, 0);
  const lowStockItems = items.filter((item) => item.total_units < 10);

  // Grouping for Chart
  const chartData = items.reduce((acc: any[], item) => {
    const existing = acc.find(i => i.name === item.model_name);
    if (existing) {
      existing.units += item.total_units;
    } else {
      acc.push({ name: item.model_name, units: item.total_units });
    }
    return acc;
  }, []);

  // Filter Options
  const uniqueModels = ['Todos', ...Array.from(new Set(items.map(i => i.model_name)))];
  const uniqueSizes = ['Todas', ...Array.from(new Set(items.map(i => i.size)))].sort((a, b) => {
    if (a === 'Todas') return -1;
    if (b === 'Todas') return 1;
    return parseInt(a) - parseInt(b);
  });

  // Filtered Table Data
  const filteredItems = items.filter(item => {
    return (filterModel === 'Todos' || item.model_name === filterModel) &&
           (filterSize === 'Todas' || item.size === filterSize);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Layers className="h-10 w-10 text-indigo-600" />
            Dashboard de Inventario
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Visión general y gestión de stock en tiempo real.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Unidades</p>
                <h3 className="text-4xl font-bold text-slate-900">{totalUnits}</h3>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Alertas Stock Bajo</p>
                <h3 className="text-4xl font-bold text-red-600">{lowStockItems.length}</h3>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">&lt; 10 unidades</p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-md p-6 text-white flex flex-col justify-center">
            <h3 className="text-lg font-semibold mb-2">Resumen Rápido</h3>
            <p className="text-indigo-100 text-sm">
              Tienes {items.length} registros distintos en almacén. Mantén el ojo en los {lowStockItems.length} registros que requieren reposición.
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Unidades Totales por Modelo</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="units" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Detalle de Inventario</h2>
            <div className="flex gap-4 w-full sm:w-auto">
              {/* Modelo Filter */}
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                >
                  {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              
              {/* Size Filter */}
              <div className="relative w-full sm:w-32">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  value={filterSize}
                  onChange={(e) => setFilterSize(e.target.value)}
                >
                  {uniqueSizes.map(s => <option key={s} value={s}>Talla {s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Modelo</th>
                  <th className="px-6 py-4 font-semibold">Talla</th>
                  <th className="px-6 py-4 font-semibold">Formato</th>
                  <th className="px-6 py-4 font-semibold">Stock Físico</th>
                  <th className="px-6 py-4 font-semibold rounded-br-lg">Total Unidades</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.model_name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {item.size}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-500">{item.format}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">
                        {item.quantity} {item.format === 'cajas' ? 'Cjs' : 'Unds'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.total_units < 10 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.total_units} unid.
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No se encontraron resultados para los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
