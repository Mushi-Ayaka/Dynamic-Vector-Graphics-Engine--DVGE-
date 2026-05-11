import React, { useState } from 'react';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

interface UpdateModalProps {
  isOpen: boolean;
  releaseNotes: string;
  onUpdate: () => void;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, releaseNotes, onUpdate, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    onUpdate();
    // No cerramos el modal, mostramos spinner hasta que la app se reinicie o cierre.
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div
        className="w-full max-w-md bg-[#0f0f0f] border border-[#222] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#222] bg-[#151515]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#E44C30]" />
            <h2 className="text-lg font-medium text-white tracking-wide">Actualización Disponible</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-[#aaa] mb-4">
            Hay una nueva versión de Ember Motion Studio lista para instalar. Te recomendamos actualizar para disfrutar de las últimas mejoras y correcciones.
          </p>

          {releaseNotes && (
            <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
              <h3 className="text-xs uppercase tracking-wider text-[#666] mb-2 font-semibold">Novedades:</h3>
              <p className="text-sm text-[#eee]">{releaseNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-[#888] bg-transparent border border-[#333] hover:bg-[#222] hover:text-white rounded-md transition-colors disabled:opacity-50"
            >
              Más tarde
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-5 py-2 text-sm font-medium text-white bg-[#E44C30] hover:bg-[#ff5a3d] rounded-md transition-colors flex items-center gap-2 disabled:opacity-80"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Descargando e Instalando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Instalar Ahora
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};
