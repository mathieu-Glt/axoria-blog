import cloudinary from "../../cloudinay";

export async function uploadToCloudinary(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "axoria",
          public_id: fileName, // nom du fichier sans extension
          resource_type: "auto", // gère images + PDF
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      )
      .end(fileBuffer);
  });
}
