import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface Location {
  id: string;
  name: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

interface MapDisplayProps {
  imageUrl: string;
  locations: Location[];
  markerColor?: string;
}

export function MapDisplay({ imageUrl, locations, markerColor = '#e11d48' }: MapDisplayProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" style={{ color: markerColor }} />
          지도
        </h2>
      </div>
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Map" 
          className="w-full h-full object-cover opacity-90"
        />
        
        {locations.map((loc) => {
          const isActive = activeId === loc.id;
          return (
            <div
              key={loc.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              onClick={() => setActiveId(isActive ? null : loc.id)}
            >
              <TooltipProvider>
                <Tooltip open={isActive}>
                  <TooltipTrigger asChild>
                    <div className="relative group">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors bg-white"
                        style={{
                          backgroundColor: isActive ? markerColor : 'white',
                          color: isActive ? 'white' : markerColor,
                        }}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      {/* Pulse effect */}
                      <div 
                        className="absolute inset-0 rounded-full opacity-20 animate-pulse" 
                        style={{ backgroundColor: markerColor }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 text-white border-none">
                    <p className="font-semibold">{loc.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
