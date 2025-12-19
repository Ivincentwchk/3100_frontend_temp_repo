import { apiClient } from "../api/client";

export type AchievementIconKey = "streak" | "docker" | "git";

export interface AchievementItem {
  id: string;
  type: "login_streak" | "course_newbie";
  title: string;
  description: string;
  icon: AchievementIconKey;
  target: number;
  progress: number;
  unlocked: boolean;
  required_course_ids?: number[];
}

export interface AchievementsResponse {
  login_streak_days: number;
  achievements: AchievementItem[];
}

export const getAchievements = async (): Promise<AchievementsResponse> => {
  const response = await apiClient.get<AchievementsResponse>("/achievements/");
  return response.data;
};
