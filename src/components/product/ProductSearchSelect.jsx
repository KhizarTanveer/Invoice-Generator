import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, X, Check, Package } from 'lucide-react';

/**
 * HighlightText component to highlight matching substrings case-insensitively
 */
function HighlightText({ text, highlight }) {
  if (!text) return null;
  const strText = String(text);
  if (!highlight || !highlight.trim()) return <span>{strText}</span>;

  const escaped = highlight.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = strText.split(regex);
  const lowerHighlight = highlight.trim().toLowerCase();

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === lowerHighlight ? (
          <mark
            key={i}
            className="bg-amber-100 text-amber-900 font-bold px-0.5 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function ProductSearchSelect({
  products = [],
  value = '',
  rowProductName = '',
  onSelectProduct,
  disabled = false,
  placeholder = 'Search Product...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Find currently selected product object if value (productId) matches
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === value) || null;
  }, [products, value]);

  // Display text in input when not searching
  const displayValue = useMemo(() => {
    if (isFocused || isOpen) {
      return searchTerm;
    }
    if (selectedProduct) {
      return selectedProduct.name;
    }
    return rowProductName || '';
  }, [isFocused, isOpen, searchTerm, selectedProduct, rowProductName]);

  // Real-time client-side product filtering
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (!searchTerm.trim()) return products;

    const query = searchTerm.trim().toLowerCase();

    // Match Product Name, Category, or Packing (case-insensitive)
    const matches = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const packing = (p.packing || p.unit || '').toLowerCase();
      return name.includes(query) || category.includes(query) || packing.includes(query);
    });

    // Priority sorting: products starting with query in name, category, or packing rank first
    return matches.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aCategory = (a.category || '').toLowerCase();
      const bCategory = (b.category || '').toLowerCase();
      const aPacking = (a.packing || a.unit || '').toLowerCase();
      const bPacking = (b.packing || b.unit || '').toLowerCase();

      const aStarts = aName.startsWith(query) || aCategory.startsWith(query) || aPacking.startsWith(query);
      const bStarts = bName.startsWith(query) || bCategory.startsWith(query) || bPacking.startsWith(query);

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });
  }, [products, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view during arrow key navigation
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const itemEl = listRef.current.children[highlightedIndex];
      if (itemEl && typeof itemEl.scrollIntoView === 'function') {
        itemEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Select a product
  const handleSelect = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setSearchTerm('');
    setIsOpen(false);
    setIsFocused(false);
    setHighlightedIndex(-1);
  };

  // Focus input and open dropdown
  const handleInputFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (filteredProducts.length > 0) {
        setHighlightedIndex(prev => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredProducts.length - 1);
      } else if (filteredProducts.length > 0) {
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredProducts[highlightedIndex]) {
        e.preventDefault();
        handleSelect(filteredProducts[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    if (onSelectProduct) {
      onSelectProduct(null);
    }
    setIsOpen(true);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Trigger */}
      <div
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
          }
        }}
        className={`relative flex items-center w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg transition-all cursor-text ${
          isOpen || isFocused
            ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
        />

        <div className="flex items-center gap-1 ml-1 shrink-0">
          {(searchTerm || selectedProduct || rowProductName) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Floating Dropdown Results Menu */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
              <Package className="w-4 h-4 text-slate-300" />
              <span>No products found</span>
            </div>
          ) : (
            <div
              ref={listRef}
              className="max-h-60 overflow-y-auto divide-y divide-slate-100/80 py-1"
            >
              {filteredProducts.map((p, idx) => {
                const isSelected = selectedProduct && selectedProduct.id === p.id;
                const isHighlighted = highlightedIndex === idx;
                const price = Number(p.trade_price !== undefined ? p.trade_price : p.price || 0);

                return (
                  <div
                    key={p.id || idx}
                    onClick={() => handleSelect(p)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-brand-50/80 text-brand-900 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100/90 text-slate-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Product Name */}
                      <div className="font-bold text-slate-900 text-xs truncate">
                        <HighlightText text={p.name} highlight={searchTerm} />
                      </div>

                      {/* Details row: Category & Packing */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {p.category && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200/60">
                            <HighlightText text={p.category} highlight={searchTerm} />
                          </span>
                        )}
                        {(p.packing || p.unit) && (
                          <span className="font-mono text-slate-500">
                            <HighlightText text={p.packing || p.unit} highlight={searchTerm} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Trade Price & Checkmark */}
                    <div className="flex items-center gap-2 shrink-0 text-right">
                      <span className="text-brand-600 font-bold font-mono text-xs">
                        Rs. {price.toLocaleString()}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
