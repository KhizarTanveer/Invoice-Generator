import React, { useState, useRef, useEffect } from 'react';
import { Lock, Clock, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function EditableStatusBadge({
  status = 'Paid',
  onSelectPaid,
  onChangeStatus,
  isUpdating = false
}) {
  const currentStatus = (status || '').trim();
  const normalized = currentStatus.toLowerCase();
  const isPaid = normalized === 'paid';
  const isOverdue = normalized === 'overdue';

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Paid Status (Locked, non-editable)
  if (isPaid) {
    return (
      <div className="relative group inline-flex items-center justify-center">
        {/* Paid Status Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-xs cursor-not-allowed select-none transition-all duration-200 hover:shadow-sm hover:border-emerald-400/80"
          title="Payment has been finalized and cannot be changed."
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="tracking-wide">Paid</span>
        </span>

        {/* Smooth Animated Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-medium rounded-xl shadow-xl transition-all duration-200 ease-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 z-50 text-center leading-tight border border-slate-800">
          Payment has been finalized and cannot be changed.
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95"></div>
        </div>
      </div>
    );
  }

  // 2. Pending or Overdue Editable Status Dropdown
  const badgeStyles = isOverdue
    ? isOpen
      ? 'bg-rose-100/90 text-rose-900 border-rose-400 shadow-md ring-2 ring-rose-500/20 scale-105'
      : 'bg-gradient-to-r from-rose-50 via-red-50 to-rose-100 hover:from-rose-100 hover:to-red-100 text-rose-900 border border-rose-300/80 shadow-xs hover:shadow-md hover:border-rose-400/80 active:scale-95'
    : isOpen
      ? 'bg-amber-100/90 text-amber-900 border-amber-400 shadow-md ring-2 ring-amber-500/20 scale-105'
      : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 hover:from-amber-100 hover:to-orange-100 text-amber-900 border border-amber-300/80 shadow-xs hover:shadow-md hover:border-amber-400/80 active:scale-95';

  const dotBg = isOverdue ? 'bg-rose-500' : 'bg-amber-500';
  const pingBg = isOverdue ? 'bg-rose-400' : 'bg-amber-400';
  const iconColor = isOverdue ? 'text-rose-700' : 'text-amber-700';

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center justify-center">
      <button
        type="button"
        disabled={isUpdating}
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer select-none outline-none focus:ring-2 ${
          isOverdue ? 'focus:ring-rose-500/30' : 'focus:ring-amber-500/30'
        } ${badgeStyles} ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingBg} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotBg}`}></span>
        </span>
        {isOverdue ? (
          <AlertTriangle className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
        ) : (
          <Clock className={`w-3.5 h-3.5 ${iconColor} shrink-0`} />
        )}
        <span className="tracking-wide capitalize">{isOverdue ? 'Overdue' : 'Pending'}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 ${iconColor} shrink-0 transition-transform duration-250 ease-out ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Smooth Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-36 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150 origin-top transform space-y-1">
          
          {/* Pending Option */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (!isOverdue) return;
              if (onChangeStatus) onChangeStatus('Pending');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
              !isOverdue
                ? 'text-amber-900 bg-amber-50/80 cursor-default border border-amber-200/60'
                : 'text-amber-800 hover:text-amber-900 hover:bg-amber-50 rounded-xl active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending</span>
            </div>
            {!isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
          </button>

          {/* Overdue Option */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (isOverdue) return;
              if (onChangeStatus) onChangeStatus('Overdue');
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
              isOverdue
                ? 'text-rose-900 bg-rose-50/80 cursor-default border border-rose-200/60'
                : 'text-rose-800 hover:text-rose-900 hover:bg-rose-50 rounded-xl active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Overdue</span>
            </div>
            {isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
          </button>

          <div className="border-t border-slate-100 my-1"></div>

          {/* Mark Paid Option */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              if (onSelectPaid) onSelectPaid();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/90 rounded-xl transition-all duration-150 active:scale-[0.98] border border-transparent hover:border-emerald-200/60 group/opt"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 group-hover/opt:scale-110 transition-transform" />
              <span>Mark Paid</span>
            </div>
            <Lock className="w-3 h-3 text-emerald-500 opacity-60 group-hover/opt:opacity-100 transition-opacity" />
          </button>

        </div>
      )}
    </div>
  );
}
