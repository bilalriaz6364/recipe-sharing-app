import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Loader2 } from 'lucide-react';

export default function ImageUpload({ onImageUploaded, currentImageUrl }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `recipes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setPreview(publicUrl);
      onImageUploaded(publicUrl);

    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageUploaded('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Recipe Image
      </label>

      {preview ? (
        <div className="relative h-56 w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-3 right-3 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition shadow-lg"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-slate-400">Uploading Image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <div className="p-3 bg-slate-800 text-emerald-400 rounded-full border border-slate-700">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300 font-medium">
                Drag and drop recipe photo, or <span className="text-emerald-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-500">Supports PNG, JPG, WEBP (Max: 5MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}