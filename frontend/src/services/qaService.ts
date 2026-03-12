import axiosInstance from "@/config/api";
import { ApiResponse, ApiPagination, QARequest, QAResponse } from "@/types";

const qaService = {
  getQuestions: async (
    courseId: string,
    lectureId?: string,
  ): Promise<ApiPagination<QAResponse>> => {
    const filters = [`course.id:'${courseId}'`];
    if (lectureId) filters.push(`lecture.id:'${lectureId}'`);
    const res = await axiosInstance.get<ApiResponse<ApiPagination<QAResponse>>>(
      "/qa/questions",
      {
        params: { filter: filters.join(" and "), size: 20, page: 0 },
      },
    );
    return res.data.data;
  },

  async getAnswers(questionId: string): Promise<ApiPagination<QAResponse>> {
    const res = await axiosInstance.get("/qa/answers", {
      params: {
        filter: `question.id:'${questionId}'`,
        pageSize: 50,
        page: 1,
      },
    });
    return res.data.data;
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
