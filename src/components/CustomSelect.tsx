import React, { useEffect, useRef, useState } from 'react';

type Opt = { label: string; value: string };
type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  placeholder?: string;
  className?: string;
};

export default function CustomSelect({ value, onChange, options, placeholder = 'Select…', className }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!btnRef.current || !listRef.current) return;
      if (!btnRef.current.contains(e.target as Node) && !listRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className={`custom-select ${className || ''}`} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        className="cs-trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" style={{ marginLeft: 8 }}>
          <path d="M5 7l5 6 5-6H5z" fill="currentColor"/>
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          className="cs-list"
          role="listbox"
          tabIndex={-1}
          style={{ position: 'absolute', zIndex: 20 }}
        >
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cs-item ${opt.value === value ? 'is-selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
