import cloudinary from "cloudinary";
const uploadImage = async (file: any, folderName: string) => {
  const imageUrl = await cloudinary.v2.uploader.upload(file, {
    folder: folderName,
  });
  return imageUrl;
};

export { uploadImage };
