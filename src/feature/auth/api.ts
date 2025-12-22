import { apiClient } from "../api/client";

export interface AuthUser {
  userID: string;
  user_name: string;
  email: string;
  License?: string;
  profile: {
    score: number;
    rank: number;
    login_streak_days: number;
    last_login_date?: string;
    has_profile_pic?: boolean;
    profile_pic_mime?: string | null;
    profile_pic_url?: string;
    bookmarked_subject_id?: number | null;
    bookmarked_subject_name?: string | null;
    bookmarked_subject_updated_at?: string | null;
  };
  total_score?: number;
  completed_course_scores?: Array<{ CourseID: number; CourseScore: number }>;
  recent_bookmarked_subjects?: Array<{
    subject_id: number;
    subject_name: string;
    bookmarked_at: string;
    subject_icon_svg_url?: string | null;
  }>;
}

export interface RegisterResponse {
  user: AuthUser;
  refresh: string;
  access: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export const registerUser = async (user_name: string, email: string, password: string, License?: string): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>("/register/", {
    user_name,
    email,
    password,
    License,
  });
  return response.data;
};

export const loginUser = async (user_name: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/login/", {
    user_name,
    password,
  });
  return response.data;
};

export const getMe = async (token?: string): Promise<AuthUser> => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get<AuthUser>("/me/", { headers });
  return response.data;
};

export interface AvailabilityResponse {
  user_name_available?: boolean;
  email_available?: boolean;
}

interface PasswordResetPayload {
  email: string;
  reset_base_url?: string;
}

export const requestPasswordReset = async (email: string, resetBaseUrl?: string) => {
  const payload: PasswordResetPayload = {
    email,
    reset_base_url: resetBaseUrl,
  };
  return apiClient.post<{ detail: string }>("/password-reset/", payload);
};

export const confirmPasswordReset = async (token: string, email: string, newPassword: string) => {
  return apiClient.post<{ detail: string }>("/password-reset/confirm/", {
    token,
    email,
    new_password: newPassword,
  });
};

export const checkAvailability = async (params: { user_name?: string; email?: string }): Promise<AvailabilityResponse> => {
  const response = await apiClient.get<AvailabilityResponse>("/availability/", {
    params,
  });
  return response.data;
};

export const getMyProfilePicBlob = async (): Promise<Blob> => {
  const response = await apiClient.get<Blob>("/me/profile-pic/", {
    responseType: "blob",
  });
  return response.data;
};

export const uploadMyProfilePic = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiClient.put<{ detail: string; profile_pic_mime?: string }>("/me/profile-pic/", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteMyProfilePic = async () => {
  return apiClient.delete<{ detail: string }>("/me/profile-pic/");
};

export const setBookmarkedSubject = async (subjectId: number) => {
  const response = await apiClient.post<{
    bookmarked_subject_id: number;
    bookmarked_subject_name: string;
    bookmarked_subject_updated_at: string;
  }>("/me/bookmarked-subject/", {
    subject_id: subjectId,
  });
  return response.data;
};

export const removeBookmarkedSubject = async (subjectId: number) => {
  const response = await apiClient.delete<{ detail: string }>(`/me/bookmarked-subject/${subjectId}/`);
  return response.data;
};

export const changeMyPassword = async (currentPassword: string, newPassword: string) => {
  const response = await apiClient.post<{ detail: string }>("/me/change-password/", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};
