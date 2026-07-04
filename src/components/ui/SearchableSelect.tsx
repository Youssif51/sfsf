import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

export function SearchableSelect({ options, value, onChange, label, required }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.value !== '' && opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-textMain">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      
      <div 
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-textMain focus-within:ring-1 focus-within:ring-accentBlue focus-within:border-accentBlue cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-textMain" : "text-textMuted"}>
          {selectedOption ? selectedOption.label : 'Select a product...'}
        </span>
        <ChevronDown size={16} className="text-textMuted" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border relative">
            <Search size={14} className="absolute left-4 top-4 text-textMuted" />
            <input
              type="text"
              className="w-full bg-background border border-border rounded-sm pl-8 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accentBlue"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-sm text-textMuted text-center">No products found.</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-sm cursor-pointer flex justify-between items-center ${
                    value === opt.value ? 'bg-accentBlue/10 text-accentBlue' : 'text-textMain hover:bg-surfaceHover'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt.label}
                  {value === opt.value && <Check size={14} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
