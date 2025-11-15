'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import PriceRangeSlider from './PriceRangeSlider';

/**
 * FilterComponent: componente cliente para manipular filtros y actualizar la URL.
 *
 * @param {{ categorias: string[]; propiedades: string[]; precios: string[]; selectedCategorias?: string; selectedpropiedades?: string[]; selectedPrice?: string; }}
 * @returns {JSX.Element}
 *
 * @description
 * - Actualiza los query params en la URL (ej: ?categorias=facial&propiedades=piel-seca,exfolia&precios=10-50)
 * - Usa `router.push` para navegar sin recargar manualmente; Next re-ejecuta el Server Component con los nuevos params
 */
export default function FilterComponent({
    categorias,
    propiedades,
    precios,
    selectedCategorias = '',
    selectedpropiedades = [],
}: {
    categorias: string[]
    propiedades: string[]
    precios: { minPrice: number; maxPrice: number }
    selectedCategorias?: string
    selectedpropiedades?: string[]
    selectedPrice?: string
}) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [category, setCategory] = useState<string>(selectedCategorias)
    const [selectedProps, setSelectedProps] = useState<string[]>(selectedpropiedades)

    // Cuando cambia categorias o propiedades, actualizamos inmediatamente
    useEffect(() => {
        updateUrl({ categoria: category, propiedades: selectedProps.join(','), page: '1' })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, selectedProps])

    function updateUrl(params: { [k: string]: string | undefined }) {
        const paramsObj = new URLSearchParams(Array.from(searchParams.entries()))
        // Seteo o elimino parámetros según el valor
        Object.entries(params).forEach(([k, v]) => {
            if (v && v !== '') paramsObj.set(k, v)
            else paramsObj.delete(k)
        })
        const qs = paramsObj.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname)
    }

    const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value)
    }

    const onPropertyToggle = (prop: string) => {
        setSelectedProps((prev) => (prev.includes(prop) ? prev.filter((p) => p !== prop) : [...prev, prop]))
    }  

    useEffect(() => {
        //limpiar los filtros cuando la url esta sin parametros
        if (!searchParams.get('categoria') && !searchParams.get('propiedades') && !searchParams.get('precios')) {
            setCategory('');
            setSelectedProps([]);
        }
    }, [searchParams]);

    return (
        <aside className="p-4 border rounded-lg shadow-md w-full md:w-64">
            <h2 className="text-xl font-semibold mb-4">Filtros</h2>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Categorías</label>
                <select value={category} onChange={onCategoryChange} className="w-full p-2 border rounded cursor-pointer">
                    <option value="">Todas</option>
                    {categorias.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="mb-6">
                <div className="block text-sm font-medium mb-2">Propiedades</div>
                {propiedades.map((p) => (
                    <div key={p} className="flex items-center mb-2">
                        <input
                            id={`prop_${p}`}
                            type="checkbox"
                            checked={selectedProps.includes(p)}
                            onChange={() => onPropertyToggle(p)}
                            className="mr-2 cursor-pointer"
                        />
                        <label className='cursor-pointer' htmlFor={`prop_${p}`}>{p}</label>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <PriceRangeSlider min={precios.minPrice} max={precios.maxPrice} step={1} />
            </div>
        </aside>
    )
}