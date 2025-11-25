import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface HeroProps {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  imageUrl: string;
}

export function Hero({ title, subtitle, date, location, imageUrl }: HeroProps) {
  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden rounded-b-3xl shadow-lg">
      <div className="absolute inset-0">
        <img 
          src={imageUrl} 
          alt="Trip Location" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge variant="secondary" className="mb-3 bg-yellow-400 hover:bg-yellow-500 text-black border-none">
            {subtitle}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3 text-sm sm:text-base font-medium text-gray-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {date}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
