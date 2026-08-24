import { Property } from "./data/properties";

export interface AiMatch {
  id: string;
  score: number;
  reason: string;
}

export interface AiMatchResponse {
  advisorSummary: string;
  matches: AiMatch[];
}

export interface PropertyFilter {
  searchQuery: string;
  priceRange: [number, number];
  type: string; // 'All', 'House', 'Condo', 'Apartment', 'Townhouse'
  beds: string; // 'All', '1+', '2+', '3+', '4+', '5+'
  barangay: string; // 'All', 'Barangay Tabing Dagat', 'Barangay Pipisik', etc.
  selectedTags: string[];
}
