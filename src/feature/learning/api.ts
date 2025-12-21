import { apiClient } from "../api/client";

export interface Subject {
  SubjectID: number;
  SubjectName: string;
  SubjectDescription: string;
  icon_svg_url?: string | null;
}

export interface CourseListItem {
  CourseID: number;
  CourseTitle: string;
}

export interface CourseDetail {
  CourseID: number;
  SubjectID: number;
  CourseTitle: string;
  CourseDescription: string;
  CourseDifficulty: number;
  Content: string;
}

export interface QuestionOption {
  OptionID: number;
  OptionText: string;
}

export interface QuestionDetail {
  QuestionID: number;
  CourseID: number;
  QuestionDescription: string;
  options: QuestionOption[];
}

export interface CourseAnswerSubmissionItem {
  question_id: number;
  option_id: number;
}

export interface CourseSubmissionResponse {
  course_id: number;
  total: number;
  correct: number;
  score: number;
  best_score: number;
  improved: boolean;
  completed: boolean;
  per_question: Array<{ question_id: number; option_id: number; correct: boolean }>;
}

export interface CompletedCourseScore {
  CourseID: number;
  CourseScore: number;
}

export interface VerifyOptionResponse {
  correct: boolean;
}

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await apiClient.get<Subject[]>("/subjects/");
  return response.data;
};

export const getCoursesBySubject = async (subjectId: number): Promise<CourseListItem[]> => {
  const response = await apiClient.get<CourseListItem[]>(`/courses/subject/${subjectId}/`);
  return response.data;
};

export const getCourseDetail = async (courseId: number): Promise<CourseDetail> => {
  const response = await apiClient.get<CourseDetail>(`/courses/${courseId}/`);
  return response.data;
};

export const getQuestionIdsByCourse = async (courseId: number): Promise<number[]> => {
  const response = await apiClient.get<number[]>(`/questions/course/${courseId}/`);
  return response.data;
};

export const getQuestionDetail = async (questionId: number): Promise<QuestionDetail> => {
  const response = await apiClient.get<QuestionDetail>(`/questions/${questionId}/`);
  return response.data;
};

export const submitCourseAnswers = async (
  courseId: number,
  answers: CourseAnswerSubmissionItem[]
): Promise<CourseSubmissionResponse> => {
  const response = await apiClient.post<CourseSubmissionResponse>(`/courses/${courseId}/submit/`, {
    answers,
  });
  return response.data;
};

export const getCompletedCourseScores = async (): Promise<CompletedCourseScore[]> => {
  const response = await apiClient.get<CompletedCourseScore[]>("/courses/completed/scores/");
  return response.data;
};

export const verifyOption = async (optionId: number): Promise<VerifyOptionResponse> => {
  const response = await apiClient.get<VerifyOptionResponse>(`/options/${optionId}/verify/`);
  return response.data;
};
