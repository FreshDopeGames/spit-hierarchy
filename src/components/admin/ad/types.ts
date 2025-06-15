
export interface AdPlacement {
  id: string;
  placement_name: string;
  ad_unit_id: string;
  ad_format: "banner" | "leaderboard" | "rectangle" | "mobile-banner";
  page_name: string;
  page_route: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageTemplate {
  id: string;
  template_name: string;
  route_pattern: string;
  available_placements: string[];
}

export interface FormData {
  placement_name: string;
  ad_unit_id: string;
  ad_format: "banner" | "leaderboard" | "rectangle" | "mobile-banner";
  page_name: string;
  page_route: string;
  is_active: boolean;
}
