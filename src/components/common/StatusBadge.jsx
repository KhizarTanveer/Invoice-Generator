import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileText, PackageCheck, PackageX, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, type = 'invoice' }) {
  if (type === 'invoice') {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-xs">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Draft
          </span>
        );
    }
  } else {
    // Product status
    switch (status) {
      case 'Active':
      case 'In Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            {status === 'Active' ? 'Active' : 'In Stock'}
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Low Stock
          </span>
        );
      case 'Inactive':
      case 'Out of Stock':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <PackageX className="w-3.5 h-3.5 text-rose-600" />
            {status === 'Inactive' ? 'Inactive' : 'Out of Stock'}
          </span>
        );
    }
  }
}
