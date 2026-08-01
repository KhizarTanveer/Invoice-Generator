import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Package, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';

const LOGO_URL = "https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  onLogout,
  mobileOpen,
  setMobileOpen 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-invoice', label: 'New Invoice', icon: PlusCircle, highlight: true },
    { id: 'history', label: 'Invoice History', icon: FileText },
    { id: 'products', label: 'Products Catalogue', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Solid Dark Forest Green Sidebar (Zero Glass/Blur) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 bg-[#06241b] text-white flex flex-col border-r border-[#0d3b2e] transition-all duration-300 ease-in-out shadow-2xl
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-[#0d3b2e]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
              <img 
                src={LOGO_URL} 
                alt="UK Chef Logo" 
                className="w-full h-full object-cover rounded-lg" 
              />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h1 className="font-black text-white text-lg tracking-tight leading-tight">UK CHEF</h1>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Food Wholesale</span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-[#0c4031] hover:bg-[#125441] text-white transition-colors border border-emerald-700/40"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-black tracking-wider text-emerald-400/90 uppercase mb-2">Main Menu</p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 group relative text-white
                  ${isActive 
                    ? 'bg-[#107054] text-white shadow-md font-black' 
                    : item.highlight 
                      ? 'bg-[#0c4031] text-white hover:bg-[#125441] border border-emerald-600/40 font-bold' 
                      : 'text-white/90 hover:bg-[#0c4031] hover:text-white'}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-300' : 'text-emerald-200 group-hover:text-white'}`} />
                {!isCollapsed && <span className="truncate text-white font-bold">{item.label}</span>}
                {isCollapsed && isActive && (
                  <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick SaaS badge */}
        {!isCollapsed && (
          <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-[#0c4031] border border-emerald-700/50 flex items-center gap-3 text-white">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white">UK Chef v2.4</p>
              <p className="text-[11px] text-emerald-300 font-semibold">PKR Currency Mode</p>
            </div>
          </div>
        )}

        {/* Logout Footer */}
        <div className="p-3 border-t border-[#0d3b2e]">
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-rose-900/80 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0 text-emerald-200 group-hover:text-white" />
            {!isCollapsed && <span className="text-white">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
