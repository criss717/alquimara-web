'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Un componente de barra deslizante doble, robusto y con inputs numéricos.
 * @param {{ min: number; max: number; step: number; }} { min, max, step }
 * @returns {JSX.Element}
 */
export default function PriceRangeSlider({ min, max, step }: { min: number; max: number; step: number; }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackRef = useRef<HTMLDivElement>(null);

  const getInitialPrices = useCallback(() => {
    const prices = searchParams.get('precios')?.split('-').map(Number);
    return prices && prices.length === 2 ? [prices[0], prices[1]] : [min, max];
  }, [searchParams, min, max]);

  const [minVal, setMinVal] = useState(getInitialPrices()[0]);
  const [maxVal, setMaxVal] = useState(getInitialPrices()[1]);

  // --- LA SOLUCIÓN ---
  // Refs para tener siempre el valor más actual en los manejadores de eventos
  const minValRef = useRef(minVal);
  const maxValRef = useRef(maxVal);
  useEffect(() => {
    minValRef.current = minVal;
    maxValRef.current = maxVal;
  }, [minVal, maxVal]);
  // --------------------

  const updateUrl = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    const newPrices = `${minValRef.current}-${maxValRef.current}`;
    
    if (minValRef.current === min && maxValRef.current === max) {
      current.delete('precios');
    } else {
      current.set('precios', newPrices);
    }
    
    current.set('page', '1');
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  useEffect(() => {
    const [initialMin, initialMax] = getInitialPrices();
    setMinVal(initialMin);
    setMaxVal(initialMax);
  }, [getInitialPrices]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = Number(e.target.value);
    if (type === 'min') {
      if (value <= maxVal - step) setMinVal(value);
    } else {
      if (value >= minVal + step) setMaxVal(value);
    }
  };

  const createDragHandler = (type: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!trackRef.current) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    
    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const percent = (clientX - trackRect.left) / trackRect.width;
      let newValue = Math.round((min + (max - min) * percent) / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));

      if (type === 'min') {
        // Usamos la ref del valor máximo para la comparación
        setMinVal(Math.min(newValue, maxValRef.current - step));
      } else {
        // Usamos la ref del valor mínimo para la comparación
        setMaxVal(Math.max(newValue, minValRef.current + step));
      }
    };

    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', upHandler);
      updateUrl();
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('touchend', upHandler);
  };

  const minPosPercent = ((minVal - min) / (max - min)) * 100;
  const maxPosPercent = ((maxVal - min) / (max - min)) * 100;

  return (
    <div>
      <label className="block text-sm font-medium mb-4">Rango de Precios</label>   

      <div ref={trackRef} className="relative w-full h-5 flex items-center">
        <div className="relative w-full h-1 bg-gray-200 rounded">
          <div
            className="absolute h-1 bg-black"
            style={{ left: `${minPosPercent}%`, right: `${100 - maxPosPercent}%` }}
          />
        </div>

        <div
          className="absolute w-4 h-4 bg-black rounded-full cursor-pointer"
          style={{ left: `calc(${minPosPercent}% - 8px)` }}
          onMouseDown={createDragHandler('min')}
          onTouchStart={createDragHandler('min')}
        />

        <div
          className="absolute w-4 h-4 bg-black rounded-full cursor-pointer"
          style={{ left: `calc(${maxPosPercent}% - 8px)` }}
          onMouseDown={createDragHandler('max')}
          onTouchStart={createDragHandler('max')}
        />
      </div>

      <div className="flex justify-between items-center mt-4 space-x-2">
        <input
          type="number"
          value={minVal}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleValueChange(e, 'min')}
          onBlur={updateUrl}
          className="w-full p-2 border rounded text-center"
        />
        <span>-</span>
        <input
          type="number"
          value={maxVal}
          min={min}
          max={max}
          step={step}
          onChange={(e) => handleValueChange(e, 'max')}
          onBlur={updateUrl}
          className="w-full p-2 border rounded text-center"
        />
      </div>
    </div>
  );
}
