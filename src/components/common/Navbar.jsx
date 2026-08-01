import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ShieldCheck, 
  Inbox
} from 'lucide-react';

const LOGO_URL = "https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg";

export default function Navbar({ 
  activeTabTitle, 
  setMobileOpen, 
  onQuickSearch, 
  companyInfo,
  onLogout 
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page title */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-600"></span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTabTitle}</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            {companyInfo?.name || "UK Chef"} • Official Invoice & Inventory Portal
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            onChange={(e) => onQuickSearch && onQuickSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Notifications</span>
                <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length} Unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0"></div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800 leading-snug">{item.text}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                    <p className="text-xs font-semibold text-slate-600">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 border-2 border-brand-500 shadow-xs overflow-hidden flex items-center justify-center">
              <img src={LOGO_URL} alt="Admin Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">Admin User</p>
              <p className="text-[10px] text-slate-500 font-medium">Head of Operations</p>
            </div>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-modal border border-slate-200/90 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-200 overflow-hidden shrink-0">
                  <img src={LOGO_URL} alt="UK Chef Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Admin Account</p>
                  <p className="text-xs text-slate-500">admin@ukchef.pk</p>
                </div>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400" /> Account Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> System Security
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
