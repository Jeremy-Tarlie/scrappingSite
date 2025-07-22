import React, { useState } from 'react';
import { Prospect } from '../types';
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Star,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';

interface ProspectCardProps {
  prospect: Prospect;
  viewMode: 'grid' | 'list';
  onStatusUpdate: (id: string, status: Prospect['status']) => void;
}

const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, viewMode, onStatusUpdate }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: Prospect['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'interested': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Prospect['status']) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'contacted': return 'Contacté';
      case 'interested': return 'Intéressé';
      case 'rejected': return 'Refusé';
      case 'converted': return 'Converti';
      default: return status;
    }
  };

  const getDesignScoreColor = (score: number) => {
    if (score <= 3) return 'text-red-600';
    if (score <= 6) return 'text-orange-600';
    return 'text-green-600';
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{prospect.name}</h3>
            <p className="text-sm text-gray-500">{prospect.sector} • {prospect.region}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">{prospect.websiteAge} ans</div>
            <div className="text-xs text-gray-500">Âge du site</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-medium ${getDesignScoreColor(prospect.designScore)}`}>
              {prospect.designScore}/10
            </div>
            <div className="text-xs text-gray-500">Design</div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
            {getStatusLabel(prospect.status)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {prospect.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {prospect.description}
            </p>
          </div>
          <div className="relative ml-4">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                <button
                  onClick={() => {onStatusUpdate(prospect.id, 'contacted'); setShowActions(false);}}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Clock className="w-3 h-3" />
                  <span>Contacté</span>
                </button>
                <button
                  onClick={() => {onStatusUpdate(prospect.id, 'interested'); setShowActions(false);}}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>Intéressé</span>
                </button>
                <button
                  onClick={() => {onStatusUpdate(prospect.id, 'rejected'); setShowActions(false);}}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <XCircle className="w-3 h-3" />
                  <span>Refusé</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prospect.status)}`}>
            {getStatusLabel(prospect.status)}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {prospect.sector}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Âge du site</span>
            <span className="text-sm font-medium text-red-600">
              {prospect.websiteAge} ans
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Score design</span>
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${getDesignScoreColor(prospect.designScore)}`} />
              <span className={`text-sm font-medium ${getDesignScoreColor(prospect.designScore)}`}>
                {prospect.designScore}/10
              </span>
            </div>
          </div>
        </div>

        {prospect.technicalIssues.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Problèmes détectés</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {prospect.technicalIssues.slice(0, 2).map((issue, index) => (
                <span
                  key={index}
                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded"
                >
                  {issue}
                </span>
              ))}
              {prospect.technicalIssues.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{prospect.technicalIssues.length - 2} autres
                </span>
              )}
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <a
              href={`mailto:${prospect.contact.email}`}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm truncate">{prospect.contact.email}</span>
            </a>
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          {prospect.contact.phone && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{prospect.contact.phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm truncate">{prospect.contact.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectCard;