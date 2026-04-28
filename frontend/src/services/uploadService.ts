import axiosInstance from "@/config/api";

const CLOUDINARY_BASE =
  import.meta.env.VITE_CLOUDINARY_BASE_URL || "https://api.cloudinary.com/v1_1";

type SigResult = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: string;
};

// Cache signature theo folder:resourceType để tránh gọi API nhiều lần khi upload song song
const sigCache = new Map<string, SigResult>();

const getSignature = async (
  folder: string,
  resourceType: "image" | "video"
): Promise<SigResult> => {
  const key = `${folder}:${resourceType}`;
  if (sigCache.has(key)) return sigCache.get(key)!;

  const res = await axiosInstance.get("/upload/signature", {
    params: { folder, resource_type: resourceType },
  });
  const sig = res.data.data as SigResult;
  sigCache.set(key, sig);
  return sig;
};

// Xoá cache sau mỗi batch upload (gọi khi submit xong hoặc lỗi)
export const clearSignatureCache = () => sigCache.clear();

const CHUNK_SIZE = 20 * 1024 * 1024;

// Giữ đúng 2 chữ số sau dấu phẩy, không vượt quá 100
const toPercent = (value: number) =>
  Math.min(100, Math.floor(value * 100) / 100);

const uploadService = {
  uploadImage: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<string> => {
    const sig = await getSignature("udemy/images", "image");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", sig.signature);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("api_key", sig.apiKey);
    formData.append("folder", sig.folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(toPercent((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url as string);
        } else {
          reject(new Error("Upload ảnh thất bại"));
        }
      });

      xhr.addEventListener("error", () =>
        reject(new Error("Lỗi mạng khi upload ảnh"))
      );

      xhr.open("POST", `${CLOUDINARY_BASE}/${sig.cloudName}/image/upload`);
      xhr.send(formData);
    });
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
            onProgress(toPercent(overall));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            secureUrl = data.secure_url;
            resolve();
          } else {
            reject(new Error(`Chunk ${chunkIndex + 1} upload video thất bại`));
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