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
  url?: string; // Optional URL link
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

  // Initialize map (runs once)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;

    if (!apiKey) {
      console.error(
        "Kakao Map API key is not set. Please set VITE_KAKAO_MAP_API_KEY in your .env file"
      );
      return;
    }

    function initializeMap() {
      if (!mapContainerRef.current || !window.kakao?.maps) {
        console.log("Map container or Kakao Maps not ready");
        return;
      }

      // Use default center if no locations yet
      const defaultCenter = new window.kakao.maps.LatLng(35.8294, 129.2194); // Gyeongju center

      const options = {
        center: defaultCenter,
        level: 5, // Zoom level (3-14, smaller number = more zoomed in)
      };

      try {
        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        mapRef.current = map;
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
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
  }, []); // Only run once on mount

  // Update markers and reposition map when locations change
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) {
      console.log("Map or Kakao Maps not ready for markers", {
        mapReady: !!mapRef.current,
        kakaoReady: !!window.kakao?.maps,
      });
      return;
    }

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
      if ((marker as any).infoWindow) {
        (marker as any).infoWindow.close();
      }
    });
    markersRef.current = [];

    if (locations.length === 0) {
      console.log("No locations to display");
      return;
    }

    console.log("Creating markers for", locations.length, "locations");

    // Create markers for each location
    const positions: any[] = [];
    locations.forEach((loc) => {
      try {
        const position = new window.kakao.maps.LatLng(loc.lat, loc.lng);
        positions.push(position);

        // Create marker
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map,
          clickable: true,
        });

        console.log("Marker created for", loc.name, marker);

        // Create info window with name and URL
        const infoContent = loc.url
          ? `<div style="padding:12px;min-width:150px;text-align:center;">
              <div style="font-weight:bold;font-size:14px;color:#000;margin-bottom:8px;">${loc.name}</div>
              <a href="${loc.url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:6px 12px;background-color:#3b82f6;color:white;text-decoration:none;border-radius:4px;font-size:12px;font-weight:500;">지도 보기</a>
            </div>`
          : `<div style="padding:8px 12px;font-weight:bold;text-align:center;color:#000;">${loc.name}</div>`;

        // Create info window with removable option (following Kakao Maps API sample)
        const infoWindow = new window.kakao.maps.InfoWindow({
          content: infoContent,
          removable: true, // Allows closing the info window with X button
        });

        // Add click event listener (following Kakao Maps API sample pattern)
        window.kakao.maps.event.addListener(marker, "click", function () {
          // Close all other info windows first
          console.log("marker click", marker);
          markersRef.current.forEach((m) => {
            if (m.infoWindow && m.infoWindow !== infoWindow) {
              m.infoWindow.close();
            }
          });

          // Toggle info window: close if already open, open if closed
          if (infoWindow.getMap()) {
            infoWindow.close();
            setActiveId(null);
          } else {
            infoWindow.open(map, marker);
            setActiveId(loc.id);
          }
        });

        // Store info window with marker for cleanup
        (marker as any).infoWindow = infoWindow;
        markersRef.current.push(marker);
      } catch (error) {
        console.error("Error creating marker for", loc.name, error);
      }
    });

    console.log("Total markers created:", markersRef.current.length);

    // Reposition map to fit all markers
    if (positions.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      positions.forEach((position) => {
        bounds.extend(position);
      });
      map.setBounds(bounds);
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
  }, [locations, markerColor]); // Removed activeId to prevent unnecessary marker recreation

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
