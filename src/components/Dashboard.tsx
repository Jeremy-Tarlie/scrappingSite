import React from 'react';
import { Prospect } from '../types';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Target,
  Database,
  Search
} from 'lucide-react';
import { databaseService } from '../services/database';

interface DashboardProps {
  prospects: Prospect[];
}

const Dashboard: React.FC<DashboardProps> = ({ prospects }) => {
  const [searchHistory, setSearchHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await databaseService.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.status === 'new').length,
    contacted: prospects.filter(p => p.status === 'contacted').length,
    interested: prospects.filter(p => p.status === 'interested').length,
    converted: prospects.filter(p => p.status === 'converted').length,
  };

  const conversionRate = stats.contacted > 0 ? (stats.converted / stats.contacted * 100).toFixed(1) : '0';

  const recentProspects = prospects
    .filter(p => p.status === 'new')
    .slice(0, 5);

  const urgentProspects = prospects
    .filter(p => p.websiteAge >= 8 && p.status === 'new')
    .slice(0, 5);

  const statCards = [
    {
      title: 'Total Prospects',
      value: stats.total,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Nouveaux',
      value: stats.new,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Contactés',
      value: stats.contacted,
      icon: Mail,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Intéressés',
      value: stats.interested,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Convertis',
      value: stats.converted,
      icon: CheckCircle,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Taux conversion',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard de prospection
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de vos activités de prospection et des opportunités détectées.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Prospects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Nouveaux prospects</span>
          </h3>
          
          {recentProspects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun nouveau prospect trouvé. Lancez une recherche pour découvrir des opportunités !
            </p>
          ) : (
            <div className="space-y-3">
              {recentProspects.map(prospect => (
                <div key={prospect.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{prospect.name}</h4>
                    <p className="text-sm text-gray-600">{prospect.sector}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {prospect.websiteAge} ans
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: {prospect.designScore}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Search className="w-5 h-5 text-green-600" />
            <span>Historique des recherches</span>
          </h3>
          
          {searchHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune recherche effectuée.
            </p>
          ) : (
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map(search => (
                <div key={search.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {search.query || 'Recherche générale'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(search.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {search.results_count} résultats
                    </div>
                    <div className="text-xs text-gray-500">
                      {search.filters?.sector || 'Tous secteurs'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Urgent Prospects */}
      {urgentProspects.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Prospects prioritaires (sites très anciens)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentProspects.map(prospect => (
              <div key={prospect.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <h4 className="font-medium text-gray-900">{prospect.name}</h4>
                  <p className="text-sm text-gray-600">{prospect.contact?.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">
                    {prospect.websiteAge} ans
                  </div>
                  <div className="text-xs text-gray-500">
                    Score: {prospect.designScore}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sector Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Répartition par secteur
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(
            prospects.reduce((acc, p) => {
              acc[p.sector] = (acc[p.sector] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([sector, count]) => (
            <div key={sector} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{sector}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;