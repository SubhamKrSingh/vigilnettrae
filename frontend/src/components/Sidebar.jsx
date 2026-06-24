import React from 'react';
import { Shield, Map, Search, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Map },
    { path: '/investigation', label: 'Investigation', icon: Search },
    { path: '/packages', label: 'Intel Packages', icon: FileText },
  ];

  return (
    <div className="w-[260px] bg-surface border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 bg-blue rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold">VigilNet</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-card border border-blue/30 text-white'
                  : 'text-muted hover:text-text hover:bg-card'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-teal">
            <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
            <span className="text-sm font-medium">Detection Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
