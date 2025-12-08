'use client';

import React, { useCallback} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import CardProductProps from '@/types/cardProductProps';

interface ProductCarouselProps {
  products: CardProductProps[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!products || products.length === 0) {
    return <div className="text-center text-gray-500">No hay productos para mostrar en el carrusel.</div>;
  }

  return (
    <div className="relative w-full mx-auto mt-5">
      <div className="overflow-hidden rounded-lg shadow-lg" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {products.map((product) => (
            <div key={product.id} className="flex-none w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
              <Link href={`/productos/${product.slug}`} className="block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out group">
                <div className="relative w-full h-60 overflow-hidden">
                  <Image
                    src={product.imageUrl || '/placeholder.png'} // Asegúrate de tener una imagen de placeholder
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{product.price} €</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute top-1/2 left-0 -translate-y-1/2 bg-violet-400 text-amber-50 bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200 z-10 ml-2"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      <button
        className="absolute top-1/2 right-0 -translate-y-1/2 bg-violet-400 text-amber-50 bg-opacity-75 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200 z-10 mr-2"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        &gt;
      </button>
    </div>
  );
}
