const CLOUDINARY_CLOUD_NAME = "dvkz8hsbo";
const CLOUDINARY_UPLOAD_PRESET = "connect_sphere_upload"; 

/**
 * Uploads a file to Cloudinary.
 * @param {File} file The file to upload.
 * @returns {Promise<object>} A promise that resolves with the Cloudinary upload response.
 */
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Cloudinary upload failed.");
        }

        const data = await response.json();
        return data; // This object contains the secure_url, public_id, etc.
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        throw error;
    }
};

/**
 * Deletes a file from Cloudinary.
 * NOTE: This requires a backend with your API secret for authentication.
 * This is a placeholder for a future backend/serverless function implementation.
 * @param {string} publicId The public_id of the file to delete.
 */
export const deleteFile = async (publicId) => {
    console.warn(
        "File deletion from Cloudinary requires a secure backend call and is not implemented on the client-side."
    );
    // In a real app, you would make a request to your own backend here,
    // which would then make a signed API call to Cloudinary to delete the resource.
    return Promise.resolve();
};
