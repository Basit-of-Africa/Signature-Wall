export interface SignatureStyle {
  bgColor: string;
  textColor: string;
  rotation: number;
  fontStyle: string; // "font-handwritten" | "font-sans" | "font-display"
  borderStyle: string;
}

export interface Signature {
  id: string;
  name: string;
  graduation_year: string;
  department_optional: string;
  message: string;
  created_at: string;
  status: "pending" | "approved" | "flagged";
  style_variant: SignatureStyle;
  country_optional: string;
}

export interface CommunityMetrics {
  totalSignatures: number;
  setsCount: number;
  deptCount: number;
  countriesCount: number;
  newest: Signature[];
}
