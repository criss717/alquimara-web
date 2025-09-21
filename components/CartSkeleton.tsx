"use client";
import React from "react";
import { useCartStore } from "@/store/cartStore";

type Props = {
  count?: number;
};

export default function CartSkeleton({ count }: Props) {
  const cart = useCartStore((s) => s.cart);
  const items = Math.max(1, Math.min(10, count ?? (cart ? cart.length : 3)));

  return (
    <div className="w-full p-4 rounded">
      <div className="animate-pulse space-y-4">

        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="w-full h-[200px] p-2 flex items-center">            
            <div className="w-[200px] h-[180px] flex items-center justify-center mr-10">
              <div className="w-[160px] h-[160px] bg-gray-200 rounded" />
            </div>
            <div className="self-start flex flex-col px-2 flex-1 justify-center py-6">
              <div className="h-5 bg-gray-200 rounded w-2/5 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/6 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="w-[80px] self-start flex flex-col items-center gap-2">
              <div className="w-[100px] h-8 bg-gray-200 rounded" />
              <div className="w-20 h-5 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
