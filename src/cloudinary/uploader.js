import cloudinary from "./cloudinary.js";
export const uploadImages = async (images) => {
  const imagesUrl = [];
  for (const image in images) {
    const result = await cloudinary.uploader.upload(images[image].base64);

    imagesUrl.push({ imgID: result.public_id, url: result.secure_url });
  }

  return imagesUrl;
};
