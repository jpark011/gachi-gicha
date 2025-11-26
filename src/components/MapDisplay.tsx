import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    kakao: any;
  }
}

interface Location {
  id: string;
  name: string;
  lat: number; // Latitude
  lng: number; // Longitude
}

interface MapDisplayProps {
  locations: Location[];
  markerColor?: string;
}

export function MapDisplay({
  locations,
  markerColor = "#e11d48",
}: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;

    if (!apiKey) {
      console.error(
        "Kakao Map API key is not set. Please set VITE_KAKAO_MAP_API_KEY in your .env file"
      );
      return;
    }

    function initializeMap() {
      if (!mapContainerRef.current || !window.kakao?.maps) return;

      // Calculate center from locations
      const centerLat =
        locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
      const centerLng =
        locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

      const options = {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 5, // Zoom level (3-14, smaller number = more zoomed in)
      };

      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      mapRef.current = map;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // Create markers for each location
      locations.forEach((loc) => {
        const position = new window.kakao.maps.LatLng(loc.lat, loc.lng);

        // Create custom marker using circle overlay
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map,
        });

        // Create info window
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px 12px;font-weight:bold;text-align:center;color:${markerColor};">${loc.name}</div>`,
        });

        // Add click event
        window.kakao.maps.event.addListener(marker, "click", () => {
          // Close all other info windows
          markersRef.current.forEach((m) => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });

          if (activeId === loc.id) {
            setActiveId(null);
            infoWindow.close();
          } else {
            setActiveId(loc.id);
            infoWindow.open(map, marker);
          }
        });

        // Store info window with marker for cleanup
        (marker as any).infoWindow = infoWindow;
        markersRef.current.push(marker);
      });
    }

    // Load Kakao Maps API if not already loaded
    if (!window.kakao || !window.kakao.maps) {
      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="dapi.kakao.com"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          window.kakao.maps.load(() => {
            initializeMap();
          });
        });
        return;
      }

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap();
        });
      };
      script.onerror = () => {
        console.error("Failed to load Kakao Maps API");
      };
      document.head.appendChild(script);
    } else {
      // API already loaded, initialize map
      if (window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          initializeMap();
        });
      } else {
        initializeMap();
      }
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => {
        marker.setMap(null);
        if ((marker as any).infoWindow) {
          (marker as any).infoWindow.close();
        }
      });
      markersRef.current = [];
    };
  }, [locations, markerColor, activeId]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" style={{ color: markerColor }} />
          지도
        </h2>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full aspect-4/3 bg-gray-100"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
