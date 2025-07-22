import { supabase } from '../lib/supabase';
import { Prospect, SearchHistoryItem, SearchFilters } from '../types';

export class DatabaseService {
  async saveProspects(prospects: Prospect[]): Promise<void> {
    try {
      // Mapper les prospects pour correspondre au schéma de la base de données
      const mappedProspects = prospects.map(prospect => ({
        id: prospect.id,
        name: prospect.name,
        description: prospect.description,
        website: prospect.website,
        website_age: prospect.websiteAge,
        sector: prospect.sector,
        region: prospect.region,
        contact_email: prospect.contact.email,
        contact_phone: prospect.contact.phone || null,
        contact_address: prospect.contact.address,
        technical_issues: prospect.technicalIssues,
        design_score: prospect.designScore,
        status: prospect.status,
        notes: prospect.notes || null
      }));

      const { error } = await supabase
        .from('prospects')
        .upsert(mappedProspects, { onConflict: 'website' });

      if (error) {
        console.error('Erreur sauvegarde prospects:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur base de données:', error);
      throw error;
    }
  }

  async getProspects(): Promise<Prospect[]> {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération prospects:', error);
        throw error;
      }

      // Mapper les données de la base vers le format de l'application
      const mappedData = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        website: row.website,
        websiteAge: row.website_age,
        sector: row.sector,
        region: row.region,
        contact: {
          email: row.contact_email,
          phone: row.contact_phone,
          address: row.contact_address
        },
        technicalIssues: row.technical_issues || [],
        designScore: row.design_score,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return mappedData;
    } catch (error) {
      console.error('Erreur base de données:', error);
      return [];
    }
  }

  async updateProspectStatus(id: string, status: Prospect['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('prospects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erreur mise à jour statut:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur base de données:', error);
      throw error;
    }
  }

  async checkIfWebsiteExists(website: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('prospects')
        .select('id')
        .eq('website', website)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur vérification website:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erreur base de données:', error);
      return false;
    }
  }

  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur historique recherches:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erreur base de données:', error);
      return [];
    }
  }

  async saveSearchQuery(query: string, filters: SearchFilters, resultsCount: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('search_history')
        .insert({
          query,
          filters,
          results_count: resultsCount,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur sauvegarde recherche:', error);
      }
    } catch (error) {
      console.error('Erreur base de données:', error);
    }
  }
}

export const databaseService = new DatabaseService();