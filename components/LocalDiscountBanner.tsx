"use client";

import React, { useMemo } from "react";
import { Percent, Info } from "lucide-react";
import { createRng, pickOne } from "@/lib/variation";

interface LocalDiscountBannerProps {
  city: string;
  district?: string | null;
}

export const LocalDiscountBanner: React.FC<LocalDiscountBannerProps> = ({ city, district }) => {
  const area = district ? `${city} ${district}` : city;
  
  // Seed based discount to ensure persistence for the same region
  const discount = useMemo(() => {
    const rng = createRng(`${city}-${district || "center"}-discount`);
    return pickOne(rng, [10, 15, 20]);
  }, [city, district]);

  return (
    <div className="bg-brand-50 border-y border-brand-100 py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Percent className="w-5 h-5 text-brand" />
          </div>
          <div className="text-sm">
            <span className="font-black text-brand-900 block sm:inline">Yerel Fırsat: </span>
            <span className="text-brand-800">
              Bugün <strong>{area}</strong> sakinlerine özel tüm kombi, klima ve beyaz eşya servislerinde 
              <span className="bg-brand text-white px-2 py-0.5 rounded ml-1 font-bold">%{discount}</span> 
              {" "}indirim fırsatını kaçırmayın!
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm self-stretch sm:self-auto px-3 py-2 rounded-lg border border-brand-200">
          <Info className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-brand-700 whitespace-nowrap">Kod: SERVIS{discount}</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};
