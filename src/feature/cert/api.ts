import { apiClient } from "../api/client";
import type { CertificateStatusResponse } from "./types";

export interface CertificateStatusParams {
  subjectId: number;
}

export const getCertificateStatus = async ({ subjectId }: CertificateStatusParams): Promise<CertificateStatusResponse> => {
  const response = await apiClient.get<CertificateStatusResponse>("/cert/status/", {
    params: { subject_id: subjectId },
  });
  return response.data;
};

export interface DownloadCertificatePayload {
  subjectId: number;
  name_en?: string;
  name_cn?: string;
  subject_en?: string;
  subject_cn?: string;
}

export interface DownloadCertificateResponse extends CertificateStatusResponse {}

export const downloadCertificate = async (payload: DownloadCertificatePayload): Promise<DownloadCertificateResponse> => {
  const response = await apiClient.post<DownloadCertificateResponse>("/cert/download/", {
    subject_id: payload.subjectId,
    name_en: payload.name_en,
    name_cn: payload.name_cn,
    subject_en: payload.subject_en,
    subject_cn: payload.subject_cn,
  });
  return response.data;
};
