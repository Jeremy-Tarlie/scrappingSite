import React, { useState } from 'react';
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import ResultsGrid from './components/ResultsGrid';
import Dashboard from './components/Dashboard';
import { Prospect, SearchFilters as SearchFiltersType } from './types';
import { databaseService } from './services/database';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'search'>('dashboard');
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    loadProspects();
  }, []);

  const loadProspects = async () => {
    setIsLoading(true);
    try {
      const data = await databaseService.getProspects();
      setProspects(data);
      setFilteredProspects(data);
    } catch (error) {
      console.error('Erreur chargement prospects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (filters: SearchFiltersType, newProspects: Prospect[]) => {
    // Combiner les nouveaux prospects avec les existants
    const allProspects = [...prospects, ...newProspects];
    setProspects(allProspects);
    
    // Appliquer les filtres
    let filtered = allProspects;
    if (filters.sector !== 'all') {
      filtered = filtered.filter(p => p.sector === filters.sector);
    }

    if (filters.region !== 'all') {
      filtered = filtered.filter(p => p.region === filters.region);
    }

    if (filters.websiteAge !== 'all') {
      const ageMap = {
        'very-old': (age: number) => age >= 8,
        'old': (age: number) => age >= 5 && age < 8,
        'outdated': (age: number) => age >= 3 && age < 5
      };
      filtered = filtered.filter(p => ageMap[filters.websiteAge as keyof typeof ageMap](p.websiteAge));
    }

    if (filters.query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.query!.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.query!.toLowerCase())
      );
    }

    setFilteredProspects(filtered);
  };

  const updateProspectStatus = async (id: string, status: Prospect['status']) => {
    try {
      await databaseService.updateProspectStatus(id, status);
      
      const updatedProspects = prospects.map(p => 
        p.id === id ? { ...p, status } : p
      );
      setProspects(updatedProspects);
      setFilteredProspects(updatedProspects);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const handleTabChange = (tab: 'dashboard' | 'search') => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      loadProspects(); // Recharger les données pour le dashboard
    }
  };

  if (isLoading && prospects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des prospects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <Dashboard prospects={prospects} />
        ) : (
          <div className="space-y-8">
            <SearchFilters onSearch={handleSearch} />
            <ResultsGrid 
              prospects={filteredProspects} 
              onStatusUpdate={updateProspectStatus}
            />
          </div>
        )}
      </main>
    </div>
  );
}