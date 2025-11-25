import React from "react";
import { Clock } from "lucide-react";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">일정표</h2>
      </div>

      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
        {events.map((event, index) => (
          <div key={index} className="relative pl-8 pr-4 group">
            {/* Dot */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white bg-primary shadow-sm group-hover:scale-110 transition-transform" />

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="font-mono text-sm font-bold text-primary shrink-0 w-16">
                {event.time}
              </span>
              <div>
                <h3 className="font-bold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap break-keep">
                  {event.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
