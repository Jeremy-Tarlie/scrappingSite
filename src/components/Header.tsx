import React from 'react';
import { Search, BarChart3, Download, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'search';
  onTabChange: (tab: 'dashboard' | 'search') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ProspectScraper</h1>
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>
              <button
                onClick={() => onTabChange('search')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Recherche</span>
                </div>
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;