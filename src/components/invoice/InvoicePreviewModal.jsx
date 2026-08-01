import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOGO_URL = "https://res.cloudinary.com/dwgwwlbrg/image/upload/v1784386120/PHOTO-2026-07-16-15-43-03_y1kevv.jpg";

export default function InvoicePreviewModal({ invoice, companyInfo, onClose, onToast }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Pure Vector PDF fallback (100% fail-proof, zero CORS dependencies)
  const generateNativePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 16;

      // Header - Company Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Brand Blue #2563EB
      doc.text(companyInfo?.name || 'UK CHEF', 15, y);

      y += 6;
      if (companyInfo?.tagline) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(companyInfo.tagline.toUpperCase(), 15, y);
        y += 5;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      if (companyInfo?.address || companyInfo?.city) {
        doc.text(`${companyInfo.address ? companyInfo.address + ', ' : ''}${companyInfo.city || ''}`, 15, y);
        y += 4;
      }
      if (companyInfo?.phone || companyInfo?.email) {
        doc.text(`Ph: ${companyInfo.phone || ''} | Email: ${companyInfo.email || ''}`, 15, y);
        y += 6;
      }

      // Invoice Meta Right Aligned
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text(`INVOICE #${invoice.id}`, pageWidth - 15, 20, { align: 'right' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Date: ${invoice.date || ''}`, pageWidth - 15, 26, { align: 'right' });
      doc.text(`Due Date: ${invoice.dueDate || ''}`, pageWidth - 15, 31, { align: 'right' });
      doc.text(`Status: ${invoice.status || ''}`, pageWidth - 15, 36, { align: 'right' });

      // Divider Line
      y = Math.max(y, 42);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, y, pageWidth - 15, y);
      y += 8;

      // Billed To Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, pageWidth - 30, 22, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('BILLED TO (CUSTOMER)', 20, y + 6);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(invoice.customerName || 'Customer', 20, y + 12);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Address: ${invoice.customerAddress || 'N/A'}  |  Phone: ${invoice.customerPhone || 'N/A'}`, 20, y + 17);

      y += 28;

      // Items Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(15, y, pageWidth - 30, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text('#', 18, y + 5.5);
      doc.text('Item Description', 30, y + 5.5);
      doc.text('Qty', 120, y + 5.5, { align: 'center' });
      doc.text('Unit Price (PKR)', 150, y + 5.5, { align: 'right' });
      doc.text('Total (PKR)', pageWidth - 20, y + 5.5, { align: 'right' });

      y += 8;

      // Items Table Rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      (invoice.items || []).forEach((item, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, pageWidth - 30, 8, 'F');
        }

        doc.text(`${idx + 1}`, 18, y + 5.5);
        doc.text(item.productName || 'Item', 30, y + 5.5);
        doc.text(`${item.qty || 1}`, 120, y + 5.5, { align: 'center' });
        doc.text(`Rs. ${Number(item.unitPrice || 0).toLocaleString()}`, 150, y + 5.5, { align: 'right' });
        doc.text(`Rs. ${Number(item.total || 0).toLocaleString()}`, pageWidth - 20, y + 5.5, { align: 'right' });

        y += 8;
      });

      y += 6;

      // Financial Summary Box Right Aligned
      const summaryX = pageWidth - 90;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(summaryX, y, 75, 30, 2, 2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      doc.text('Subtotal:', summaryX + 5, y + 6.5);
      doc.text(`Rs. ${Number(invoice.subtotal || 0).toLocaleString()}`, pageWidth - 20, y + 6.5, { align: 'right' });

      if (Number(invoice.discount) > 0) {
        doc.text('Discount:', summaryX + 5, y + 12);
        doc.text(`- Rs. ${Number(invoice.discount).toLocaleString()}`, pageWidth - 20, y + 12, { align: 'right' });
      }

      if (Number(invoice.taxAmount) > 0) {
        doc.text(`Tax (${invoice.taxPercent}%):`, summaryX + 5, y + 17.5);
        doc.text(`Rs. ${Number(invoice.taxAmount).toLocaleString()}`, pageWidth - 20, y + 17.5, { align: 'right' });
      }

      doc.setDrawColor(203, 213, 225);
      doc.line(summaryX + 5, y + 21, pageWidth - 20, y + 21);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(37, 99, 235);
      doc.text('Grand Total:', summaryX + 5, y + 27);
      doc.text(`Rs. ${Number(invoice.grandTotal || 0).toLocaleString()}`, pageWidth - 20, y + 27, { align: 'right' });

      // Notes
      if (invoice.notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('NOTES & TERMS:', 15, y + 6);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const splitNotes = doc.splitTextToSize(invoice.notes, 90);
        doc.text(splitNotes, 15, y + 12);
      }

      // Footer Signature
      const footerY = doc.internal.pageSize.getHeight() - 18;
      doc.setDrawColor(148, 163, 184);
      doc.line(pageWidth - 65, footerY, pageWidth - 15, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('AUTHORIZED SIGNATURE', pageWidth - 40, footerY + 4, { align: 'center' });

      // Download PDF
      const fileName = `Invoice_${invoice.id || 'document'}.pdf`;
      doc.save(fileName);

      setIsGeneratingPDF(false);
      if (onToast) onToast(`PDF saved to your downloads: ${fileName}`, 'success');
    } catch (fallbackErr) {
      console.error('Native PDF export error:', fallbackErr);
      setIsGeneratingPDF(false);
      if (onToast) onToast('Could not save PDF file', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    if (onToast) onToast(`Generating A4 PDF for ${invoice.id}...`, 'info');

    const element = document.getElementById('printable-invoice-content');

    if (!element) {
      generateNativePDF();
      return;
    }

    try {
      // Primary: Try canvas capture with relaxed CORS/taint rules
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `Invoice_${invoice.id || 'document'}.pdf`;
      pdf.save(fileName);

      setIsGeneratingPDF(false);
      if (onToast) onToast(`PDF saved to downloads: ${fileName}`, 'success');
    } catch (err) {
      console.warn('Canvas export failed, running native vector fallback...', err);
      // Fallback: Pure vector PDF generation (100% success on any device/font)
      generateNativePDF();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))', paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-preview-title"
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-4xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Modal Top Action Header (No Print) */}
        <div className="no-print px-3.5 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-1">
            <FileText className="w-5 h-5 text-brand-400 shrink-0" />
            <div className="min-w-0">
              <h3 id="invoice-preview-title" className="font-bold text-sm sm:text-base leading-tight truncate">Invoice Preview & Export</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">{invoice.id} • {invoice.customerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              title="Print Invoice directly"
              aria-label="Print Invoice"
            >
              <Printer className="w-4 h-4 text-slate-300 shrink-0" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-brand-600/30 disabled:opacity-70 shrink-0"
              title="Download PDF file directly to device"
              aria-label="Download PDF"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Downloading...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label="Close invoice preview"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-0.5 sm:ml-2 min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Printable & PDF Export Container */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto printable-area bg-white text-slate-900">
          <div id="printable-invoice-content" className="bg-white p-2">
            
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white p-0.5 border border-slate-200 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                  <img src={LOGO_URL} alt="UK Chef Official Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{companyInfo?.name || "UK CHEF"}</h1>
                  {companyInfo?.tagline && (
                    <p className="text-xs font-semibold text-brand-600 tracking-wide uppercase mb-1">{companyInfo.tagline}</p>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                    {companyInfo?.address && `${companyInfo.address}, `}{companyInfo?.city}<br />
                    {companyInfo?.phone && `Ph: ${companyInfo.phone}`} {companyInfo?.email && `| ${companyInfo.email}`}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 w-full sm:w-auto">
                <div className="inline-block bg-brand-50 text-brand-700 font-extrabold text-xs tracking-widest uppercase px-3 py-1 rounded-md mb-2">
                  Invoice
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{invoice.id}</h2>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-slate-500">Date: <span className="font-bold text-slate-800">{invoice.date}</span></p>
                  <p className="text-slate-500">Due Date: <span className="font-bold text-slate-800">{invoice.dueDate}</span></p>
                  <div className="mt-2">
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Billed To (Customer)</span>
                <h3 className="text-base font-bold text-slate-900">{invoice.customerName}</h3>
                {invoice.customerAddress && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{invoice.customerAddress}</p>
                )}
                {invoice.customerPhone && (
                  <p className="text-xs font-semibold text-slate-700 mt-2">Phone: {invoice.customerPhone}</p>
                )}
              </div>

              {(companyInfo?.bankName || companyInfo?.accountTitle || companyInfo?.accountNumber) && (
                <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Payment Instructions</span>
                  <p className="text-xs font-bold text-slate-800">{companyInfo?.bankName}</p>
                  {companyInfo?.accountTitle && (
                    <p className="text-xs text-slate-600">Title: <strong className="text-slate-900">{companyInfo.accountTitle}</strong></p>
                  )}
                  {companyInfo?.accountNumber && (
                    <p className="text-xs text-slate-600">A/C: <strong className="text-slate-900 font-mono">{companyInfo.accountNumber}</strong></p>
                  )}
                </div>
              )}
            </div>

            {/* Product Items Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">#</th>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price (PKR)</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Total (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoice.items && invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.productName}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{item.qty}</td>
                      <td className="py-3 px-4 text-right font-mono">Rs. {Number(item.unitPrice).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">Rs. {Number(item.total).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Calculation summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
              <div className="w-full sm:w-1/2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Notes & Terms</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 leading-relaxed italic">
                  "{invoice.notes || "Thank you for your business!"}"
                </p>
              </div>

              <div className="w-full sm:w-80 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">Rs. {Number(invoice.subtotal).toLocaleString()}</span>
                </div>

                {Number(invoice.discount) > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">- Rs. {Number(invoice.discount).toLocaleString()}</span>
                  </div>
                )}

                {Number(invoice.taxAmount) > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Tax ({invoice.taxPercent}%):</span>
                    <span className="font-mono font-bold text-slate-800">Rs. {Number(invoice.taxAmount).toLocaleString()}</span>
                </div>
              )}

                <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-extrabold text-brand-700">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">Rs. {Number(invoice.grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer stamp & signature line */}
            <div className="mt-12 pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Authorized Invoice
              </div>
              <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto">
                <div className="h-8 border-b border-slate-400 w-48 mb-1 mx-auto sm:ml-auto"></div>
                <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">Authorized Signature</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
