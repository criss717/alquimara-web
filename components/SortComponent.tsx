'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const sortOptions = [
  { value: 'created_at-desc', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio más alto' },
  { value: 'price-desc', label: 'Precio más bajo' },
];

/**
 * Un componente para seleccionar el criterio de ordenación de los productos.
 * Actualiza el parámetro 'sort' en la URL.
 * @returns {JSX.Element}
 */
export default function SortComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'created_at-desc';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-end items-center gap-2 mb-4">
      <span className="text-sm font-medium">Ordenar por:</span>
      <div className="flex gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
              currentSort === option.value
                ? 'bg-black text-white'
                : 'bg-white text-black border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
