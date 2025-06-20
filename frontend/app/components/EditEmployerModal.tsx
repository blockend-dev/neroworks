'use client';

import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useState, useEffect } from 'react';
import { uploadToIPFS } from '@/utils/uploadToIPFS';

interface Employer {
  name: string;
  industry: string;
  country: string;
  image?: string;
}

interface EditEmployerModalProps {
  employer: Employer;
  onClose: () => void;
  onSave: (data: {
    name: string;
    industry: string;
    country: string;
    imageURI: string;
  }) => Promise<void>;
  darkMode?: boolean;
}

export default function EditEmployerModal({
  employer,
  onClose,
  onSave,
  darkMode = false,
}: EditEmployerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    country: '',
    imageURI: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (employer && !hydrated) {
      setFormData({
        name: employer.name || '',
        industry: employer.industry || '',
        country: employer.country || '',
        imageURI: employer.image || '',
      });
      setPreviewImage(employer.image || null);
      setHydrated(true);
    }
  }, [employer, hydrated]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        const file = acceptedFiles[0];
        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
      } finally {
        setUploading(false);
      }
    },
  });

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, imageURI: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageURI = formData.imageURI;

    if (imageFile) {
      imageURI = await uploadToIPFS(imageFile);
    }

    await onSave({
      name: formData.name,
      industry: formData.industry,
      country: formData.country,
      imageURI,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`rounded-xl p-6 w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Employer Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <input
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Company Logo</label>
              {previewImage ? (
                <div className="relative group">
                  <img
                    src={previewImage}
                    alt="Company logo preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                    darkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FiUpload className="mx-auto text-2xl mb-2 text-indigo-500" />
                  <p className="text-sm">Drag & drop logo here, or click to select</p>
                  {uploading && <p className="text-xs mt-2">Uploading...</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Saving...' : loading ? 'Updating profile' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
