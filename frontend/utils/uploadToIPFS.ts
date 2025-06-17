 import { toast } from 'react-toastify'
import axios from 'axios'
 
 export const uploadToIPFS = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Add optional metadata
    formData.append('pinataMetadata', JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'neroworks-profile-updates',
        timestamp: new Date().toISOString()
      }
    }));

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_KEY,
            'pinata_secret_api_key': process.env.NEXT_PUBLIC_SECRET_KEY,
            'Content-Type': 'multipart/form-data',
          },
          maxBodyLength: Infinity, // Needed for larger files
          maxContentLength: Infinity,
        }
      );

      if (response.data.IpfsHash) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        // toast.success('Image uploaded to IPFS successfully!');
        return ipfsUrl;
      } else {
        throw new Error('Invalid response from Pinata');
      }
    } catch (error) {
      console.error('IPFS upload error:', error);

      let errorMessage = 'Failed to upload image to IPFS';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error ||
          error.message ||
          'Network error during upload';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw error; // Re-throw for handling in calling function
    } finally {
    }
  };
