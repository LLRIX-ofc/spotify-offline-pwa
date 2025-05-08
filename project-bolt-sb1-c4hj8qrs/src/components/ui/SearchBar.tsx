import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Search, X } from 'lucide-react';
import { setQuery, performSearch } from '../../store/slices/searchSlice';
import { AppDispatch } from '../../store/store';

const SearchBar: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const debounceTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    if (inputValue.trim()) {
      debounceTimerRef.current = window.setTimeout(() => {
        dispatch(setQuery(inputValue));
        dispatch(performSearch(inputValue));
      }, 300);
    }

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, dispatch]);

  const clearSearch = () => {
    setInputValue('');
    dispatch(setQuery(''));
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`flex items-center px-3 py-2 rounded-full transition-all duration-200 ${
        isFocused 
          ? 'bg-dark-200 shadow-md ring-2 ring-primary-600' 
          : 'bg-dark-300'
      }`}
    >
      <Search size={20} className="text-gray-400 mr-2" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search songs, albums, artists..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
      />
      {inputValue && (
        <button 
          onClick={clearSearch}
          className="flex items-center justify-center w-6 h-6 rounded-full bg-dark-100 hover:bg-dark-50 transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;