import axiosInstance from "@/config/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<{ data: { url: string } }>(
      "/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const url = response.data.data.url;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  },

  uploadVideo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<{ data: { url: string } }>(
      "/upload/video",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const url = response.data.data.url;
    return url.startsWith("http") ? url : `${BASE_URL}${url}`;
  },
};

export default uploadService;