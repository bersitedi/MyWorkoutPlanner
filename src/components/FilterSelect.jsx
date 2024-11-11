import React, { useMemo, useId } from 'react';

function FilterSelect({ label, options, value, onChange }) {
  const id = useId();

  // Memoize unique and sorted options to optimize performance
  const uniqueOptions = useMemo(() => {
    return Array.from(new Set(options.filter(Boolean))).sort();
  }, [options]);

  // Function to capitalize each word in an option
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full appearance-none rounded-lg border-gray-300 bg-white py-2 pl-3 pr-8 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
      >
        <option value="">{`All ${label}s`}</option>
        {uniqueOptions.map((option) => (
          <option key={option} value={option}>
            {capitalizeWords(option)}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default FilterSelect;