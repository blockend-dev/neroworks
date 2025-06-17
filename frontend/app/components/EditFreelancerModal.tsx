"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import { uploadToIPFS } from "@/utils/uploadToIPFS"

const EditFreelancerModal = ({ freelancer, onClose, onSave, darkMode }) => {
  const [hydrated, setHydrated] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    country: '',
    gigTitle: '',
    gigDescription: '',
    starting_price: 0,
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    if (!freelancer || hydrated) return;

    setFormData({
      name: freelancer.name || '',
      skills: freelancer.skills || '',
      country: freelancer.country || '',
      gigTitle: freelancer.gigTitle || '',
      gigDescription: freelancer.gitDescription || '',
      starting_price: freelancer.starting_price || 0,
      images: freelancer.images || []
    });

    if (freelancer.images?.length > 0) {
      const previews = freelancer.images.map(img => ({
        url: img,
        name: 'Current Image'
      }));
      setPreviewImages(previews);
    }

    setHydrated(true);
  }, [freelancer, hydrated]);


  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      images: previewImages.filter(img => !img.file).map(img => img.url)
    }));
  }, [previewImages]);


  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 2,
    onDrop: async acceptedFiles => {
      setUploading(true);
      try {
        const newPreviewImages = acceptedFiles.map(file => ({
          url: URL.createObjectURL(file),
          name: file.name,
          file
        }));

        setPreviewImages(prev => [...prev, ...newPreviewImages]);
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setUploading(false);
      }
    }
  });

  const removeImage = (index) => {
    setPreviewImages(prev => {
      const removed = prev[index];
      if (removed?.url && removed.file) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true)
    // Convert uploaded files to IPFS links 
    const uploadedImages = await Promise.all(
      previewImages
        .filter(img => img.file) // Only new files
        .map(async img => {

          const cid = await uploadToIPFS(img.file);
          console.log(cid)
          return cid
        })
    );

    // Combine existing images (without file property) with new uploads
    const allImages = [
      ...previewImages.filter(img => !img.file).map(img => img.url),
      ...uploadedImages
    ];

    // console.log()
    await onSave({
      ...formData,
      images: allImages
    });

    setLoading(false)
    setHydrated(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`rounded-xl p-6 w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                <input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Starting Price (ETH)</label>
                <input
                  type="number"
                  name="starting_price"
                  value={formData.starting_price}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gig Title</label>
                <input
                  name="gigTitle"
                  value={formData.gigTitle}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gig Description</label>
                <textarea
                  name="gigDescription"
                  value={formData.gigDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profile & Gig Images</label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors ${darkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                >
                  <input {...getInputProps()} />
                  <FiUpload className="mx-auto text-2xl mb-2 text-indigo-500" />
                  <p className="text-sm">
                    Drag & drop images here, or click to select (Max 2 images)
                  </p>
                  {uploading && <p className="text-xs mt-2">Uploading...</p>}
                </div>

                {/* Image Previews */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2 rounded-lg border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                }`}
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
};

export default EditFreelancerModal 