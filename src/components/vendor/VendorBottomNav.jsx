import React from 'react';
import { Home, Plus, Package, HelpCircle } from 'lucide-react';
import { translations } from '../../locales/translations';

export default function VendorBottomNav({
  lang,
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenHelpline
}) {
  const t = translations[lang] || translations.hi;
  const vp = t.vendorPortal;

  return (
    <nav className="vendor-bottom-nav">
      {/* 1. Home Tab */}
      <button 
        className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
      >
        <Home size={20} />
        <span className="nav-tab-label devanagari">{vp.navHome}</span>
      </button>

      {/* 2. Big Center + Add Product Button */}
      <div className="nav-center-add-wrapper">
        <button 
          className="center-add-action-btn"
          onClick={onOpenAddModal}
          title="नया सामान जोड़ें / Add New Product"
        >
          <Plus size={28} color="white" strokeWidth={2.8} />
        </button>
        <span className="center-add-text devanagari">{vp.navAdd}</span>
      </div>

      {/* 3. Stock & Products Tab */}
      <button 
        className={`nav-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
        onClick={() => onSelectTab('stock')}
      >
        <Package size={20} />
        <span className="nav-tab-label devanagari">{vp.navStock}</span>
      </button>

      {/* 4. Helpline Tab */}
      <button 
        className="nav-tab-btn"
        onClick={onOpenHelpline}
      >
        <HelpCircle size={20} />
        <span className="nav-tab-label devanagari">{vp.navHelp}</span>
      </button>
    </nav>
  );
}
