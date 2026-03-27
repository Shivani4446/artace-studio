"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CustomDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function CustomDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  className = "",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value || placeholder;
  const hasValue = Boolean(value);

  return (
    <div className={`flex flex-col gap-2 text-[14px] font-medium text-[#313131] ${className}`} ref={dropdownRef}>
      {label}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex min-h-[48px] w-full items-center justify-between rounded-[12px] border bg-white px-4 text-[15px] transition-all duration-200 outline-none ${
            isOpen ? "border-[#1a1a1a] ring-1 ring-[#1a1a1a]/5" : "border-black/10"
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={hasValue ? "text-[#1a1a1a]" : "text-[#1a1a1a]/40"}>
            {displayValue}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#313131]/60 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-[12px] border border-black/10 bg-[#faf8f4] p-2 shadow-[0_18px_35px_rgba(0,0,0,0.08)]"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => handleSelect(option)}
                className={`block w-full rounded-[8px] px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                  value === option
                    ? "bg-[#1f1f1f] text-white"
                    : "text-[#333333] hover:bg-black/5 hover:text-black"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
