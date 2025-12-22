export interface CertificateSubject {
  id: number;
  name: string;
  total_courses: number;
  completed_courses: number;
}

export interface CompletedCourseInfo {
  course_id: number;
  course_title: string;
  score: string;
}

export interface CertificateMetadata {
  subject: {
    id: number | null;
    name: string | null;
  } | null;
  name_en: string;
  name_cn: string;
  subject_en: string;
  subject_cn: string;
  course_titles: string[];
  completed_at?: string | null;
  first_downloaded_at?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CertificateStatusResponse {
  eligible: boolean;
  subject: CertificateSubject;
  completed_courses: CompletedCourseInfo[];
  certificate: CertificateMetadata | null;
}
