import axiosInstance from "@/config/api";

const BASE_URL = "http://localhost:8080";

const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<{ data: { url: string } }>(
      "/upload/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return `${BASE_URL}${response.data.data.url}`;
  },

  uploadVideo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<{ data: { url: string } }>(
      "/upload/video",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return `${BASE_URL}${response.data.data.url}`;
  },
};

export default uploadService;