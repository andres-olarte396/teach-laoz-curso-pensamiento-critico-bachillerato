import React, { useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

import { getAvatarSrc } from '../utils/imageUtils';

interface AvatarUploadProps {
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  name: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentUrl, onUploadSuccess, name }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Constants
  const TARGET_SIZE = 256; 

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > TARGET_SIZE) {
            height = Math.round((height *= TARGET_SIZE / width));
            width = TARGET_SIZE;
          }
        } else {
          if (height > TARGET_SIZE) {
            width = Math.round((width *= TARGET_SIZE / height));
            height = TARGET_SIZE;
          }
        }

        // We want a square crop for avatars usually, but for now strict resize 
        // to fit within 256x256 while maintaining aspect ratio, 
        // OR center crop to 256x256. Let's do center crop for best avatar look.
        
        const size = Math.min(img.width, img.height);
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        // Draw center crop
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        ctx.drawImage(img, sx, sy, size, size, 0, 0, TARGET_SIZE, TARGET_SIZE);

        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg"; // Force .jpg
            const resizedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        }, 'image/jpeg', 0.9); // 90% quality JPEG
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Resize Image
      const resizedFile = await resizeImage(file);

      // 2. Upload
      const result = await apiService.uploadFile(resizedFile);
      
      // 3. Construct URL (assuming backend returns { url: ... })
      // If backend returns relative path, prepend API/Base URL if needed or handle in component
      // apiService.uploadFile implementation usually returns { url, filename }
      const avatarUrl = result.url; // Ensure this is absolute or relative from root

      onUploadSuccess(avatarUrl);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };



  return (
    <div className="relative group w-24 h-24 mx-auto md:mx-0">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--bg-surface)] shadow-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-2xl">
        {currentUrl ? (
          <img 
            src={`${getAvatarSrc(currentUrl)}?t=${Date.now()}`} 
            alt={name} 
            className="w-full h-full object-cover" 
            onError={(e) => {
                console.error('Image load failed:', e.currentTarget.src);
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-red-500');
            }}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div> 
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 p-2 bg-[var(--color-primary)] text-white rounded-full shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
        title="Cambiar foto de perfil"
      >
        {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
