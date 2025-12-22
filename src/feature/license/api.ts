import { apiClient } from "../api/client";

export interface LicenseStatusResponse {
  has_license: boolean;
  pending_request: boolean;
  pending_code: string | null;
}

export const getLicenseStatus = async (): Promise<LicenseStatusResponse> => {
  const response = await apiClient.get<LicenseStatusResponse>("/license/");
  return response.data;
};

export const requestLicense = async (): Promise<{ detail: string }> => {
  const response = await apiClient.post<{ detail: string }>("/license/request/");
  return response.data;
};

export const redeemLicense = async (code: string): Promise<{ detail: string; license_code?: string }> => {
  const response = await apiClient.post<{ detail: string; license_code?: string }>("/license/redeem/", {
    code,
  });
  return response.data;
};
