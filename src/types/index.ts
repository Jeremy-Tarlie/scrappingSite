export interface Prospect {
    id: string;
    name: string;
    description: string;
    website: string;
    websiteAge: number;
    sector: string;
    region: string;
    contact: {
      email: string;
      phone?: string;
      address: string;
    };
    technicalIssues: string[];
    designScore: number;
    status: 'new' | 'contacted' | 'interested' | 'rejected' | 'converted';
    lastContact?: Date;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface SearchFilters {
    query?: string;
    sector: string;
    region: string;
    websiteAge: string;
  }
  
  export interface DashboardStats {
    totalProspects: number;
    newProspects: number;
    contacted: number;
    interested: number;
    converted: number;
    conversionRate: number;
  }
  
  export interface SearchHistoryItem {
    id: string;
    query: string;
    filters: SearchFilters;
    results_count: number;
    created_at: string;
  }