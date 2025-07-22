import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { webScraperService } from '../services/webScraper';
import { databaseService } from '../services/database';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType, prospects: import('../types').Prospect[]) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    sector: 'all',
    region: 'all',
    websiteAge: 'all'
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [scannedCount, setScannedCount] = useState(0);
  const [isContinuous, setIsContinuous] = useState(false);
  const [foundProspects, setFoundProspects] = useState<import('../types').Prospect[]>([]);

  // Gestion du quota Google avec persistance locale et reset à minuit
  const GOOGLE_DAILY_QUOTA = 100;
  const GOOGLE_REQUEST_KEY = 'googleRequestCount';
  const GOOGLE_REQUEST_DATE_KEY = 'googleRequestDate';

  function getTodayDateString() {
    const now = new Date();
    return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

  const [googleRequestCount, setGoogleRequestCount] = useState(() => {
    const savedDate = localStorage.getItem(GOOGLE_REQUEST_DATE_KEY);
    const today = getTodayDateString();
    if (savedDate !== today) {
      localStorage.setItem(GOOGLE_REQUEST_DATE_KEY, today);
      localStorage.setItem(GOOGLE_REQUEST_KEY, '0');
      return 0;
    }
    const saved = localStorage.getItem(GOOGLE_REQUEST_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Incrémente le compteur à chaque requête Google
  const incrementGoogleRequest = () => {
    setGoogleRequestCount(c => {
      const next = c + 1;
      localStorage.setItem(GOOGLE_REQUEST_KEY, next.toString());
      localStorage.setItem(GOOGLE_REQUEST_DATE_KEY, getTodayDateString());
      return next;
    });
  };

  // Reset auto à minuit (même si l'app reste ouverte)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateString();
      const savedDate = localStorage.getItem(GOOGLE_REQUEST_DATE_KEY);
      if (savedDate !== today) {
        setGoogleRequestCount(0);
        localStorage.setItem(GOOGLE_REQUEST_DATE_KEY, today);
        localStorage.setItem(GOOGLE_REQUEST_KEY, '0');
      }
    }, 60 * 1000); // vérifie chaque minute
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (googleRequestCount >= GOOGLE_DAILY_QUOTA) return;
    setIsScanning(true);
    setScanProgress('Initialisation du scan...');
    setScannedCount(webScraperService.getScrapedUrlsCount());
    
    try {
      setScanProgress('Recherche de prospects sur le web...');
      
      const prospects = await (async () => {
        incrementGoogleRequest();
        return await webScraperService.searchProspects(
          filters.sector,
          filters.region,
          filters.websiteAge,
          filters.query
        );
      })();
      
      setScanProgress('Sauvegarde des nouveaux prospects...');
      
      // Sauvegarder les nouveaux prospects
      if (prospects.length > 0) {
        await databaseService.saveProspects(prospects);
        await databaseService.saveSearchQuery(
          filters.query || '',
          filters,
          prospects.length
        );
      }
      
      setScanProgress(`${prospects.length} nouveaux prospects trouvés !`);
      setScannedCount(webScraperService.getScrapedUrlsCount());
      
      onSearch(filters, prospects);
      setFoundProspects(prospects);
      
      setTimeout(() => {
        setScanProgress('');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setScanProgress('Erreur lors du scan. Veuillez réessayer.');
      setTimeout(() => {
        setScanProgress('');
      }, 3000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleContinuousSearch = async () => {
    if (googleRequestCount >= GOOGLE_DAILY_QUOTA) return;
    setIsContinuous(true);
    setScanProgress('Recherche continue en cours...');
    setFoundProspects([]);
    await webScraperService.continuousSearchProspects(
      filters.sector,
      filters.region,
      filters.websiteAge,
      filters.query,
      async (batch) => {
        if (batch.length > 0) {
          await databaseService.saveProspects(batch);
          await databaseService.saveSearchQuery(
            filters.query || '',
            filters,
            batch.length
          );
          onSearch(filters, batch);
          setFoundProspects(prev => [...prev, ...batch]);
          setScanProgress(`${batch.length} nouveaux prospects trouvés (recherche continue)...`);
        }
      },
      20,
      incrementGoogleRequest
    );
    setIsContinuous(false);
    setScanProgress('Recherche continue terminée.');
  };

  const handleStopContinuous = () => {
    webScraperService.stopContinuousSearch();
    setIsContinuous(false);
    setScanProgress('Recherche continue arrêtée.');
  };

  const clearScannedData = () => {
    webScraperService.clearScrapedUrls();
    setScannedCount(0);
  };

  const sectors = [
    { value: 'all', label: 'Tous les secteurs' },
    { value: 'association', label: 'Associations' },
    { value: 'restaurant', label: 'Restaurants' },
    { value: 'commerce', label: 'Commerce local' },
    { value: 'services', label: 'Services' },
    { value: 'sante', label: 'Santé' },
    { value: 'education', label: 'Éducation' }
  ];

  const regions = [
    { value: 'all', label: 'Toutes les régions' },
    { value: 'ile-de-france', label: 'Île-de-France' },
    { value: 'auvergne-rhone-alpes', label: 'Auvergne-Rhône-Alpes' },
    { value: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
    { value: 'occitanie', label: 'Occitanie' },
    { value: 'hauts-de-france', label: 'Hauts-de-France' }
  ];

  const websiteAges = [
    { value: 'all', label: 'Tous les âges' },
    { value: 'very-old', label: 'Très ancien (8+ ans)' },
    { value: 'old', label: 'Ancien (5-8 ans)' },
    { value: 'outdated', label: 'Obsolète (3-5 ans)' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>Filtres de recherche</span>
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            Requêtes Google utilisées : {googleRequestCount} / {GOOGLE_DAILY_QUOTA} <br />
            Restantes : {GOOGLE_DAILY_QUOTA - googleRequestCount}
          </div>
          {scannedCount > 0 && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Database className="w-4 h-4" />
              <span className="text-sm">{scannedCount} sites analysés</span>
              <button
                onClick={clearScannedData}
                className="text-xs text-red-600 hover:text-red-700 underline"
              >
                Réinitialiser
              </button>
            </div>
          )}
          {isScanning && (
            <div className="flex items-center space-x-2 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Scan en cours...</span>
            </div>
          )}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
            disabled={isScanning || isContinuous || googleRequestCount >= GOOGLE_DAILY_QUOTA}
          >
            <Search className="w-4 h-4" />
            <span>Lancer la recherche</span>
          </button>
          <button
            onClick={handleContinuousSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center space-x-2"
            disabled={isScanning || isContinuous || googleRequestCount >= GOOGLE_DAILY_QUOTA}
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Recherche continue</span>
          </button>
          <button
            onClick={handleStopContinuous}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center space-x-2"
            disabled={!isContinuous}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Arrêter</span>
          </button>
        </div>
      </div>

      {isContinuous && (
        <div className="text-green-700 font-semibold mt-2">Recherche continue en cours...</div>
      )}

      {scanProgress && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-600">
            {isScanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{scanProgress}</span>
          </div>
        </div>
      )}

      {/* Affichage des sites trouvés */}
      {foundProspects.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Sites trouvés :</h3>
          <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
            {foundProspects.map(site => (
              <li key={site.id} className="p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-medium text-gray-900">{site.name}</span>
                  <span className="ml-2 text-sm text-gray-500">{site.sector}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-2 md:mt-0">
                  <a href={site.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{site.website}</a>
                  <span className="text-sm text-gray-600">{site.contact?.email}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recherche
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder="Nom ou mot-clé..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secteur
          </label>
          <select
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {sectors.map(sector => (
              <option key={sector.value} value={sector.value}>
                {sector.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Région
          </label>
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {regions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Âge du site
          </label>
          <select
            value={filters.websiteAge}
            onChange={(e) => setFilters({ ...filters, websiteAge: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {websiteAges.map(age => (
              <option key={age.value} value={age.value}>
                {age.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSearch}
          disabled={isScanning}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Scanner le web...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Scanner le web</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Information importante</p>
            <p>
              Cette application effectue des recherches réelles sur internet et analyse les sites web 
              pour identifier des opportunités de prospection. Les données collectées sont uniquement 
              des informations publiques disponibles sur les sites web.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;