import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import {
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Crosshair,
  Maximize2,
  X,
  Compass,
  Check,
  Lock
} from "lucide-react";

interface PostingLocationMapProps {
  lat: number | null;
  lng: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
  neighborhood?: string;
  language?: "english" | "tagalog";
}

// Default fallback coordinates for Gumaca barangays
export const getNeighborhoodDefaultLatLng = (neighborhood?: string): [number, number] => {
  if (!neighborhood) return [13.9220, 122.0995];
  if (neighborhood.includes("Tabing Dagat")) return [13.9232, 122.1014];
  if (neighborhood.includes("Villa Nava")) return [13.9121, 122.1040];
  if (neighborhood.includes("San Diego")) return [13.9202, 122.1038];
  if (neighborhood.includes("Pipisik")) return [13.9252, 122.0975];
  if (neighborhood.includes("Peñafrancia")) return [13.9245, 122.0968];
  if (neighborhood.includes("Rizal")) return [13.9215, 122.1025];
  if (neighborhood.includes("Bagong Buhay")) return [13.9190, 122.0980];
  if (neighborhood.includes("Mabini")) return [13.9220, 122.0985];
  if (neighborhood.includes("Maunlad")) return [13.9210, 122.0965];
  if (neighborhood.includes("Buensuceso")) return [13.9280, 122.0950];
  if (neighborhood.includes("Progreso")) return [13.9180, 122.1010];
  if (neighborhood.includes("Rosario")) return [13.9240, 122.0990];
  return [13.9220, 122.0995];
};

