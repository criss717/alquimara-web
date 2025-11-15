'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Genera un array de números de página para la paginación.
 * @param {number} currentPage - La página actual.
 * @param {number} totalPages - El número total de páginas.
 * @returns {(number | string)[]} - Un array de números de página y elipses.
 */
const generatePagination = (currentPage: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

/**
 * Un componente de paginación que genera enlaces para navegar entre las páginas.
 * @param {{ totalPages: number }} { totalPages }
 * @returns {JSX.Element | null}
 */
export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  if (totalPages <= 1) {
    return null;
  }

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center space-x-2 my-8">
      {/* Botón de página anterior */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={`p-2 rounded-md ${currentPage <= 1 ? 'pointer-events-none text-gray-400' : 'hover:bg-gray-200'}`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      {/* Números de página */}
      {allPages.map((page, index) => (
        <Link
          key={`${page}-${index}`}
          href={createPageURL(page)}
          className={`px-4 py-2 rounded-md text-sm ${
            page === '...' ? 'pointer-events-none' :
            currentPage === page ? 'bg-black text-white' : 'hover:bg-gray-200'
          }`}
        >
          {page}
        </Link>
      ))}

      {/* Botón de página siguiente */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={`p-2 rounded-md ${currentPage >= totalPages ? 'pointer-events-none text-gray-400' : 'hover:bg-gray-200'}`}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
