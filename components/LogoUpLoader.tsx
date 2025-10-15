// components/LogoUploader.tsx
"use client";
import { useState } from 'react';

interface Props {
  onLogoChange: (logoData: string) => void;
}

export default function LogoUploader({ onLogoChange }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">🖼️ Logo de la Empresa</h3>
      <div className="flex items-center gap-4">
        {logoPreview && (
          <div className="w-20 h-20 border rounded overflow-hidden">
            <img 
              src={logoPreview} 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div>
          <label className="btn btn-secondary cursor-pointer">
            📸 {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-muted mt-1">Recomendado: 30x30px PNG/JPG</p>
        </div>
      </div>
    </div>
  );
}