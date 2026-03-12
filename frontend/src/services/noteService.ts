import axiosInstance from '@/config/api';
import { ApiResponse, LectureNoteCreationRequest, LectureNoteUpdateRequest, LectureNoteResponse } from '@/types';

const noteService = {
  getNotesByLecture: async (lectureId: string): Promise<LectureNoteResponse[]> => {
    const res = await axiosInstance.get<ApiResponse<LectureNoteResponse[]>>(
      `/lecture-notes/lecture/${lectureId}`
    );
    return res.data.data;
  },

  create: async (data: LectureNoteCreationRequest): Promise<LectureNoteResponse> => {
    const res = await axiosInstance.post<ApiResponse<LectureNoteResponse>>('/lecture-notes', data);
    return res.data.data;
  },

  update: async (id: string, data: LectureNoteUpdateRequest): Promise<LectureNoteResponse> => {
    const res = await axiosInstance.patch<ApiResponse<LectureNoteResponse>>(`/lecture-notes/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/lecture-notes/${id}`);
  },
};

export default noteService;