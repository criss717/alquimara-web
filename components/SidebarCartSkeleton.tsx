"use client";
import React from "react";

type Props = { count?: number };

export default function SidebarCartSkeleton({ count = 3 }: Props) {
  const items = Math.max(1, Math.min(8, count));
  return (
    <ul>
      {Array.from({ length: items }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse mb-2 w-full h-full flex flex-col justify-between items-center p-2"
        >
          <div className="w-full h-full flex items-center justify-center gap-2">
            <div className="w-[100px] h-[100px] rounded-full bg-gray-200" />           
          </div>
          <div className="w-full flex flex-col items-center justify-between mt-2 gap-2">
            <div className="h-6 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
