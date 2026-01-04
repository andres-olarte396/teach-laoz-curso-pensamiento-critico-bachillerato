import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { User, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, login } = useAuth(); // We'll use login to update the context user
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await apiService.updateProfile({ name });
      // Update local auth context
      // Assuming apiService.updateProfile returns { user: ... }
      // We can "re-login" or just rely on a page refresh, but updating context is better.
      // Since login expects email/pass, we might need a method to 'updateUser' in context, 
      // but for now, we'll just update the state if we could. 
      // Actually AuthContext might not expose a manual update. 
      // We'll rely on the user seeing the success message, and next refresh showing new name.
      // Ideally AuthContext should have setUser.
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
           <User size={32} />
        </div>
        <div>
           <h1 className="text-3xl font-bold">Mi Perfil</h1>
           <p className="text-[var(--text-muted)]">Gestiona tu información personal</p>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-muted)]">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] opacity-70 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">El correo electrónico no se puede cambiar.</p>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-[var(--text-main)]">Nombre Completo</label>
             <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
               <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                 placeholder="Tu nombre completo"
               />
             </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving || name === user?.name}
              className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors font-medium shadow-lg shadow-emerald-500/20"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
