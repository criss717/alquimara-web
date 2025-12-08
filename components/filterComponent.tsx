'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import PriceRangeSlider from './PriceRangeSlider';
import SelectComponent from './ui/select';

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

    const updateUrl = useCallback ((params: { [k: string]: string | undefined }) => {
        const paramsObj = new URLSearchParams(Array.from(searchParams.entries()))
        // Seteo o elimino parámetros según el valor
        Object.entries(params).forEach(([k, v]) => {
            if (v && v !== '') paramsObj.set(k, v)
            else paramsObj.delete(k)
        })
        const qs = paramsObj.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname)
    }, [pathname, router, searchParams])

    const onPropertyToggle = (prop: string) => {
        setSelectedProps((prev) => (prev.includes(prop) ? prev.filter((p) => p !== prop) : [...prev, prop]))
    }

    useEffect(() => {
        // //limpiar los filtros cuando la url esta sin parametros
        if (!searchParams.get('categoria') && !searchParams.get('propiedades') && !searchParams.get('precios')) {
            setCategory('');
            setSelectedProps([]);
        }
        console.log('FilterComponent useEffect ->', searchParams.toString());
        setCategory(searchParams.get('categoria') || 'all');
        setSelectedProps(searchParams.get('propiedades') ? searchParams.get('propiedades')!.split(',') : []);
    }, [searchParams]);

    return (
        <aside className="p-4 border rounded-lg shadow-md w-full md:w-64">
            <div className="flex w-full items-center justify-between">
                <h2 className="text-xl font-semibold mb-4">Filtros</h2>
                <HighlightOffRoundedIcon className="cursor-pointer m-0 p-0 self-start" onClick={() => {
                    // eliminar parámetros de filtros en la URL (precios y propiedades)
                    updateUrl({
                        categoria: 'all',
                        propiedades: undefined,
                        page: '1',
                        precios: undefined
                    });
                  
                }} />
            </div>

            <div className="mb-6">
                <SelectComponent
                    label="Categorías"
                    options={[{ value: 'all', label: 'Todas' }, ...categorias.map(c => ({ value: c, label: c }))]}
                    value={category}
                    onChange={setCategory}
                />
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
                            className="w-3 h-3 mr-2 rounded-sm border border-gray-300 appearance-none
                            checked:bg-violet-600 checked:border-violet-600 cursor-pointer
                            transition-colors"
                        />
                        <label className='cursor-pointer' htmlFor={`prop_${p}`}>{p}</label>
                    </div>
                ))}
            </div>

            <div className="mb-6">
                <PriceRangeSlider min={precios.minPrice} max={precios.maxPrice} step={1}  />
            </div>
        </aside>
    )
}