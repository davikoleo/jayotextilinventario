'use client';

import { useState } from 'react';
import InventoryDashboard from '@/components/InventoryDashboard';
import AdminPanel from '@/components/AdminPanel';

import AIAssistant from '@/components/AIAssistant';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto pt-6 px-6 md:px-10 flex justify-end gap-2">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
        >
          Ver Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('admin')} 
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
        >
          Administrar Productos
        </button>
      </div>

      {activeTab === 'dashboard' ? <InventoryDashboard /> : (
        <div className="max-w-7xl mx-auto px-6 md:px-10 pb-10 mt-6">
          <AdminPanel />
        </div>
      )}
      
      {/* Floating AI Bot */}
      <AIAssistant />
    </main>
  );
}
