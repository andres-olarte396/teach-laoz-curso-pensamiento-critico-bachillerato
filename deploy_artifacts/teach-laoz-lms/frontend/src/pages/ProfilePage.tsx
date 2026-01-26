import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { User, Mail, Save, AlertCircle, CheckCircle, Lock, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarUpload } from '../components/AvatarUpload';

export const ProfilePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  
  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSavingProfile(true);
    setProfileMessage(null);

    try {
      await apiService.updateProfile({ name, email, avatarUrl: user?.avatarUrl });
      setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
      // Refresh Auth Context to show new name in header/sidebar immediately
      await checkAuth(); 
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message === 'Email already taken' 
        ? 'El correo electrónico ya está en uso' 
        : 'Error al actualizar el perfil';
      setProfileMessage({ type: 'error', text: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
      return;
    }
    if (newPassword.length < 6) {
        setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
        return;
    }

    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      await apiService.changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message === 'Invalid current password' 
        ? 'La contraseña actual es incorrecta' 
        : 'Error al cambiar la contraseña';
      setPasswordMessage({ type: 'error', text: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
           <User size={32} />
        </div>
        <div>
           <h1 className="text-3xl font-bold">Mi Perfil</h1>
           <p className="text-[var(--text-muted)]">Gestiona tu información personal y seguridad</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <User size={20} className="text-[var(--color-primary)]" />
                Información Personal
            </h2>

            {profileMessage && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${profileMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {profileMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {profileMessage.text}
            </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                  <AvatarUpload 
                    currentUrl={user?.avatarUrl} 
                    name={user?.name || 'User'}
                    onUploadSuccess={async (url) => {
                        // Immediately update profile with new avatar, preserving current form state
                        try {
                            // Use 'name' and 'email' from state, in case user edited them
                            await apiService.updateProfile({ name, email, avatarUrl: url });
                            await checkAuth(); // Refresh context
                            setProfileMessage({ type: 'success', text: 'Foto actualizada correctamente' });
                        } catch(err) {
                            console.error(err);
                            setProfileMessage({ type: 'error', text: 'Error al actualizar la foto' });
                        }
                    }} 
                   />
                   <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
                     Recomendado: 256x256px
                   </p>
              </div>

              {/* Form Section */}
              <form onSubmit={handleProfileSubmit} className="space-y-6 flex-1 w-full">
            
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

                <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-main)]">Correo Electrónico</label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Modificar tu correo puede requerir un nuevo inicio de sesión.</p>
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                    type="submit" 
                    disabled={savingProfile || (name === user?.name && email === user?.email)}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors font-medium shadow-lg shadow-emerald-500/20"
                    >
                    {savingProfile ? (
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

        {/* Security Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Lock size={20} className="text-amber-500" />
                    Seguridad
                </h2>
                <button 
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                    {showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña'}
                </button>
            </div>
            
            <AnimatePresence>
                {showPasswordForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                         <div className="pt-6 border-t border-[var(--border-color)] mt-4">
                            {passwordMessage && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {passwordMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {passwordMessage.text}
                                </div>
                            )}

                             <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[var(--text-main)]">Contraseña Actual</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                        <input 
                                            type="password" 
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Ingresa tu contraseña actual"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--text-main)]">Nueva Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--text-main)]">Confirmar Nueva Contraseña</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg text-[var(--text-main)] focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                                placeholder="Repite la nueva contraseña"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={savingPassword || !currentPassword || !newPassword}
                                        className="flex items-center gap-2 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors font-medium shadow-lg shadow-amber-500/20"
                                    >
                                        {savingPassword ? 'Procesando...' : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                             </form>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
