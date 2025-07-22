import React, { useState } from 'react';
import { Prospect } from '../types';
import ProspectCard from './ProspectCard';
import { Grid, List, Download, Filter } from 'lucide-react';

interface ResultsGridProps {
  prospects: Prospect[];
  onStatusUpdate: (id: string, status: Prospect['status']) => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ prospects, onStatusUpdate }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'websiteAge' | 'designScore'>('websiteAge');
  const [filterText, setFilterText] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const sortedProspects = [...prospects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'websiteAge':
        return b.websiteAge - a.websiteAge;
      case 'designScore':
        return a.designScore - b.designScore;
      default:
        return 0;
    }
  });

  // Filtrage par champ texte (nom, email, site) et statut
  const filteredProspects = sortedProspects.filter(p => {
    let match = true;
    if (filterText) {
      const text = filterText.toLowerCase();
      match = (
        p.name.toLowerCase().includes(text) ||
        p.contact?.email?.toLowerCase().includes(text) ||
        p.website.toLowerCase().includes(text)
      );
    }
    if (filterStatus !== 'all') {
      match = match && p.status === filterStatus;
    }
    return match;
  });

  const exportData = () => {
    const csvData = prospects.map(p => ({
      Nom: p.name,
      Site: p.website,
      Email: p.contact.email,
      Téléphone: p.contact.phone || '',
      Secteur: p.sector,
      Région: p.region,
      'Âge du site': `${p.websiteAge} ans`,
      'Score design': `${p.designScore}/10`,
      Statut: p.status
    }));
    
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospects.csv';
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Résultats de prospection
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {prospects.length} prospect{prospects.length > 1 ? 's' : ''} trouvé{prospects.length > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder="Filtrer par nom, email ou site"
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Tous statuts</option>
              <option value="new">Non contacté</option>
              <option value="contacted">Contacté</option>
              <option value="interested">Intéressé</option>
              <option value="converted">Converti</option>
              <option value="rejected">Refusé</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'websiteAge' | 'designScore')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="websiteAge">Âge du site</option>
              <option value="name">Nom</option>
              <option value="designScore">Score design</option>
            </select>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={exportData}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>
      {/* Affichage filtré */}
      <div className="p-6">
        {filteredProspects.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Aucun prospect ne correspond à vos filtres.
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProspects.map(prospect => (
              <ProspectCard key={prospect.id} prospect={prospect} onStatusUpdate={onStatusUpdate} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsGrid;