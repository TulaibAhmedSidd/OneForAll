import cloudinary from './cloudinary';

export default async function uploadImageToCloudinary(fileBuffer, folder = 'game-prizes') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(fileBuffer);
  });
}
