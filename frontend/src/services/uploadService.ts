import axiosInstance from "@/config/api";

const CLOUDINARY_BASE = import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://api.cloudinary.com/v1_1";

const getSignature = async (folder: string, resourceType: "image" | "video") => {
  const res = await axiosInstance.get("/upload/signature", {
    params: { folder, resource_type: resourceType },
  });
  return res.data.data as {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    resourceType: string;
  };
};

const CHUNK_SIZE = 20 * 1024 * 1024;

const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const sig = await getSignature("udemy/images", "image");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", sig.signature);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("api_key", sig.apiKey);
    formData.append("folder", sig.folder);

    const res = await fetch(
      `${CLOUDINARY_BASE}/${sig.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!res.ok) throw new Error("Upload ảnh thất bại");
    const data = await res.json();
    return data.secure_url as string;
  },

  uploadVideo: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    const sig = await getSignature("udemy/videos", "video");

    const uploadUrl = `${CLOUDINARY_BASE}/${sig.cloudName}/video/upload`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uniqueUploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    let secureUrl = "";

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("signature", sig.signature);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("api_key", sig.apiKey);
      formData.append("folder", sig.folder);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            const chunkProgress = e.loaded / e.total;
            const overall = ((chunkIndex + chunkProgress) / totalChunks) * 100;
            onProgress(Math.round(overall));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            secureUrl = data.secure_url;
            resolve();
          } else {
            reject(new Error(`Chunk ${chunkIndex + 1} upload thất bại`));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error(`Chunk ${chunkIndex + 1} lỗi mạng`))
        );

        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader(
          "Content-Range",
          `bytes ${start}-${end - 1}/${file.size}`
        );
        xhr.setRequestHeader("X-Unique-Upload-Id", uniqueUploadId);
        xhr.send(formData);
      });
    }

    return secureUrl;
  },
};

export default uploadService;