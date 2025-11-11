import React from 'react';

const DEFAULT_TABS = [
  { id: 'portfoy', label: 'Portföy Optimizasyonu' },
  { id: 'simulasyon', label: 'Getiri Simülasyonu' },
  { id: 'tahmin', label: 'Fiyat Tahmini (AI)' },
  { id: 'teknik', label: 'Teknik Analiz' },
  { id: 'temel', label: 'Temel Analiz' },
  { id: 'ai_chat', label: 'AI Asistan' },
];

const TabNavigation = ({ activeTab, onTabChange, tabs = DEFAULT_TABS }) => (
  <div className="flex gap-3 mb-8 overflow-x-auto pb-2 border-b border-slate-700">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onTabChange(tab.id)}
        className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition duration-300 text-lg ${
          activeTab === tab.id
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabNavigation;
