'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Mic, Send, Bot, User, X, Loader2 } from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatState = useChat({
    api: '/api/chat',
  });
  
  const messages = chatState?.messages || [];
  const { input = '', setInput, handleInputChange, handleSubmit, isLoading = false } = chatState || {};

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice Recognition Setup
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta comandos de voz. Usa Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Wait a tick for state to update, then submit artificially
      setTimeout(() => {
        const formEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
        handleSubmit(formEvent);
      }, 500);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center gap-2"
      >
        <Bot className="w-6 h-6" />
        <span className="font-bold pr-2">Asistente IA</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-50">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-200" />
          <h3 className="font-bold">Asistente de Inventario</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">¡Hola! Soy tu asistente inteligente.</p>
            <p className="text-xs mt-1">Dime cosas como: "Agrega 2 cajas de Boxer talla 6" o "¿Qué prendas faltan?"</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
            }`}>
              <div className="font-bold text-xs mb-1 opacity-50 flex items-center gap-1">
                {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                {m.role === 'user' ? 'Tú' : 'IA'}
              </div>
              <div>{m.content}</div>
              {/* Note: In production you might want to render tool calls cleanly */}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 text-slate-500 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <button 
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-full transition-colors flex-shrink-0 shadow-sm ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          title="Hablar (Dictado de voz)"
        >
          <Mic className="w-5 h-5" />
        </button>
        <input
          className="flex-1 border border-slate-200 rounded-full px-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50"
          value={input}
          placeholder={isListening ? "Escuchando..." : "Escribe o usa el micrófono..."}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