export const PostingLocationMap: React.FC<PostingLocationMapProps> = ({
  lat,
  lng,
  onChangeLocation,
  neighborhood,
  language = "english",
}) => {
  const isTagalog = language === "tagalog";
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const propertyMarkerRef = useRef<L.Marker | null>(null);

  const [isFullView, setIsFullView] = useState(false);
  const isFullViewRef = useRef(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGpsSuccess, setIsGpsSuccess] = useState(false);

  // Determine current active property coordinates
  const defaultCoords = getNeighborhoodDefaultLatLng(neighborhood);
  const currentLat = lat ?? defaultCoords[0];
  const currentLng = lng ?? defaultCoords[1];

  // Re-initialize or update Leaflet Map cleanly whenever isFullView or mapMode changes
  useEffect(() => {
    isFullViewRef.current = isFullView;
    const container = mapContainerRef.current;
    if (!container) return;

    // Destroy any existing map instance on re-mount or container switch
    if (leafletMapRef.current) {
      try {
        leafletMapRef.current.remove();
      } catch (e) {}
      leafletMapRef.current = null;
      tileLayerRef.current = null;
      propertyMarkerRef.current = null;
    }

    // Create fresh Leaflet map on current container
    const map = L.map(container, {
      center: [currentLat, currentLng],
      zoom: isFullView ? 17 : 16,
      zoomControl: isFullView,
      dragging: isFullView,
      touchZoom: isFullView,
      doubleClickZoom: isFullView,
      scrollWheelZoom: isFullView,
      boxZoom: isFullView,
      keyboard: isFullView,
    });

    // Map click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (isFullViewRef.current) {
        onChangeLocation(e.latlng.lat, e.latlng.lng);
      } else {
        setIsFullView(true);
      }
    });

    leafletMapRef.current = map;

    // 1. Add Tile Layer (Standard Clean Street Map)
    const tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      attribution,
      subdomains: "abcd",
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Helper to create Property Pin
    const createPropertyMarker = (mapInstance: L.Map, pinLat: number, pinLng: number) => {
      const propertyIcon = L.divIcon({
        className: "custom-posting-property-pin",
        html: `
          <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
            <div class="text-rose-600 drop-shadow-md transition-transform transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="currentColor" stroke="#ffffff" stroke-width="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      const marker = L.marker([pinLat, pinLng], {
        icon: propertyIcon,
        draggable: isFullViewRef.current,
      }).addTo(mapInstance);

      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        onChangeLocation(position.lat, position.lng);
      });

      return marker;
    };

    // 2. Add Property Pin ONLY if landlord user has set coordinates / detected GPS
    if (lat !== null && lng !== null) {
      propertyMarkerRef.current = createPropertyMarker(map, lat, lng);
    }

    // 3. Add Property Pin ONLY if landlord user has set coordinates / detected GPS
    if (lat !== null && lng !== null) {
      propertyMarkerRef.current = createPropertyMarker(map, lat, lng);
    }

    // Invalidate size multiple times as container finishes mounting/animating
    const refreshMap = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize({ animate: false });
        if (tileLayerRef.current) {
          tileLayerRef.current.redraw();
        }
      }
    };

    refreshMap();
    const t1 = setTimeout(refreshMap, 50);
    const t2 = setTimeout(refreshMap, 150);
    const t3 = setTimeout(refreshMap, 300);
    const t4 = setTimeout(refreshMap, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {}
        leafletMapRef.current = null;
        tileLayerRef.current = null;
        propertyMarkerRef.current = null;
      }
    };
  }, [isFullView]);

  // Synchronize Pin Position and Map Center when lat / lng changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (lat !== null && lng !== null) {
      const propertyIcon = L.divIcon({
        className: "custom-posting-property-pin",
        html: `
          <div class="relative flex flex-col items-center cursor-grab active:cursor-grabbing group">
            <div class="text-rose-600 drop-shadow-md transition-transform transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="currentColor" stroke="#ffffff" stroke-width="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
      });

      if (!propertyMarkerRef.current) {
        const marker = L.marker([lat, lng], {
          icon: propertyIcon,
          draggable: isFullViewRef.current,
        }).addTo(map);

        marker.on("dragend", (e: any) => {
          const position = e.target.getLatLng();
          onChangeLocation(position.lat, position.lng);
        });

        propertyMarkerRef.current = marker;
      } else {
        propertyMarkerRef.current.setLatLng([lat, lng]);
      }
      map.panTo([lat, lng], { animate: true });
    } else {
      if (propertyMarkerRef.current) {
        propertyMarkerRef.current.remove();
        propertyMarkerRef.current = null;
      }
    }
  }, [lat, lng]);

  const [gpsNotice, setGpsNotice] = useState<{
    type: "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Process and validate obtained GPS position
  const processPosition = (position: GeolocationPosition) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    setIsLocating(false);

    // ALWAYS move the pin to exact GPS location
    onChangeLocation(userLat, userLng);
    setIsGpsSuccess(true);

    const isGumacaRegion = userLat >= 13.70 && userLat <= 14.15 && userLng >= 121.80 && userLng <= 122.30;
    if (!isGumacaRegion) {
      setGpsNotice({
        type: "info",
        title: isTagalog ? "📍 Nakuha ang iyong Eksaktong GPS Location" : "📍 Exact GPS Location Acquired",
        message: isTagalog 
          ? `Naka-center na sa iyong eksaktong GPS coordinates (Lat: ${userLat.toFixed(5)}, Lng: ${userLng.toFixed(5)}).`
          : `Centered at your exact GPS coordinates (Lat: ${userLat.toFixed(5)}, Lng: ${userLng.toFixed(5)}).`
      });
    } else {
      setGpsNotice(null);
    }

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([userLat, userLng], 17, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  // Fast GPS Trigger with robust fallback
  const handleGetGPSLocation = () => {
    setIsFullView(true);
    setIsLocating(true);
    setGpsError(null);
    setGpsNotice(null);
    setIsGpsSuccess(false);

    if (!navigator.geolocation) {
      setGpsError(
        isTagalog
          ? "Hindi supported ng iyong browser ang Geolocation. I-click na lamang ang pwesto sa mapa."
          : "Geolocation is not supported by your browser. Please click the location on the map."
      );
      setIsLocating(false);
      return;
    }

    // Attempt 1: High accuracy with 10s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => processPosition(pos),
      () => {
        // Fallback attempt 2: Standard accuracy (fast cell/wifi position)
        navigator.geolocation.getCurrentPosition(
          (pos) => processPosition(pos),
          (err) => {
            setIsLocating(false);
            if (err.code === err.PERMISSION_DENIED) {
              setGpsError(
                isTagalog
                  ? "Paki-tulutan ang Location Access sa iyong browser o i-click ang pwesto sa mapa."
                  : "Please allow location access in your browser or click the location on the map."
              );
            } else if (err.code === err.TIMEOUT) {
              setGpsError(
                isTagalog
                  ? "Nag-timeout ang GPS request. Paki-subukan muli o i-click ang pwesto sa mapa."
                  : "GPS request timed out. Please try again or click the location on the map."
              );
            } else {
              setGpsError(
                isTagalog
                  ? "Hindi makuha ang GPS. Maaari mong i-click nang direkta sa mapa ang eksaktong pwesto."
                  : "Unable to get GPS. You can click directly on the map for the exact location."
              );
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Instant Reset to Gumaca Barangay Center
  const handleResetToGumacaBarangay = () => {
    setIsFullView(true);
    const coords = getNeighborhoodDefaultLatLng(neighborhood);
    onChangeLocation(coords[0], coords[1]);
    setGpsError(null);
    setGpsNotice(null);
    setIsGpsSuccess(false);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([coords[0], coords[1]], 16, { animate: true });
    }
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 space-y-3 transition-colors">
      {/* Header & Geolocation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl text-indigo-700 dark:text-indigo-300">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100">
              {isTagalog ? "Lokasyon sa Mapa (Gumaca, Quezon Pin) 📍" : "Map Location (Gumaca, Quezon Pin) 📍"}
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              {isTagalog
                ? "I-click ang eksaktong pwesto ng bahay o apartment sa Gumaca, Quezon"
                : "Click the exact location of the house or apartment in Gumaca, Quezon"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap sm:flex-nowrap">
          {/* Quick Reset to Barangay Button */}
          <button
            type="button"
            onClick={handleResetToGumacaBarangay}
            className="bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl py-1.5 px-2.5 text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
            title={isTagalog ? "I-center ang pin sa napiling Barangay sa Gumaca" : "Center pin to selected Barangay in Gumaca"}
          >
            <Compass className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{isTagalog ? "Reset sa Barangay 📍" : "Reset to Barangay 📍"}</span>
          </button>

          {/* GPS Button */}
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isLocating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-1.5 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 whitespace-nowrap"
          >
            {isLocating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isTagalog ? "Kinukuha ang GPS..." : "Getting GPS..."}</span>
              </>
            ) : (
              <>
                <Navigation className="h-3.5 w-3.5 fill-white/20" />
                <span>{isTagalog ? "Exact GPS Location Ko 📍" : "My Exact GPS Location 📍"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* GPS Status & Notifications */}
      {isGpsSuccess && lat !== null && lng !== null && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] p-2.5 rounded-xl flex items-center justify-between gap-2 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>{isTagalog ? "Nahanap at Inilipat sa Exact GPS Location!" : "Found and Moved to Exact GPS Location!"}</strong> (Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)})
            </span>
          </div>
          <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
            GPS Active 📍
          </span>
        </div>
      )}

      {gpsNotice && (
        <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-start gap-2 ${
          gpsNotice.type === "warning" ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300" : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300"
        }`}>
          <AlertCircle className={`h-4 w-4 shrink-0 mt-0.5 ${gpsNotice.type === "warning" ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`} />
          <div className="space-y-0.5">
            <p className="font-bold">{gpsNotice.title}</p>
            <p className="text-[10px] leading-relaxed opacity-90">{gpsNotice.message}</p>
          </div>
        </div>
      )}

      {gpsError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] p-2 rounded-xl flex items-center gap-1.5 font-medium">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* MAP CONTAINER AREA */}
      {!isFullView ? (
        /* COMPACT PREVIEW IN FORM */
        <div
          onClick={() => setIsFullView(true)}
          className="relative w-full h-52 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-xs cursor-pointer group hover:border-indigo-400 transition-colors bg-stone-100 dark:bg-stone-800"
        >
          <div
            ref={mapContainerRef}
            className="w-full h-full z-0 pointer-events-none select-none opacity-90"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Compact View Overlay Badges */}
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
            <div className="bg-stone-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md border border-white/20 flex items-center gap-1 shrink-0">
              <Lock className="h-3 w-3 text-amber-400" />
              <span>{isTagalog ? "Naka-lock (Static Preview)" : "Locked (Static Preview)"}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullView(true);
              }}
              className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg shadow-lg border border-indigo-400/80 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-transform active:scale-95 shrink-0"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Full View 📍</span>
            </button>
          </div>

          <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-stone-800/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-700 rounded-xl px-2.5 py-1.5 shadow-md flex items-center justify-between gap-2 z-10 group-hover:bg-indigo-50/90 dark:group-hover:bg-stone-750 transition-colors">
            <div className="flex items-center gap-1 text-[10px] font-mono text-stone-700 dark:text-stone-200 min-w-0">
              <Crosshair className="h-3 w-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
              {lat !== null && lng !== null ? (
                <span className="truncate">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
              ) : (
                <span className="truncate font-sans italic text-amber-700 dark:text-amber-400 font-semibold">
                  {isTagalog ? "Wala pang nakalagay na pin (Paki-GPS)" : "No pin set yet (Use GPS)"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0 flex items-center gap-0.5 whitespace-nowrap">
              <span>{isTagalog ? "Pindutin para palitan" : "Click to change"}</span>
              <span>→</span>
            </span>
          </div>
        </div>
      ) : (
        /* FORM PLACEHOLDER WHILE FULL VIEW IS ACTIVE */
        <div
          onClick={() => setIsFullView(true)}
          className="relative w-full h-52 rounded-2xl overflow-hidden border-2 border-indigo-500 bg-indigo-950 p-4 text-white flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-lg animate-pulse"
        >
          <Compass className="h-8 w-8 text-indigo-400 animate-spin" style={{ animationDuration: "10s" }} />
          <div>
            <h4 className="font-bold text-sm text-white">
              {isTagalog ? "Naka-open ang Full View Map 📍" : "Full View Map Active 📍"}
            </h4>
            <p className="text-xs text-indigo-200 mt-0.5">
              {isTagalog
                ? "Nasa full screen ang mapa para mas madaling mag-pin ng eksaktong lokasyon."
                : "Map is in full screen mode for easy exact location pinning."}
            </p>
          </div>
          <span className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md mt-1">
            {isTagalog ? "Bumalik sa Full View Map" : "Return to Full View Map"}
          </span>
        </div>
      )}

      {/* FULL VIEW MAP PORTAL (MOUNTED DIRECTLY TO DOCUMENT BODY) */}
      {isFullView && createPortal(
        <div className="fixed inset-0 z-[999999] bg-stone-950 flex flex-col w-screen h-screen overflow-hidden">
          {/* Full Screen Header Bar */}
          <div className="bg-stone-900 text-white px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 shrink-0 border-b border-stone-800 shadow-lg z-20">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-xs sm:text-base text-white truncate flex items-center gap-1.5">
                  <span>Gumaca Map Location Selector</span>
                  <span>🗺️</span>
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-300 truncate">
                  {isTagalog
                    ? "I-drag ang pin o i-click sa mapa ang exact location."
                    : "Drag the pin or click on the map for the exact location."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isLocating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-1.5 px-2.5 sm:px-3 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isLocating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Navigation className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{isTagalog ? "GPS Ko 📍" : "My GPS 📍"}</span>
              </button>

              {lat !== null && lng !== null ? (
                <button
                  type="button"
                  onClick={() => setIsFullView(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-1.5 px-3 sm:px-4 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  <span>{isTagalog ? "I-confirm Pin Location ✓" : "Confirm Pin Location ✓"}</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsFullView(false)}
                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                title={isTagalog ? "Isara ang Full View Map" : "Close Full View Map"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* GPS Banner inside Full View */}
          {lat !== null && lng !== null && (
            <div className="bg-stone-900 text-emerald-400 text-xs px-3 sm:px-4 py-2 border-b border-stone-800 flex items-center justify-between shrink-0 font-medium z-20">
              <div className="flex items-center gap-2 truncate">
                <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0"></span>
                <span className="truncate">
                  📍 Active Coordinates: <strong>Lat {lat.toFixed(5)}, Lng {lng.toFixed(5)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* FULL VIEW MAP ELEMENT CONTAINER */}
          <div className="relative flex-1 w-full h-full bg-stone-900 overflow-hidden">
            <div
              ref={mapContainerRef}
              className="w-full h-full z-0"
              style={{ width: "100%", height: "100%" }}
            />

            {/* Floating Bottom Card (Full View Mode) */}
            <div className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl z-10 flex flex-col space-y-2">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                  <Crosshair className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  {lat !== null && lng !== null
                    ? (isTagalog ? "Selected Pin Coordinates" : "Selected Pin Coordinates")
                    : (isTagalog ? "Walang Pin Pa" : "No Pin Yet")}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  lat !== null && lng !== null ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300" : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                }`}>
                  {lat !== null && lng !== null
                    ? (isTagalog ? "Active Pin 📍" : "Active Pin 📍")
                    : (isTagalog ? "Naka-off ang Pin 📍" : "Pin Disabled 📍")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-stone-50 dark:bg-stone-800 p-2 rounded-xl border border-stone-100 dark:border-stone-700">
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans uppercase font-bold block">Latitude</span>
                  <span className="text-stone-800 dark:text-stone-100 font-bold">{lat !== null ? lat.toFixed(6) : "--"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans uppercase font-bold block">Longitude</span>
                  <span className="text-stone-800 dark:text-stone-100 font-bold">{lng !== null ? lng.toFixed(6) : "--"}</span>
                </div>
              </div>
              {lat === null || lng === null ? (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 italic font-medium text-center">
                  {isTagalog ? (
                    <>I-click ang <strong>"GPS Ko 📍"</strong> o mag-click sa mapa para maglagay ng pin.</>
                  ) : (
                    <>Click <strong>"My GPS 📍"</strong> or click on the map to place a pin.</>
                  )}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setIsFullView(false)}
                className={`w-full rounded-xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                  lat !== null && lng !== null
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-stone-700 hover:bg-stone-600 text-stone-200"
                }`}
              >
                {lat !== null && lng !== null ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{isTagalog ? "I-confirm Pin Location ✓" : "Confirm Pin Location ✓"}</span>
                  </>
                ) : (
                  <span>{isTagalog ? "Isara ang Mapa (Walang Pin)" : "Close Map (No Pin)"}</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <p className="text-[10px] text-stone-500 dark:text-stone-400 italic flex items-center gap-1">
        <span>💡</span>
        <span>
          {isTagalog
            ? "Naka-lock ang mini preview para mabilis ang pag-scroll sa form. Pindutin ang mapa o ang Full View button para i-open at mag-set ng lokasyon."
            : "The mini preview is locked for smooth scrolling. Click the map or the Full View button to open and set a location."}
        </span>
      </p>
    </div>
  );
};
