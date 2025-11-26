import { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";

interface HeroProps {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  imageUrl: string;
}

export function Hero({ title, subtitle, date, location, imageUrl }: HeroProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="relative w-full h-[60vh] min-h-[400px] overflow-hidden rounded-b-3xl shadow-lg cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt="Trip Location"
            className="w-full h-full object-cover transition-opacity hover:opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white pointer-events-none">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge
              variant="secondary"
              className="mb-3 bg-yellow-400 hover:bg-yellow-500 text-black border-none"
            >
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[100vw] max-h-screen w-full h-full p-0 m-0 rounded-none border-none bg-black/95 [&>button]:hidden">
          <div
            className="flex items-center justify-center w-full h-full p-4 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          >
            <img
              src={imageUrl}
              alt="Trip Location - Full Screen"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
