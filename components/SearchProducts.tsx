'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Search, Tag, X } from 'lucide-react';

type SearchResult = {
  type: 'product' | 'category';
  name: string;
  href: string;
  imageUrl: string | null;
};

export default function SearchProducts() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /**
   * Función debounce que retrasa la ejecución de la función proporcionada.
   * @param fn Función a ejecutar después del retraso.
   * @param delay Tiempo de espera en milisegundos.
   * @returns Función debounced.
   */
  const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length >= 3) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?query=${term}`);
          const data = await response.json();
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (href: string) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(href);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      setIsOpen(false);
      router.push(`/productos?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar productos, categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-black focus:ring-black"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 h-5 w-5 animate-spin text-gray-400" />
        ) : (
          searchTerm && (
            <button type="button" onClick={clearSearch} className="absolute right-3">
              <X className="h-5 w-5 text-gray-500 hover:text-black" />
            </button>
          )
        )}
      </form>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-lg">
          {results.length > 0 ? (
            <ul className="divide-y">
              {results.map((result) => (
                <li key={result.href}>
                  <button onClick={() => handleLinkClick(result.href)} className="flex w-full items-center gap-4 p-3 text-left hover:bg-gray-50 cursor-pointer rounded-lg">
                    {result.type === 'product' ? (
                      <Image
                        src={result.imageUrl || ''}
                        alt={result.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
                        <Tag className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-black">{result.name}</span> {/* Cambiado a text-black */}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-sm text-gray-500">No se encontraron resultados.</p>
          )}
        </div>
      )}
    </div>
  );
}