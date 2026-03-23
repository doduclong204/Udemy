import axiosInstance from "@/config/api";
import { ApiResponse, ApiPagination, QARequest, QAResponse } from "@/types";

const qaService = {
  getQuestions: async (
    courseId: string,
    lectureId?: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<ApiPagination<QAResponse>> => {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const filters = [`course.id:'${courseId}'`];
    if (lectureId) filters.push(`lecture.id:'${lectureId}'`);
    const res = await axiosInstance.get<ApiResponse<ApiPagination<QAResponse>>>(
      "/qa/questions",
      {
        params: { filter: filters.join(" and "), size: pageSize, page: page },
      },
    );
    return res.data.data;
  },

  async getAnswers(questionId: string, params?: { page?: number; pageSize?: number }): Promise<ApiPagination<QAResponse>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const res = await axiosInstance.get<ApiResponse<ApiPagination<QAResponse>>>("/qa/answers", {
      params: {
        filter: `question.id:'${questionId}'`,
        size: pageSize,
        page: page,
      },
    });
    return res.data.data;
  },

  getQuestionById: async (questionId: string): Promise<QAResponse | null> => {
    try {
      const res = await axiosInstance.get<ApiResponse<ApiPagination<QAResponse>>>(
        "/qa/questions",
        { params: { filter: `id:'${questionId}'`, size: 1, page: 1 } }
      );
      return res.data.data.result[0] ?? null;
    } catch {
      return null;
    }
  },

  createQuestion: async (data: QARequest): Promise<QAResponse> => {
    const res = await axiosInstance.post<ApiResponse<QAResponse>>(
      "/qa/questions",
      data,
    );
    return res.data.data;
  },

  createAnswer: async (data: QARequest): Promise<QAResponse> => {
    const res = await axiosInstance.post<ApiResponse<QAResponse>>(
      "/qa/answers",
      data,
    );
    return res.data.data;
  },
};

export default qaService;