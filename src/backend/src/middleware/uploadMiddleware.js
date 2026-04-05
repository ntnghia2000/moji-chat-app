import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 1024 * 1024 * 5, // 1MB
    },
});

/**
 * 
 * @param {*} buffer: raw binary data of an image.
 * @param {*} options: cloudinary options 
 * @returns 
 */
export const uploadImageFromBuffer = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "moji_chat/avatars",
            resource_type: "image",
            transformation: [{ wight: 200, height: 200, crop: 'fill' }],
            ...options,
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                /** result: contain url & id of image */
                resolve(result);
            }
        });
        uploadStream.end(buffer);
    });
}