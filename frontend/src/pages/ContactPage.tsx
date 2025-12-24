import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Mail, User, MessageSquare, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await apiService.submitContact(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-20"
    >
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Contáctanos</h1>
        <p className="text-slate-400">¿Tienes alguna duda o sugerencia? Envíanos un mensaje.</p>
      </div>

      {status === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center"
        >
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">¡Mensaje Enviado!</h3>
          <p className="text-slate-400 mb-6">Hemos recibido tu mensaje correctamente. Te responderemos lo antes posible.</p>
          <button 
            onClick={() => setStatus('idle')}
            className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
          >
            Enviar otro mensaje
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nombre</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Asunto</label>
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                placeholder="¿Sobre qué quieres hablarnos?"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Mensaje</label>
            <textarea
              name="message"
              required
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600 resize-none"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Enviando...
              </>
            ) : (
              <>
                <Send size={20} />
                Enviar Mensaje
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
};
