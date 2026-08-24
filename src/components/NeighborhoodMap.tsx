import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { motion } from "motion/react";
import { GUMACA_SCHOOLS, getSchoolDistancesForProperty, getGumacaSchools, saveCustomSchoolCoord, resetCustomSchoolCoords, addCustomSchoolItem, deleteCustomSchoolItem, saveCustomPropertyCoord, getCustomPropertyCoords, resetCustomPropertyCoords, parsePropertyLatLng } from "../utils/schoolDistances";
import { AiMatch } from "../types";
import { Property } from "../data/properties";
import { Map, MapPin, Navigation, Layers, Compass, ExternalLink, School, Info, Search, Maximize2, Minimize2, Pencil, Trash2, Copy, Check, RotateCcw, Save, Ruler, Shapes, Footprints, GripHorizontal } from "lucide-react";

interface NeighborhoodMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenDetails?: (property: Property) => void;
  aiMatches?: AiMatch[];
  selectedSchoolId?: string;
}

// Convert percentage coordinates or fallback to real Gumaca Lat/Lng
const getLatLngForProperty = (p: Property): [number, number] => {
  if (!p) return [13.9220, 122.0995];
  return parsePropertyLatLng(p.coordinates, p.neighborhood, p.id);
};

// Key Landmarks in Gumaca, Quezon - Major Institutions, Barangays & Campus Hubs
const GUMACA_LANDMARKS = [
  // 13 Gumaca Barangays
  { name: "📍 Brgy. Tabing Dagat", lat: 13.923258, lng: 122.101460, type: "Barangay", desc: "Barangay Tabing Dagat, Gumaca" },
  { name: "📍 Brgy. Villa Nava", lat: 13.912125, lng: 122.104057, type: "Barangay", desc: "Barangay Villa Nava, Gumaca" },
  { name: "📍 Brgy. Peñafrancia", lat: 13.924800, lng: 122.095500, type: "Barangay", desc: "Barangay Peñafrancia, Gumaca" },
  { name: "📍 Brgy. Pipisik", lat: 13.925200, lng: 122.097500, type: "Barangay", desc: "Barangay Pipisik, Gumaca" },
  { name: "📍 Brgy. San Diego", lat: 13.920200, lng: 122.103800, type: "Barangay", desc: "Barangay San Diego, Gumaca" },
  { name: "📍 Brgy. Bagong Buhay", lat: 13.919000, lng: 122.098000, type: "Barangay", desc: "Barangay Bagong Buhay, Gumaca" },
  { name: "📍 Brgy. Mabini", lat: 13.922000, lng: 122.098500, type: "Barangay", desc: "Barangay Mabini, Gumaca" },
  { name: "📍 Brgy. Maunlad", lat: 13.921000, lng: 122.096500, type: "Barangay", desc: "Barangay Maunlad, Gumaca" },
  { name: "📍 Brgy. Buensuceso", lat: 13.928000, lng: 122.095000, type: "Barangay", desc: "Barangay Buensuceso, Gumaca" },
  { name: "📍 Brgy. Progreso Purok 1", lat: 13.918000, lng: 122.101000, type: "Barangay", desc: "Barangay Progreso Purok 1, Gumaca" },
  { name: "📍 Brgy. Rosario", lat: 13.924000, lng: 122.099000, type: "Barangay", desc: "Barangay Rosario, Gumaca" },

  // Key Landmarks
  { name: "SLSU Villa Nava Campus 🎓🌳", lat: 13.912125, lng: 122.104057, type: "University", desc: "Campus - Brgy. Villa Nava" },
  { name: "SLSU Tabing Dagat 🎓🌊", lat: 13.923258, lng: 122.101460, type: "University", desc: "Campus - Brgy. Tabing Dagat" },
  { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, type: "College", desc: "College, Gumaca" },
  { name: "Gumaca National High School (GNHS) 🏫", lat: 13.920500, lng: 122.094000, type: "High School", desc: "Gumaca NHS, Mabini/Poblacion" },
  { name: "Gumaca West & East Central Schools 🏫", lat: 13.918000, lng: 122.099000, type: "School", desc: "M.H. Del Pilar St. / Capisonda St." },
  { name: "Holy Child Academy / Sacred Heart 🏫", lat: 13.921500, lng: 122.099500, type: "High School", desc: "Holy Child Academy, Town Proper" },
  { name: "San Diego de Alcala Cathedral ⛪", lat: 13.921587, lng: 122.099428, type: "Church", desc: "Historic Parish Church, Town Proper" },
  { name: "Kutang San Diego 🏰", lat: 13.9238, lng: 122.0975, type: "Heritage", desc: "Historical Fort, Brgy. Tabing Dagat" },
  { name: "BIR District Office Gumaca 🏢", lat: 13.9188, lng: 122.0945, type: "Government", desc: "M.H. Del Pilar St." },
  { name: "Gumaca Grand Terminal 🚌", lat: 13.9200, lng: 122.0965, type: "Transit", desc: "Bus & Tricycle Terminal Hub" },
  { name: "Jollibee Gumaca 🍔🐝", lat: 13.920523, lng: 122.099064, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "McDonald's Gumaca 🍟🍔", lat: 13.920751, lng: 122.100299, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "Chowking Gumaca 🥢🥟", lat: 13.920489, lng: 122.098769, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "Novo Department Store 🛍️🏢", lat: 13.920196, lng: 122.097666, type: "Shopping", desc: "Department Store & Shopping, Maharlika Highway / Town Center" },
  { name: "Heritage Site 🏛️", lat: 13.923430, lng: 122.100694, type: "Heritage", desc: "Gumaca Heritage / Historical Landmark, Tabing Dagat" },
  { name: "Gumaca Public Market 🛒🐟", lat: 13.920509, lng: 122.101597, type: "Market", desc: "Public Market & Commercial Hub, Poblacion" },
  { name: "Puregold Gumaca 🟡🛒", lat: 13.921103, lng: 122.105650, type: "Shopping", desc: "Puregold Supermarket, Maharlika Highway / San Diego" },
  { name: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", lat: 13.919680, lng: 122.100656, type: "Transit", desc: "Jeepney Terminal for Macalelon, Unisan & Lopez" },
  { name: "Jeep Terminal (Lopez) 🚐", lat: 13.922163, lng: 122.100909, type: "Transit", desc: "Jeepney Terminal bound for Lopez" },
  { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, type: "Landmark", desc: "Piat Area, Mabini / Poblacion, Gumaca" },
  { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, type: "Heritage", desc: "Holy Child Jesus Christ Church / Chapel, Town Proper, Gumaca" },
  { name: "578 Emporium 🛍️🏬", lat: 13.921341, lng: 122.103364, type: "Shopping", desc: "Emporium & Shopping Center, Maharlika Highway, Gumaca" },
];

// Helper to estimate street name / barangay based on exact Google Maps coordinates in Gumaca
const getStreetInfoForCoordinates = (lat: number, lng: number) => {
  let street = "AH26 / Pan-Philippine (Maharlika) Highway";
  let barangay = "Poblacion, Gumaca";

  if (lat > 13.9240 && lng < 122.1000) {
    street = "Quayside Blvd / Coastal Road (Near Kutang San Diego)";
    barangay = "Barangay Tabing Dagat (Coastal Quayside Area)";
  } else if (lat > 13.9220 && lng > 122.1000 && lat < 13.9250) {
    street = "Nava Blvd / P. Burgos Street";
    barangay = "Barangay San Diego (Coastal View)";
  } else if (lat < 13.9200 && lng < 122.0960) {
    street = "M.H. Del Pilar Street (Near BIR District Office)";
    barangay = "Barangay Pipisik / West Area";
  } else if (lat < 13.9200 && lng > 122.1020) {
    street = "AH26 Maharlika Hwy East / Villa Nava Road";
    barangay = "Barangay Villa Nava / San Diego";
  } else if (lng < 122.0975) {
    street = "M.H. Del Pilar Street / Terminal Alley";
    barangay = "Barangay Pipisik";
  } else if (lat < 13.9210 && lng > 122.0980 && lng < 122.1010) {
    street = "Capisonda Street / T. Tañada Street";
    barangay = "Barangay Mabini (Town Proper)";
  } else if (lng >= 122.0975 && lng <= 122.1000) {
    street = "J.P. Rizal Street / D. Arcaya Street";
    barangay = "Barangay Mabini (Town Center)";
  }

  // Calculate distance to SLSU Tabing Dagat (13.9252, 122.0975)
  const dLatTD = (lat - 13.9252) * 111000;
  const dLngTD = (lng - 122.0975) * 111000 * Math.cos(13.9252 * Math.PI / 180);
  const distTabingDagat = Math.round(Math.sqrt(dLatTD * dLatTD + dLngTD * dLngTD));
  const walkTabingDagat = Math.max(1, Math.round(distTabingDagat / 75));

  // Calculate distance to SLSU Villa Nava (13.912125, 122.104057)
  const dLatVN = (lat - 13.912125) * 111000;
  const dLngVN = (lng - 122.104057) * 111000 * Math.cos(13.912125 * Math.PI / 180);
  const distVillaNava = Math.round(Math.sqrt(dLatVN * dLatVN + dLngVN * dLngVN));
  const walkVillaNava = Math.max(1, Math.round(distVillaNava / 75));

  return {
    street,
    barangay,
    distTabingDagat,
    walkTabingDagat,
    distVillaNava,
    walkVillaNava,
    lat: lat.toFixed(4),
    lng: lng.toFixed(4)
  };
};

export default function NeighborhoodMap({
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenDetails,
  aiMatches,
  selectedSchoolId
}: NeighborhoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const propertyCardRef = useRef<HTMLDivElement>(null);

  const [clickedStreet, setClickedStreet] = useState<{
    street: string;
    barangay: string;
    distTabingDagat: number;
    walkTabingDagat: number;
    distVillaNava: number;
    walkVillaNava: number;
    lat: string;
    lng: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapMode, setMapMode] = useState<"streets" | "satellite" | "google_embed" | "osm">("satellite");
  const [showLandmarks, setShowLandmarks] = useState(false);

  const [showGrid, setShowGrid] = useState(false);

  // Interactive Boundary & Polygon Drawing States
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawingPanelMinimized, setIsDrawingPanelMinimized] = useState(false);
  const [drawShapeType, setDrawShapeType] = useState<"polygon" | "polyline" | "points">("polygon");
  const [drawColor, setDrawColor] = useState<string>("#2563eb"); // Vivid Blue
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(null);
  const [drawnPoints, setDrawnPoints] = useState<{ lat: number; lng: number }[]>([]);
  const DEFAULT_GUMACA_BOUNDARIES = [
    {
      id: "b1",
      barangayName: "Barangay Tabing Dagat",
      color: "#10b981",
      points: [[13.9230, 122.0990], [13.9258, 122.0980], [13.9262, 122.1025], [13.9235, 122.1030]] as [number, number][]
    },
    {
      id: "b2",
      barangayName: "Barangay Villa Nava",
      color: "#6366f1",
      points: [[13.9150, 122.0970], [13.9185, 122.0965], [13.9190, 122.1005], [13.9155, 122.1010]] as [number, number][]
    },
    {
      id: "b3",
      barangayName: "Barangay San Diego",
      color: "#f59e0b",
      points: [[13.9210, 122.1030], [13.9240, 122.1035], [13.9235, 122.1070], [13.9205, 122.1065]] as [number, number][]
    },
    {
      id: "b4",
      barangayName: "Barangay Bagong Buhay",
      color: "#0ea5e9",
      points: [[13.9200, 122.0980], [13.9220, 122.0980], [13.9220, 122.1005], [13.9200, 122.1005]] as [number, number][]
    },
    {
      id: "b5",
      barangayName: "Barangay Rizal",
      color: "#8b5cf6",
      points: [[13.9180, 122.0930], [13.9210, 122.0930], [13.9210, 122.0970], [13.9180, 122.0970]] as [number, number][]
    },
    {
      id: "b6",
      barangayName: "Barangay Rosario",
      color: "#f43f5e",
      points: [[13.9150, 122.1020], [13.9180, 122.1020], [13.9180, 122.1060], [13.9150, 122.1060]] as [number, number][]
    },
    {
      id: "b7",
      barangayName: "Barangay Pipisik",
      color: "#14b8a6",
      points: [[13.9215, 122.0990], [13.9235, 122.0990], [13.9235, 122.1020], [13.9215, 122.1020]] as [number, number][]
    },
    {
      id: "b8",
      barangayName: "Barangay Buensuceso",
      color: "#f97316",
      points: [[13.9230, 122.1050], [13.9260, 122.1050], [13.9260, 122.1090], [13.9230, 122.1090]] as [number, number][]
    },
    {
      id: "b9",
      barangayName: "Barangay Mabini",
      color: "#84cc16",
      points: [[13.9170, 122.0950], [13.9200, 122.0950], [13.9200, 122.0980], [13.9170, 122.0980]] as [number, number][]
    },
    {
      id: "b10",
      barangayName: "Barangay Peñafrancia",
      color: "#06b6d4",
      points: [[13.9250, 122.1000], [13.9280, 122.1000], [13.9280, 122.1040], [13.9250, 122.1040]] as [number, number][]
    },
    {
      id: "b11",
      barangayName: "Barangay Progreso Purok 1",
      color: "#7c3aed",
      points: [[13.9130, 122.0940], [13.9160, 122.0940], [13.9160, 122.0980], [13.9130, 122.0980]] as [number, number][]
    },
    {
      id: "b12",
      barangayName: "Barangay Maunlad",
      color: "#ec4899",
      points: [[13.9200, 122.1005], [13.9225, 122.1005], [13.9225, 122.1035], [13.9200, 122.1035]] as [number, number][]
    }
  ];

  const [drawnBarangayBoundaries, setDrawnBarangayBoundaries] = useState<{
    id: string;
    barangayName: string;
    color: string;
    points: [number, number][];
  }[]>(() => {
    try {
      const saved = localStorage.getItem("barangay_drawn_boundaries");
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved boundaries from localStorage:", e);
    }
    return DEFAULT_GUMACA_BOUNDARIES;
  });

  // Automatically persist saved barangay boundaries to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(drawnBarangayBoundaries));
    } catch (e) {
      console.error("Failed to write saved boundaries to localStorage:", e);
    }
  }, [drawnBarangayBoundaries]);
  const [selectedBarangayToSave, setSelectedBarangayToSave] = useState("Barangay Tabing Dagat");
  const [selectedBarangayBoundaryFilter, setSelectedBarangayBoundaryFilter] = useState<string>("");
  const [isMobileQuickJumpOpen, setIsMobileQuickJumpOpen] = useState(false);
  const [isPropertyCardDismissed, setIsPropertyCardDismissed] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState("");

  useEffect(() => {
    if (selectedProperty) {
      setIsPropertyCardDismissed(false);
    }
  }, [selectedProperty]);
  const [showBoundariesOnMap, setShowBoundariesOnMap] = useState(true);
  const [showSchoolsOnMap, setShowSchoolsOnMap] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const [userExactGps, setUserExactGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const userGpsCircleRef = useRef<L.Circle | null>(null);

  const [villaNavaCoords, setVillaNavaCoords] = useState<[number, number]>([13.912125, 122.104057]);
  const [tabingDagatCoords, setTabingDagatCoords] = useState<[number, number]>([13.9252, 122.0975]);
  const [activeArrowLocation, setActiveArrowLocation] = useState<{
    lat: number;
    lng: number;
    title: string;
    desc?: string;
  } | null>(null);

  const [activeSchoolRouteFilter, setActiveSchoolRouteFilter] = useState<string>("all");
  const [dismissedSchoolId, setDismissedSchoolId] = useState<string | null>(null);

  useEffect(() => {
    setDismissedSchoolId(null);
  }, [selectedSchoolId, selectedProperty]);

  const [schoolRevision, setSchoolRevision] = useState(0);

  // School Pinpoint Editing System state
  const [isEntranceEditingMode, setIsEntranceEditingMode] = useState(false);
  const isEntranceEditingModeRef = useRef(isEntranceEditingMode);
  isEntranceEditingModeRef.current = isEntranceEditingMode;

  const [selectedEditingSchoolId, setSelectedEditingSchoolId] = useState("slsu-main");
  const [editingCampusLat, setEditingCampusLat] = useState<number>(13.923258);
  const [editingCampusLng, setEditingCampusLng] = useState<number>(122.101460);
  const [entranceSaveToast, setEntranceSaveToast] = useState<string | null>(null);
  const isDraggingMarkerRef = useRef(false);

  // System Box Tabs & Add School Form State
  const [systemTab, setSystemTab] = useState<"edit" | "add">("edit");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolShortName, setNewSchoolShortName] = useState("");
  const [newSchoolType, setNewSchoolType] = useState<'University' | 'College' | 'High School' | 'Elementary'>("College");
  const [newSchoolDesc, setNewSchoolDesc] = useState("");
  const [newSchoolCampusLat, setNewSchoolCampusLat] = useState<number>(13.922000);
  const [newSchoolCampusLng, setNewSchoolCampusLng] = useState<number>(122.099500);

  // System Box Scroll References & Functions
  const systemBoxScrollRef = useRef<HTMLDivElement | null>(null);
  const addFormSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToTopSystemBox = () => {
    systemBoxScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottomSystemBox = () => {
    if (systemBoxScrollRef.current) {
      systemBoxScrollRef.current.scrollTo({
        top: systemBoxScrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const scrollToAddSectionSystemBox = () => {
    setSystemTab("add");
    setTimeout(() => {
      addFormSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  const entranceLayerRef = useRef<L.LayerGroup | null>(null);
  const campusMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const activeSchools = getGumacaSchools();
    const sch = activeSchools.find(s => s.id === selectedEditingSchoolId) || activeSchools[0];
    if (sch) {
      setEditingCampusLat(sch.lat);
      setEditingCampusLng(sch.lng);
    }
  }, [selectedEditingSchoolId, schoolRevision]);

  // Removed outside click listener so card stays visible until X button is clicked
  useEffect(() => {
    const handleUpdate = () => {
      setSchoolRevision(r => r + 1);
    };
    window.addEventListener("casafinder_school_coords_updated", handleUpdate);

    return () => {
      window.removeEventListener("casafinder_school_coords_updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== "all" && selectedSchoolId !== "none") {
      setActiveSchoolRouteFilter(selectedSchoolId);
    } else {
      setActiveSchoolRouteFilter("none");
    }
  }, [selectedSchoolId, selectedProperty]);

  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const drawingLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const isDrawingModeRef = useRef(isDrawingMode);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);
  const lastAddedTimeRef = useRef<number>(0);

  const [pixelPoints, setPixelPoints] = useState<{ x: number; y: number; lat: number; lng: number }[]>([]);
  const [mousePixel, setMousePixel] = useState<{ x: number; y: number } | null>(null);
  const [savedPixelBoundaries, setSavedPixelBoundaries] = useState<{
    id: string;
    barangayName: string;
    color: string;
    points: { x: number; y: number; lat: number; lng: number }[];
    center: { x: number; y: number };
  }[]>([]);

  const addPointIfNew = (lat: number, lng: number) => {
    const now = Date.now();
    if (now - lastAddedTimeRef.current < 250) return;
    lastAddedTimeRef.current = now;

    setDrawnPoints(prev => [...prev, { lat, lng }]);
  };

  const handleUndoPoint = () => {
    setDrawnPoints(prev => prev.slice(0, -1));
  };

  const handleClearPoints = () => {
    setDrawnPoints([]);
  };

  // Synchronize React DOM SVG & Badge Overlay with Leaflet Map Coordinates
  useEffect(() => {
    const updatePixels = () => {
      const map = leafletMapRef.current;
      if (!map) return;

      const pxs = drawnPoints.map(p => {
        const containerPt = map.latLngToContainerPoint([p.lat, p.lng]);
        return { x: containerPt.x, y: containerPt.y, lat: p.lat, lng: p.lng };
      });
      setPixelPoints(pxs);

      if (showBoundariesOnMap && drawnBarangayBoundaries.length > 0) {
        const filteredBoundaries = (selectedBarangayBoundaryFilter && selectedBarangayBoundaryFilter !== "ALL_BARANGAYS")
          ? drawnBarangayBoundaries.filter(b => b.barangayName === selectedBarangayBoundaryFilter)
          : drawnBarangayBoundaries;

        const savedPxs = filteredBoundaries.map(b => {
          const pts = b.points.map(p => {
            const containerPt = map.latLngToContainerPoint([p[0], p[1]]);
            return { x: containerPt.x, y: containerPt.y, lat: p[0], lng: p[1] };
          });
          const cLat = b.points.reduce((acc, p) => acc + p[0], 0) / b.points.length;
          const cLng = b.points.reduce((acc, p) => acc + p[1], 0) / b.points.length;
          const centerPt = map.latLngToContainerPoint([cLat, cLng]);
          return {
            id: b.id,
            barangayName: b.barangayName,
            color: b.color || "#6366f1",
            points: pts,
            center: { x: centerPt.x, y: centerPt.y }
          };
        });
        setSavedPixelBoundaries(savedPxs);
      } else {
        setSavedPixelBoundaries([]);
      }

      if (mousePos) {
        const mPt = map.latLngToContainerPoint([mousePos.lat, mousePos.lng]);
        setMousePixel({ x: mPt.x, y: mPt.y });
      } else {
        setMousePixel(null);
      }
    };

    const map = leafletMapRef.current;
    if (map) {
      map.on("move zoom viewreset resize mousemove", updatePixels);
      updatePixels();
    }

    return () => {
      if (map) {
        map.off("move zoom viewreset resize mousemove", updatePixels);
      }
    };
  }, [drawnPoints, mousePos, drawnBarangayBoundaries, showBoundariesOnMap, selectedBarangayBoundaryFilter]);

  useEffect(() => {
    isDrawingModeRef.current = isDrawingMode;

    // Set cursor on map container for visual drawing feedback
    const map = leafletMapRef.current;
    if (map) {
      const container = map.getContainer();
      if (container) {
        container.style.cursor = isDrawingMode ? "crosshair" : "";
      }
    }
  }, [isDrawingMode]);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 200);
  };

  // Searchable locations database in Gumaca
  const GUMACA_SEARCH_LOCATIONS: Array<{
    name: string;
    lat: number;
    lng: number;
    detail: string;
    propertyObj?: Property;
  }> = [
    { name: "SLSU Villa Nava Campus 🎓🌳", lat: 13.912125, lng: 122.104057, detail: "Brgy. Villa Nava Campus" },
    { name: "SLSU Tabing Dagat Campus 🎓🌊", lat: 13.923258, lng: 122.101460, detail: "Brgy. Tabing Dagat Campus" },
    { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, detail: "College, Gumaca" },
    { name: "Gumaca National High School (GNHS) 🏫", lat: 13.920500, lng: 122.094000, detail: "High School, Mabini/Poblacion" },
    { name: "Gumaca West & East Central Elementary 🏫", lat: 13.918000, lng: 122.099000, detail: "Elementary School, M.H. Del Pilar St." },
    { name: "Holy Child Academy 🏫", lat: 13.921500, lng: 122.099500, detail: "High School / Academy, Town Proper" },
    // All 13 Gumaca Barangays with precise GPS Coordinates
    { name: "📍 Barangay Tabing Dagat", lat: 13.923258, lng: 122.101460, detail: "Coastal Quayside, Nava Blvd & SLSU Campus Area" },
    { name: "📍 Barangay Villa Nava", lat: 13.912125, lng: 122.104057, detail: "Maharlika Hwy East & SLSU Villa Nava Campus" },
    { name: "📍 Barangay Peñafrancia", lat: 13.924800, lng: 122.095500, detail: "Quayside / Coastal West Area" },
    { name: "📍 Barangay Pipisik", lat: 13.925200, lng: 122.097500, detail: "Poblacion Pipisik, EQC & Bus Terminal" },
    { name: "📍 Barangay San Diego", lat: 13.920200, lng: 122.103800, detail: "Puregold & San Diego Road Area" },
    { name: "📍 Barangay Bagong Buhay", lat: 13.919000, lng: 122.098000, detail: "Poblacion Central / West Central" },
    { name: "📍 Barangay Mabini", lat: 13.922000, lng: 122.098500, detail: "Town Proper & Cathedral Area" },
    { name: "📍 Barangay Maunlad", lat: 13.921000, lng: 122.096500, detail: "Grand Terminal & Poblacion West" },
    { name: "📍 Barangay Buensuceso", lat: 13.928000, lng: 122.095000, detail: "Northwest Coastal Area" },
    { name: "📍 Barangay Progreso Purok 1", lat: 13.918000, lng: 122.101000, detail: "Piat & Central South Area" },
    { name: "📍 Barangay Rosario", lat: 13.924000, lng: 122.099000, detail: "Municipal Hall & North Town Center" },
    { name: "Maharlika Highway (Gumaca Section)", lat: 13.9220, lng: 122.1000, detail: "Main Provincial Arterial Highway" },
    { name: "Quayside Boulevard", lat: 13.9255, lng: 122.0968, detail: "Lamon Bay Coastal Road" },
    { name: "Gumaca Municipal Hall & Plaza", lat: 13.9231, lng: 122.0982, detail: "Poblacion Center" },
    { name: "Jollibee Gumaca 🍔🐝", lat: 13.920523, lng: 122.099064, detail: "Fast Food Restaurant, Maharlika Highway" },
    { name: "McDonald's Gumaca 🍟🍔", lat: 13.920751, lng: 122.100299, detail: "Fast Food Restaurant, Maharlika Highway" },
    { name: "Chowking Gumaca 🥢🥟", lat: 13.920489, lng: 122.098769, detail: "Fast Food Restaurant, Maharlika Highway" },
    { name: "Novo Department Store 🛍️🏢", lat: 13.920196, lng: 122.097666, detail: "Department Store & Shopping, Maharlika Highway" },
    { name: "Heritage Site 🏛️", lat: 13.923430, lng: 122.100694, detail: "Gumaca Heritage Site, Tabing Dagat" },
    { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, detail: "College, Gumaca" },
    { name: "San Diego de Alcala Cathedral ⛪", lat: 13.921587, lng: 122.099428, detail: "Historic Parish Church, Town Proper" },
    { name: "Gumaca Public Market 🛒🐟", lat: 13.920509, lng: 122.101597, detail: "Public Market & Commercial Hub, Poblacion" },
    { name: "Puregold Gumaca 🟡🛒", lat: 13.921103, lng: 122.105650, detail: "Supermarket & Mall, Maharlika Highway" },
    { name: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", lat: 13.919680, lng: 122.100656, detail: "Jeep Terminal (Macalelon, Unisan, Lopez)" },
    { name: "Jeep Terminal (Lopez) 🚐", lat: 13.922163, lng: 122.100909, detail: "Jeep Terminal bound for Lopez" },
    { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, detail: "Piat Area, Mabini / Poblacion" },
    { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, detail: "Church / Chapel, Town Proper" },
    { name: "578 Emporium 🛍️🏬", lat: 13.921341, lng: 122.103364, detail: "Shopping Center & Emporium, Maharlika Highway" },
    ...properties.map(p => {
      const [lat, lng] = getLatLngForProperty(p);
      return {
        name: `🏠 ${p.title}`,
        lat,
        lng,
        detail: `Dorm / Boarding House - ₱${p.price.toLocaleString()}/mo in ${p.neighborhood}`,
        propertyObj: p
      };
    })
  ];

  const searchResults = searchQuery.trim()
    ? GUMACA_SEARCH_LOCATIONS.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent duplicate map initialization
    if (leafletMapRef.current) {
      leafletMapRef.current.invalidateSize();
      return;
    }

    // Create Map centered at Gumaca, Quezon with direct mouse wheel zoom enabled
    const map = L.map(mapContainerRef.current, {
      center: [13.9220, 122.0995],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      bounceAtZoom: false
    } as any);

    leafletMapRef.current = map;

    const container = map.getContainer();
    if (container) {
      container.style.touchAction = "none";
    }

    // Create high-contrast Top Overlay Pane for Drawing Layer
    if (!map.getPane("drawingPane")) {
      map.createPane("drawingPane");
      const dPane = map.getPane("drawingPane");
      if (dPane) {
        dPane.style.zIndex = "1200"; // Highest z-index above all tile layers, markers, popups
        dPane.style.pointerEvents = "none";
      }
    }

    // Google Maps Tile Layers
    const googleStreetUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const googleSatUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"; // Google Hybrid (Satellite + Labels)

    const initialTileUrl = mapMode === "satellite" ? googleSatUrl : googleStreetUrl;
    const initialAttr = mapMode === "satellite" ? "Google Maps Satellite | Gumaca, Quezon" : "Google Maps | Gumaca, Quezon";

    const layer = L.tileLayer(initialTileUrl, {
      maxZoom: 20,
      attribution: initialAttr
    }).addTo(map);

    tileLayerRef.current = layer;

    // Click on map to inspect street, add drawing point, or set school pinpoint
    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (isDrawingModeRef.current) {
        addPointIfNew(lat, lng);
      } else if (isEntranceEditingModeRef.current) {
        const fixedLat = Number(lat.toFixed(6));
        const fixedLng = Number(lng.toFixed(6));
        setEditingCampusLat(fixedLat);
        setEditingCampusLng(fixedLng);
      } else {
        const info = getStreetInfoForCoordinates(lat, lng);
        setClickedStreet(info);
      }
    });

    // Pointer-based fallback click handler (handles touchpad micro-drifts that suppress Leaflet's map click event)
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = Date.now();

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = Date.now();
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      const elapsed = Date.now() - pointerStartTime;

      if (dist < 12 && elapsed < 600) {
        const target = e.target as HTMLElement;
        if (target && target.closest(".leaflet-control, button, input, select, .leaflet-popup, .z-30, .z-40, .leaflet-marker-icon, .custom-school-editor-pin, .custom-school-marker-pin")) {
          return;
        }

        const latlng = map.mouseEventToLatLng(e);
        if (latlng && latlng.lat && latlng.lng) {
          if (isDrawingModeRef.current) {
            addPointIfNew(latlng.lat, latlng.lng);
          } else if (isEntranceEditingModeRef.current) {
            const fixedLat = Number(latlng.lat.toFixed(6));
            const fixedLng = Number(latlng.lng.toFixed(6));
            setEditingCampusLat(fixedLat);
            setEditingCampusLng(fixedLng);
          } else {
            const info = getStreetInfoForCoordinates(latlng.lat, latlng.lng);
            setClickedStreet(info);
          }
        }
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);

    // Mousemove for real-time live preview line from last point to cursor
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      if (isDrawingModeRef.current) {
        setMousePos({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    map.on("mouseout", () => {
      setMousePos(null);
    });

    // Clean up on unmount
    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Automatic Size Invalidation Effect for Mobile Tabs and Resizes
  useEffect(() => {
    const handleInvalidate = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };

    handleInvalidate();

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleInvalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(handleInvalidate, 100);
    const t2 = setTimeout(handleInvalidate, 350);
    const t3 = setTimeout(handleInvalidate, 700);

    window.addEventListener("resize", handleInvalidate);
    window.addEventListener("orientationchange", handleInvalidate);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleInvalidate);
      window.removeEventListener("orientationchange", handleInvalidate);
    };
  }, [isFullscreen]);

  // Update tile layer on mapMode change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const googleStreetUrl = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const googleSatUrl = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";

    const targetUrl = mapMode === "satellite" ? googleSatUrl : googleStreetUrl;
    const targetAttr = mapMode === "satellite" ? "Google Maps Satellite | Gumaca, Quezon" : "Google Maps | Gumaca, Quezon";

    const newLayer = L.tileLayer(targetUrl, {
      maxZoom: 20,
      attribution: targetAttr
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapMode]);

  // Coordinate Grid Overlay Effect
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!gridLayerRef.current) {
      gridLayerRef.current = L.layerGroup().addTo(map);
    } else {
      gridLayerRef.current.clearLayers();
    }

    if (showGrid) {
      const latStart = 13.880;
      const latEnd = 13.960;
      const lngStart = 122.050;
      const lngEnd = 122.200;
      const step = 0.005; // ~550m grid lines

      for (let lat = latStart; lat <= latEnd; lat += step) {
        const line = L.polyline([[lat, lngStart], [lat, lngEnd]], {
          color: "#f59e0b",
          weight: 1,
          dashArray: "4, 4",
          opacity: 0.6,
          interactive: false
        });
        gridLayerRef.current.addLayer(line);

        const labelIcon = L.divIcon({
          className: "grid-label-lat",
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lat.toFixed(3)}°N</div>`,
          iconSize: [50, 14],
          iconAnchor: [0, 7]
        });
        gridLayerRef.current.addLayer(L.marker([lat, lngStart + 0.001], { icon: labelIcon, interactive: false }));
      }

      for (let lng = lngStart; lng <= lngEnd; lng += step) {
        const line = L.polyline([[latStart, lng], [latEnd, lng]], {
          color: "#f59e0b",
          weight: 1,
          dashArray: "4, 4",
          opacity: 0.6,
          interactive: false
        });
        gridLayerRef.current.addLayer(line);

        const labelIcon = L.divIcon({
          className: "grid-label-lng",
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lng.toFixed(3)}°E</div>`,
          iconSize: [55, 14],
          iconAnchor: [27, 0]
        });
        gridLayerRef.current.addLayer(L.marker([latStart + 0.001, lng], { icon: labelIcon, interactive: false }));
      }
    }
  }, [showGrid]);

  // Distance calculation helpers (Haversine formula)
  const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateTotalPerimeter = (pts: { lat: number; lng: number }[], shape: "polygon" | "polyline" | "points") => {
    if (pts.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      dist += getDistanceInMeters(pts[i].lat, pts[i].lng, pts[i + 1].lat, pts[i + 1].lng);
    }
    if (shape === "polygon" && pts.length >= 3) {
      dist += getDistanceInMeters(pts[pts.length - 1].lat, pts[pts.length - 1].lng, pts[0].lat, pts[0].lng);
    }
    return dist;
  };

  const handleCopyCoordinates = (format: "json" | "csv" | "google") => {
    if (drawnPoints.length === 0) return;
    let text = "";
    if (format === "json") {
      text = JSON.stringify(drawnPoints.map(p => [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))]), null, 2);
    } else if (format === "csv") {
      text = drawnPoints.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("\n");
    } else if (format === "google") {
      const waypoints = drawnPoints.map(p => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join("/");
      text = `https://www.google.com/maps/dir/${waypoints}`;
    }

    navigator.clipboard.writeText(text);
    setCopySuccessMsg(`📋 Na-kopyang matagumpay ang ${drawnPoints.length} coordinates!`);
    setTimeout(() => setCopySuccessMsg(""), 3500);
  };

  const handleSaveBoundary = () => {
    if (drawnPoints.length < 2) {
      setCopySuccessMsg("⚠️ Maglagay ng kahit 2 o higit pang tuldok sa mapa para sa boundary!");
      setTimeout(() => setCopySuccessMsg(""), 3500);
      return;
    }

    const newBoundary = {
      id: `bound-${Date.now()}`,
      barangayName: selectedBarangayToSave,
      color: drawColor,
      points: drawnPoints.map(p => [p.lat, p.lng] as [number, number])
    };

    setDrawnBarangayBoundaries(prev => {
      const filtered = prev.filter(b => b.barangayName !== selectedBarangayToSave);
      const nextState = [...filtered, newBoundary];
      try {
        localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(nextState));
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
      return nextState;
    });

    setShowBoundariesOnMap(true);

    const lats = newBoundary.points.map(p => p[0]);
    const lngs = newBoundary.points.map(p => p[1]);
    const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const cLng = lngs.reduce((a, b) => a + b, 0) / lats.length;

    triggerArrowHighlight(cLat, cLng, `📍 Boundary: ${selectedBarangayToSave}`, `Opisyal na Na-save na Boundary (${newBoundary.points.length} tuldok)`, 16);

    if (leafletMapRef.current && newBoundary.points.length > 0) {
      const bounds = L.latLngBounds(newBoundary.points);
      leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
    }

    setDrawnPoints([]);
    setCopySuccessMsg(`🎉 Na-save at na-overlay na sa mapa ang opisyal na boundary ng ${selectedBarangayToSave}! (${newBoundary.points.length} tuldok)`);
    setTimeout(() => setCopySuccessMsg(""), 3500);
  };

  const handleDeleteBoundary = (id: string) => {
    setDrawnBarangayBoundaries(prev => {
      const nextState = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(nextState));
      } catch (e) {
        console.error("Error updating localStorage after delete:", e);
      }
      return nextState;
    });
    setCopySuccessMsg("🗑️ Na-burang matagumpay ang boundary!");
    setTimeout(() => setCopySuccessMsg(""), 3000);
  };

  const handleDeleteAllSavedBoundaries = () => {
    setDrawnBarangayBoundaries([]);
    try {
      localStorage.setItem("barangay_drawn_boundaries", JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
    setCopySuccessMsg("🗑️ Na-burang lahat ang mga na-save na boundary!");
    setTimeout(() => setCopySuccessMsg(""), 3000);
  };

  const handleRestoreDefaultBoundaries = () => {
    setDrawnBarangayBoundaries(DEFAULT_GUMACA_BOUNDARIES);
    try {
      localStorage.setItem("barangay_drawn_boundaries", JSON.stringify(DEFAULT_GUMACA_BOUNDARIES));
    } catch (e) {
      console.error(e);
    }
    setCopySuccessMsg("✨ Na-restore ang default 12 Barangay Boundaries ng Gumaca!");
    setTimeout(() => setCopySuccessMsg(""), 3500);
  };

  // Drawing Layer Render Effect
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!drawingLayerRef.current) {
      drawingLayerRef.current = L.layerGroup().addTo(map);
    } else {
      drawingLayerRef.current.clearLayers();
    }

    const layerGroup = drawingLayerRef.current;

    // 1. Render Saved Barangay Boundaries if toggled on
    if (showBoundariesOnMap) {
      drawnBarangayBoundaries.forEach((boundary) => {
        if (boundary.points.length >= 3) {
          // White high-contrast outline stroke
          const bgPoly = L.polygon(boundary.points, {
            color: "#ffffff",
            weight: 6,
            opacity: 0.9,
            fill: false,
            interactive: false
          });
          const poly = L.polygon(boundary.points, {
            color: boundary.color || "#6366f1",
            weight: 4,
            fillColor: boundary.color || "#6366f1",
            fillOpacity: 0.3,
            dashArray: "5, 5",
            interactive: false
          });

          const lats = boundary.points.map(p => p[0]);
          const lngs = boundary.points.map(p => p[1]);
          const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
          const cLng = lngs.reduce((a, b) => a + b, 0) / lats.length;

          const labelIcon = L.divIcon({
            className: "saved-boundary-badge !bg-transparent !border-none",
            html: `<div class="bg-indigo-950 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-2xl border-2 border-indigo-300 whitespace-nowrap pointer-events-none flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>🏛️ ${boundary.barangayName} (${boundary.points.length} Tuldok)</span>
            </div>`,
            iconSize: [160, 26],
            iconAnchor: [80, 13]
          });

          poly.bindPopup(`<b>${boundary.barangayName}</b><br/>Total Vertices: ${boundary.points.length}`);
          layerGroup.addLayer(bgPoly);
          layerGroup.addLayer(poly);
          layerGroup.addLayer(L.marker([cLat, cLng], { icon: labelIcon, interactive: false }));

          // Render Leaflet vertex dot markers (tuldok) on each vertex point
          boundary.points.forEach((pt) => {
            const dot = L.circleMarker(pt, {
              radius: 9,
              color: "#ffffff",
              weight: 3,
              fillColor: boundary.color || "#6366f1",
              fillOpacity: 1,
              interactive: false
            });
            layerGroup.addLayer(dot);
          });
        }
      });
    }

    // 2. Render Active Drawing Points & Polyline/Polygon
    if (drawnPoints.length > 0) {
      const coords: [number, number][] = drawnPoints.map(p => [p.lat, p.lng]);

      // Always draw connected polyline connecting all points with high contrast outline
      if (coords.length >= 2) {
        // High contrast white background outline line
        const bgLine = L.polyline(coords, {
          color: "#ffffff",
          weight: 8,
          opacity: 0.95,
          interactive: false
        });
        // Main colored line
        const mainLine = L.polyline(coords, {
          color: drawColor,
          weight: 5,
          opacity: 1,
          interactive: false
        });
        layerGroup.addLayer(bgLine);
        layerGroup.addLayer(mainLine);
      }

      // Fill polygon area if polygon mode and 3+ points
      if (drawShapeType === "polygon" && coords.length >= 3) {
        const poly = L.polygon(coords, {
          color: drawColor,
          weight: 5,
          fillColor: drawColor,
          fillOpacity: 0.35,
          interactive: false
        });
        layerGroup.addLayer(poly);
      }

      // Live Rubberband Preview Line from last point to cursor
      if (isDrawingMode && mousePos) {
        const lastPt = coords[coords.length - 1];
        const previewCoords: [number, number][] = [lastPt, [mousePos.lat, mousePos.lng]];

        const previewBg = L.polyline(previewCoords, {
          color: "#ffffff",
          weight: 6,
          dashArray: "6, 6",
          opacity: 0.9,
          interactive: false
        });
        const previewLine = L.polyline(previewCoords, {
          color: drawColor,
          weight: 3.5,
          dashArray: "6, 6",
          opacity: 1,
          interactive: false
        });
        layerGroup.addLayer(previewBg);
        layerGroup.addLayer(previewLine);

        // Preview polygon closing line back to point #1
        if (drawShapeType === "polygon" && coords.length >= 2) {
          const closingCoords: [number, number][] = [[mousePos.lat, mousePos.lng], coords[0]];
          const closingLine = L.polyline(closingCoords, {
            color: drawColor,
            weight: 2,
            dashArray: "4, 4",
            opacity: 0.6,
            interactive: false
          });
          layerGroup.addLayer(closingLine);
        }

        // Live cursor target indicator label
        const targetIcon = L.divIcon({
          className: "mouse-target-pin !bg-transparent !border-none",
          html: `
            <div class="pointer-events-none flex items-center gap-1.5 bg-indigo-950/90 text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-full shadow-2xl border border-emerald-400 backdrop-blur-xs whitespace-nowrap animate-pulse">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Click para sa Tuldok #${coords.length + 1}</span>
            </div>
          `,
          iconSize: [160, 24],
          iconAnchor: [80, 28]
        });
        layerGroup.addLayer(L.marker([mousePos.lat, mousePos.lng], { icon: targetIcon, interactive: false }));
      }

      // Vertex Markers with sequence number 1, 2, 3...
      drawnPoints.forEach((pt, index) => {
        const isFirst = index === 0;
        const isLast = index === drawnPoints.length - 1;

        // Guaranteed SVG CircleMarker rendering
        const dot = L.circleMarker([pt.lat, pt.lng], {
          radius: 12,
          color: "#ffffff",
          weight: 4,
          fillColor: isFirst ? "#059669" : isLast ? "#e11d48" : "#2563eb",
          fillOpacity: 1,
          interactive: false
        });
        layerGroup.addLayer(dot);

        // Super High-Contrast Glowing Target Overlay Badge
        const vertexIcon = L.divIcon({
          className: "vertex-marker !bg-transparent !border-none",
          html: `
            <div class="pointer-events-none relative flex flex-col items-center justify-center">
              <!-- Outer glowing pulse aura ring -->
              <span class="absolute w-11 h-11 rounded-full animate-ping opacity-75 ${
                isFirst ? "bg-emerald-400" : isLast ? "bg-rose-400" : "bg-blue-400"
              }"></span>
              
              <!-- Numbered Core Pin Badge -->
              <div class="relative flex items-center justify-center w-8 h-8 rounded-full font-black text-[13px] text-white shadow-[0_0_20px_rgba(0,0,0,0.6)] border-2 border-white ${
                isFirst
                  ? "bg-emerald-600 ring-4 ring-emerald-300"
                  : isLast
                  ? "bg-rose-600 ring-4 ring-rose-300"
                  : "bg-blue-600 ring-4 ring-blue-300"
              }">
                ${index + 1}
              </div>

              <!-- Top/Bottom Label Pill -->
              ${
                isFirst
                  ? `<div class="absolute -top-6 bg-emerald-900 text-emerald-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow border border-emerald-400 whitespace-nowrap">▶ SIMULA (#1)</div>`
                  : isLast && drawnPoints.length > 1
                  ? `<div class="absolute -bottom-6 bg-rose-900 text-rose-200 text-[9px] font-extrabold px-1.5 py-0.2 rounded shadow border border-rose-400 whitespace-nowrap">📌 TULDOK #${index + 1}</div>`
                  : ""
              }
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: vertexIcon, interactive: false });
        layerGroup.addLayer(marker);
      });
    }
  }, [drawnPoints, drawShapeType, drawColor, drawnBarangayBoundaries, showBoundariesOnMap, isDrawingMode, mousePos]);

  // Render Interactive Draggable School Pins on Map when editing mode is active
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!entranceLayerRef.current) {
      entranceLayerRef.current = L.layerGroup().addTo(map);
    } else {
      entranceLayerRef.current.clearLayers();
    }

    if (isEntranceEditingMode) {
      const activeSchools = getGumacaSchools();
      activeSchools.forEach((sch) => {
        const isSelected = (sch.id === selectedEditingSchoolId);
        const currentLat = sch.lat;
        const currentLng = sch.lng;

        const schoolIcon = L.divIcon({
          className: `custom-school-editor-pin !bg-transparent !border-none ${isSelected ? 'z-50' : 'z-30'}`,
          html: `
            <div class="cursor-grab active:cursor-grabbing group flex flex-col items-center select-none pointer-events-auto">
              <div class="relative flex items-center justify-center">
                ${isSelected ? '<div class="absolute -inset-2 bg-amber-400/50 rounded-full animate-ping pointer-events-none"></div>' : ''}
                <div class="w-10 h-10 ${isSelected ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-stone-950 border-3 border-stone-950 scale-110 shadow-2xl' : 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-amber-300 border-2 border-amber-400 shadow-xl'} rounded-full flex items-center justify-center font-black text-lg">
                  🎓
                </div>
              </div>
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-amber-500' : 'border-t-amber-400'} -mt-0.5 drop-shadow-md"></div>
              <div class="${isSelected ? 'bg-amber-400 text-stone-950 font-black ring-2 ring-stone-950 scale-105' : 'bg-stone-950/90 text-amber-300 font-bold'} text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400 shadow-xl mt-1 whitespace-nowrap flex items-center gap-1">
                <span>🎓 ${sch.shortName || sch.name}</span>
                ${isSelected ? '<span class="text-[8px] bg-stone-950 text-amber-300 px-1 rounded font-mono font-black">I-DRAG</span>' : ''}
              </div>
            </div>
          `,
          iconSize: [160, 56],
          iconAnchor: [80, 42]
        });

        const marker = L.marker([currentLat, currentLng], {
          icon: schoolIcon,
          draggable: true,
          autoPan: true,
          title: `I-drag upang palitan ang lokasyon ng ${sch.name}`,
          zIndexOffset: isSelected ? 10000 : 5000
        });

        marker.on("add", () => {
          const markerIcon = (marker as any)._icon;
          if (markerIcon) {
            L.DomEvent.disableClickPropagation(markerIcon);
            L.DomEvent.disableScrollPropagation(markerIcon);
          }
        });

        marker.on("dragstart", () => {
          isDraggingMarkerRef.current = true;
          map.dragging.disable();
          setSelectedEditingSchoolId(sch.id);
        });

        marker.on("drag", (e: any) => {
          const latlng = e.target.getLatLng();
          const newLat = Number(latlng.lat.toFixed(6));
          const newLng = Number(latlng.lng.toFixed(6));
          setEditingCampusLat(newLat);
          setEditingCampusLng(newLng);
        });

        marker.on("dragend", (e: any) => {
          isDraggingMarkerRef.current = false;
          map.dragging.enable();
          const latlng = e.target.getLatLng();
          const newLat = Number(latlng.lat.toFixed(6));
          const newLng = Number(latlng.lng.toFixed(6));
          saveCustomSchoolCoord(sch.id, newLat, newLng);
          setEditingCampusLat(newLat);
          setEditingCampusLng(newLng);
          setSchoolRevision(r => r + 1);
          setEntranceSaveToast(`Na-drag at na-update ang lokasyon ng ${sch.shortName || sch.name}! ✨`);
          setTimeout(() => setEntranceSaveToast(null), 3000);
        });

        marker.on("click", () => {
          setSelectedEditingSchoolId(sch.id);
          setEditingCampusLat(sch.lat);
          setEditingCampusLng(sch.lng);
        });

        if (isSelected) {
          campusMarkerRef.current = marker;
        }

        entranceLayerRef.current?.addLayer(marker);
      });
    } else {
      campusMarkerRef.current = null;
    }
  }, [isEntranceEditingMode, selectedEditingSchoolId, schoolRevision]);

  // Keep selected marker position synchronized when state coordinates update from inputs or map click (but not while dragging)
  useEffect(() => {
    if (isEntranceEditingMode && campusMarkerRef.current && !isDraggingMarkerRef.current) {
      campusMarkerRef.current.setLatLng([editingCampusLat, editingCampusLng]);
    }
  }, [editingCampusLat, editingCampusLng, isEntranceEditingMode]);




  // Update Markers whenever properties, selectedProperty, or campus coordinates change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Quick Jump Arrow Pointer (Rendered whenever triggered by Quick Jump or Search)
    if (activeArrowLocation) {
      const campusIcon = L.divIcon({
        className: "custom-campus-pin",
        html: `
          <div class="cursor-pointer group flex flex-col items-center z-50 drop-shadow-xl transition-transform hover:scale-110 active:scale-95">
            <!-- Floating title label above arrow -->
            <div class="mb-1 whitespace-nowrap bg-rose-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-xl border-2 border-white tracking-wide flex items-center gap-1 animate-pulse">
              <span>${activeArrowLocation.title}</span>
            </div>
            <div class="relative flex items-center justify-center">
              <!-- Pulsing outer ring -->
              <div class="absolute -inset-3 bg-rose-500/50 rounded-full animate-ping"></div>
              <!-- Arrow circle badge -->
              <div class="relative bg-rose-600 text-white p-2.5 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 animate-bounce stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>
            </div>
            <!-- Pointer tip pointing to exact coordinate -->
            <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-rose-600 -mt-1"></div>
          </div>
        `,
        iconSize: [160, 75],
        iconAnchor: [80, 75]
      });

      const campusMarker = L.marker([activeArrowLocation.lat, activeArrowLocation.lng], { icon: campusIcon }).addTo(map);
      markersRef.current.push(campusMarker);
    }

    // Add Landmark Markers only if showLandmarks is explicitly toggled on
    if (showLandmarks) {
      GUMACA_LANDMARKS.forEach(lm => {
        const landmarkIcon = L.divIcon({
          className: "custom-landmark-pin",
          html: `
            <div class="bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg border-2 border-white shadow-md flex items-center gap-1 whitespace-nowrap">
              <span>${lm.name}</span>
            </div>
          `,
          iconSize: [120, 28],
          iconAnchor: [60, 14]
        });

        const marker = L.marker([lm.lat, lm.lng], { icon: landmarkIcon }).addTo(map);
        marker.bindPopup(`
          <div class="p-1 font-sans">
            <strong class="text-xs text-emerald-800">${lm.name}</strong>
            <p class="text-[11px] text-gray-600 m-0">${lm.desc}</p>
          </div>
        `);
        markersRef.current.push(marker);
      });
    }

    // Add School Markers when showSchoolsOnMap is enabled
    if (showSchoolsOnMap) {
      const activeSchools = getGumacaSchools();
      activeSchools.forEach((sch) => {
        // Skip standard school markers in school editor mode as all schools are rendered as draggable pins
        if (isEntranceEditingMode) {
          return;
        }
        const schoolIcon = L.divIcon({
          className: "custom-school-marker-pin !bg-transparent !border-none",
          html: `
            <div class="cursor-pointer group flex flex-col items-center transition-transform hover:scale-110 active:scale-95">
              <div class="relative flex items-center justify-center">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-amber-300 rounded-full border-2 border-amber-400 shadow-xl flex items-center justify-center font-bold">
                  <span class="text-xs">🎓</span>
                </div>
              </div>
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400 -mt-0.5 drop-shadow-sm"></div>
              <div class="bg-indigo-950/95 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400 shadow-xl mt-0.5 whitespace-nowrap flex items-center gap-1">
                <span>🎓 ${sch.shortName || sch.name}</span>
              </div>
            </div>
          `,
          iconSize: [160, 52],
          iconAnchor: [80, 42]
        });

        const marker = L.marker([sch.lat, sch.lng], {
          icon: schoolIcon,
          title: sch.name
        }).addTo(map);

        marker.bindPopup(`
          <div class="p-2 font-sans min-w-[200px]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-sm">🎓</span>
              <strong class="text-xs font-bold text-stone-900">${sch.name}</strong>
            </div>
            <p class="text-[11px] text-stone-600 m-0 mb-1.5">${sch.desc}</p>
            <div class="bg-indigo-50 border border-indigo-200 p-1.5 rounded-lg text-[10px] text-indigo-900 font-mono flex items-center justify-between">
              <span>📍 GPS: ${sch.lat.toFixed(6)}, ${sch.lng.toFixed(6)}</span>
            </div>
          </div>
        `);

        marker.on("click", () => {
          triggerArrowHighlight(sch.lat, sch.lng, sch.name, sch.desc, 17);
        });

        markersRef.current.push(marker);
      });
    }

    // Add Property Markers
    properties.forEach(property => {
      const [lat, lng] = getLatLngForProperty(property);
      const isSelected = selectedProperty?.id === property.id;
      const matchScore = aiMatches?.find(m => m.id === property.id)?.score;

      const priceTag = `₱${(property.price / 1000).toFixed(1)}k`;

      const markerIcon = L.divIcon({
        className: "custom-property-pin",
        html: `
          <div class="cursor-pointer transition-transform transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="${isSelected ? 'bg-amber-500 text-stone-900 border-2 border-stone-900 ring-4 ring-amber-500/30' : 'bg-stone-900 text-white border-2 border-white'} font-bold text-[11px] px-2 py-1 rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap">
              <span>${priceTag}</span>
              ${matchScore ? `<span class="bg-amber-400 text-stone-900 text-[9px] px-1 rounded-md">${matchScore}%</span>` : ''}
            </div>
            <div class="w-2 h-2 ${isSelected ? 'bg-amber-500' : 'bg-stone-900'} rotate-45 mx-auto -mt-1 shadow-xs"></div>
          </div>
        `,
        iconSize: [70, 32],
        iconAnchor: [35, 32]
      });

      const marker = L.marker([lat, lng], {
        icon: markerIcon,
        title: property.title
      }).addTo(map);

      // Custom popup HTML matching user's requested map popup layout
      const popupDiv = document.createElement("div");
      popupDiv.className = "font-sans p-0.5";
      popupDiv.innerHTML = `
        <div class="flex gap-3 items-center">
          <img
            src="${property.image}"
            alt="${property.title}"
            class="w-16 h-16 object-cover rounded-2xl border border-stone-100 shrink-0 shadow-2xs"
          />
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-stone-900 text-sm leading-snug truncate m-0">
              ${property.title}
            </h4>
            <p class="text-xs text-stone-500 m-0 mt-0.5 truncate font-normal">
              ${property.neighborhood || property.address || 'Barangay Tabing Dagat'}, ${property.city || 'Gumaca'}
            </p>
            <div class="mt-1.5 inline-block bg-stone-100 text-stone-900 font-bold text-xs px-2.5 py-0.5 rounded-md border border-stone-200/60">
              ₱${property.price.toLocaleString()} / month
            </div>
          </div>
        </div>
        <button
          id="leaflet-popup-btn-${property.id}"
          class="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
        >
          Tingnan ang detalye
        </button>
      `;

      marker.bindPopup(popupDiv, {
        className: "custom-leaflet-property-popup",
        maxWidth: 320
      });

      marker.on("popupopen", () => {
        setClickedStreet(null);
        onSelectProperty(property);
        setTimeout(() => {
          const btn = document.getElementById(`leaflet-popup-btn-${property.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              if (onOpenDetails) {
                onOpenDetails(property);
              }
            };
          }
        }, 50);
      });

      marker.on("click", () => {
        setClickedStreet(null);
        onSelectProperty(property);
      });

      markersRef.current.push(marker);
    });

    // Manage Route Layer for connecting lines from Selected Property to Schools / Selected School Pinpoint
    if (routeLayerRef.current) {
      try {
        routeLayerRef.current.clearLayers();
        routeLayerRef.current.remove();
      } catch (e) {}
    }
    routeLayerRef.current = L.layerGroup().addTo(map);

    const rawSchoolId = (activeSchoolRouteFilter && activeSchoolRouteFilter !== "none" && activeSchoolRouteFilter !== "all")
      ? activeSchoolRouteFilter
      : (selectedSchoolId && selectedSchoolId !== "none" && selectedSchoolId !== "all")
        ? selectedSchoolId
        : null;

    const targetSchoolId = (
      rawSchoolId &&
      rawSchoolId !== dismissedSchoolId &&
      (selectedProperty || hoveredProperty || (activeSchoolRouteFilter && activeSchoolRouteFilter !== "none"))
    ) ? rawSchoolId : null;

    if (targetSchoolId) {
      const activeSchools = getGumacaSchools();
      const selectedSchoolObj = activeSchools.find(s =>
        s.id === targetSchoolId ||
        s.id.includes(targetSchoolId) ||
        targetSchoolId.includes(s.id) ||
        s.name.toLowerCase().includes(targetSchoolId.toLowerCase())
      );

      if (selectedSchoolObj) {
        const lineStrokeColor = "#2563eb"; // Vibrant Blue Route Line as requested

        // 1. Add Prominent School Bouncing Arrow Pinpoint Marker
        const schoolIcon = L.divIcon({
          className: "custom-selected-school-arrow-pin !bg-transparent !border-none",
          html: `
            <div class="cursor-pointer group flex flex-col items-center z-50 transition-transform hover:scale-110 active:scale-95">
              <!-- Distinct SVG School Pinhead Badge with Pulsing Ring -->
              <div class="relative flex items-center justify-center">
                <!-- Pulsing Outer Ring -->
                <div class="absolute -inset-2 bg-indigo-500/50 rounded-full animate-ping"></div>
                
                <!-- Circle SVG Pin Container -->
                <div class="relative w-11 h-11 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 text-amber-300 rounded-full border-2 border-amber-400 shadow-2xl flex items-center justify-center p-2">
                  <!-- Graduation Cap SVG Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-300 drop-shadow-md animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.7 2.21a1.25 1.25 0 0 1 1.6 0l9.25 7.4a1.25 1.25 0 0 1-.22 2.05l-2.08.99v4.6a2.25 2.25 0 0 1-1.35 2.07l-5.65 2.38a2.25 2.25 0 0 1-1.7 0l-5.65-2.38A2.25 2.25 0 0 1 4.5 17.25v-4.6l-2.08-.99a1.25 1.25 0 0 1-.22-2.05l9.5-7.4Z" />
                  </svg>
                </div>
              </div>
              
              <!-- Pointer Tip -->
              <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400 -mt-0.5 drop-shadow-md"></div>
            </div>
          `,
          iconSize: [48, 56],
          iconAnchor: [24, 56]
        });

        const schoolMarker = L.marker([selectedSchoolObj.lat, selectedSchoolObj.lng], {
          icon: schoolIcon,
          title: selectedSchoolObj.name,
          zIndexOffset: 2000
        });

        schoolMarker.bindPopup(`
          <div class="p-2 font-sans min-w-[200px]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-sm">🎓</span>
              <strong class="text-xs font-bold text-stone-900">${selectedSchoolObj.name}</strong>
            </div>
            <p class="text-[11px] text-stone-600 m-0 mb-1.5">${selectedSchoolObj.desc || 'School in Gumaca, Quezon'}</p>
            <div class="bg-blue-50 border border-blue-200 p-1.5 rounded-lg text-[10px] text-blue-900 font-mono flex items-center justify-between">
              <span>📍 GPS: ${selectedSchoolObj.lat.toFixed(6)}, ${selectedSchoolObj.lng.toFixed(6)}</span>
            </div>
          </div>
        `);

        routeLayerRef.current?.addLayer(schoolMarker);

        // 2. If Property is selected, draw Connecting Blue Route Line & Distance Badge
        if (selectedProperty) {
          const [sLat, sLng] = getLatLngForProperty(selectedProperty);
          const schoolDistances = getSchoolDistancesForProperty(sLat, sLng, selectedProperty.neighborhood);
          const distObj = schoolDistances.find(s => s.id === selectedSchoolObj.id) || {
            distanceKm: 0.5,
            walkingMinutes: 6
          };

          // Initial direct line from Property to School Campus Pinpoint
          const targetSchLat = selectedSchoolObj.lat;
          const targetSchLng = selectedSchoolObj.lng;
          const initialStreetCoords: [number, number][] = [
            [sLat, sLng],
            [targetSchLat, targetSchLng]
          ];

          // Outer shadow glow line
          const shadowPolyline = L.polyline(initialStreetCoords, {
            color: "#1e3a8a",
            weight: 8,
            opacity: 0.35,
            interactive: false
          });
          routeLayerRef.current?.addLayer(shadowPolyline);

          // Dashed animated route line in vibrant blue
          const routePolyline = L.polyline(initialStreetCoords, {
            color: lineStrokeColor,
            weight: 5,
            dashArray: "10, 8",
            opacity: 0.95,
            interactive: false
          });
          routeLayerRef.current?.addLayer(routePolyline);

          // Midpoint distance badge callout
          const midIndex = Math.floor(initialStreetCoords.length / 2);
          const [midLat, midLng] = initialStreetCoords[midIndex];
          const midBadgeIcon = L.divIcon({
            className: "custom-route-mid-badge !bg-transparent !border-none",
            html: `
              <div class="pointer-events-none flex items-center justify-center">
                <div class="bg-blue-950 text-white font-sans text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xl border-2 border-blue-400 flex items-center gap-1.5 whitespace-nowrap">
                  <span class="text-amber-300">📏 ${distObj.distanceKm.toFixed(2)} km</span>
                  <span class="text-blue-100 font-normal">(${distObj.walkingMinutes}m lakad)</span>
                </div>
              </div>
            `,
            iconSize: [180, 32],
            iconAnchor: [90, 16]
          });
          const midBadgeMarker = L.marker([midLat, midLng], { icon: midBadgeIcon, interactive: false, zIndexOffset: 1500 });
          routeLayerRef.current?.addLayer(midBadgeMarker);

          // Fit bounds to show both property and school entrance pinpoint cleanly
          const bounds = L.latLngBounds([
            [sLat, sLng],
            [targetSchLat, targetSchLng]
          ]);
          map.fitBounds(bounds, { padding: [90, 90], maxZoom: 17, animate: true, duration: 1 });

          // Asynchronously fetch actual street road route from OSRM (trying foot, then driving)
          const fetchRoute = (profile: "foot" | "driving") => {
            const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${sLng},${sLat};${targetSchLng},${targetSchLat}?overview=full&geometries=geojson`;
            return fetch(osrmUrl)
              .then((res) => res.json())
              .then((data) => {
                if (data.code === "Ok" && data.routes && data.routes[0]?.geometry?.coordinates?.length > 1) {
                  return data;
                }
                throw new Error(`OSRM ${profile} empty`);
              });
          };

          fetchRoute("foot")
            .catch(() => fetchRoute("driving"))
            .then((data) => {
              if (data && data.routes && data.routes[0]?.geometry?.coordinates) {
                const roadCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
                  ([lng, lat]: [number, number]) => [lat, lng]
                );

                if (roadCoords.length > 0) {
                  const fullRouteCoords: [number, number][] = [
                    [sLat, sLng],
                    ...roadCoords,
                    [targetSchLat, targetSchLng]
                  ];

                  shadowPolyline.setLatLngs(fullRouteCoords);
                  routePolyline.setLatLngs(fullRouteCoords);

                  if (data.routes[0].distance) {
                    const osrmDistKm = data.routes[0].distance / 1000;
                    const osrmWalkMins = Math.max(1, Math.round((osrmDistKm / 4.5) * 60));

                    const updatedIcon = L.divIcon({
                      className: "custom-route-mid-badge !bg-transparent !border-none",
                      html: `
                        <div class="pointer-events-none flex items-center justify-center">
                          <div class="bg-blue-950 text-white font-sans text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xl border-2 border-blue-400 flex items-center gap-1.5 whitespace-nowrap">
                            <span class="text-amber-300">📏 ${osrmDistKm.toFixed(2)} km</span>
                            <span class="text-blue-100 font-normal">(${osrmWalkMins}m lakad)</span>
                          </div>
                        </div>
                      `,
                      iconSize: [180, 32],
                      iconAnchor: [90, 16]
                    });
                    midBadgeMarker.setIcon(updatedIcon);
                  }

                  const mIdx = Math.floor(fullRouteCoords.length / 2);
                  const [mLat, mLng] = fullRouteCoords[mIdx];
                  midBadgeMarker.setLatLng([mLat, mLng]);
                }
              }
            })
            .catch((err) => {
              console.warn("OSRM road route fetch fallback:", err);
            });
        } else {
          // Pan directly to school pinpoint
          map.flyTo([selectedSchoolObj.lat, selectedSchoolObj.lng], 17, { animate: true, duration: 1 });
        }
      }
    } else if (selectedProperty) {
      const [sLat, sLng] = getLatLngForProperty(selectedProperty);
      map.panTo([sLat, sLng], { animate: true });
    }
  }, [properties, selectedProperty, aiMatches, onSelectProperty, showLandmarks, showSchoolsOnMap, villaNavaCoords, tabingDagatCoords, activeArrowLocation, activeSchoolRouteFilter, selectedSchoolId, schoolRevision]);

  // Quick pan functions
  const panToArea = (lat: number, lng: number, zoom: number = 16) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
    }
  };

  const triggerArrowHighlight = (lat: number, lng: number, title: string, desc?: string, zoom: number = 17) => {
    setActiveArrowLocation({ lat, lng, title, desc });
    panToArea(lat, lng, zoom);
  };

  const triggerSLSUHighlight = (zoom: number = 17) => {
    triggerArrowHighlight(
      villaNavaCoords[0],
      villaNavaCoords[1],
      "🏫 SLSU Villa Nava Campus",
      "Southern Luzon State University - Villa Nava Campus, Gumaca, Quezon.",
      zoom
    );
  };

  const getMatchScore = (propertyId: string) => {
    return aiMatches?.find(m => m.id === propertyId)?.score;
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Hindi supported ng iyong browser ang Geolocation.");
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        const acc = position.coords.accuracy || 25;

        setUserExactGps({ lat: uLat, lng: uLng, accuracy: acc });
        setIsLocatingUser(false);

        if (leafletMapRef.current) {
          const map = leafletMapRef.current;

          const userIcon = L.divIcon({
            className: "user-gps-exact-pin",
            html: `
              <div class="relative flex flex-col items-center">
                <div class="absolute -top-1 w-10 h-10 bg-sky-500/30 rounded-full animate-ping"></div>
                <div class="bg-sky-500 text-white p-2 rounded-full shadow-lg ring-4 ring-sky-300 border-2 border-white flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div class="bg-sky-950 text-sky-200 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md mt-1 border border-sky-400/40 whitespace-nowrap z-10">
                  📍 Exact Location Mo
                </div>
              </div>
            `,
            iconSize: [110, 50],
            iconAnchor: [55, 20],
          });

          if (userGpsMarkerRef.current) {
            userGpsMarkerRef.current.setLatLng([uLat, uLng]);
          } else {
            userGpsMarkerRef.current = L.marker([uLat, uLng], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
          }

          if (userGpsCircleRef.current) {
            userGpsCircleRef.current.setLatLng([uLat, uLng]);
            userGpsCircleRef.current.setRadius(Math.max(acc, 15));
          } else {
            userGpsCircleRef.current = L.circle([uLat, uLng], {
              radius: Math.max(acc, 15),
              color: "#0284c7",
              fillColor: "#38bdf8",
              fillOpacity: 0.25,
              weight: 2,
            }).addTo(map);
          }

          map.flyTo([uLat, uLng], 17, { animate: true, duration: 1.2 });
        }
      },
      () => {
        setIsLocatingUser(false);
        alert("Hindi makuha ang iyong lokasyon. Siguraduhing pinayagan ang Location Permission sa iyong browser.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  return (
    <div
      id="neighborhood-map-container"
      className={`flex flex-col bg-white overflow-hidden shadow-xs transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none p-0 border-0"
          : "h-full rounded-2xl border border-stone-200"
      }`}
    >
      {/* Standard Map Header (Shown always on laptop; on mobile hidden during fullscreen) */}
      <div className={`bg-stone-50 border-b border-stone-200 px-3 py-2 sm:px-4 sm:py-3 flex-col xs:flex-row xs:items-center justify-between gap-2 shrink-0 ${
        isFullscreen ? "hidden sm:flex" : "flex"
      }`}>
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-stone-700 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-display text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5 truncate">
              Gumaca, Quezon Interactive Street Map 🗺️
            </h3>
            <p className="text-[10px] text-stone-500 font-light hidden sm:block">
              Mag-search ng kalye, barangay, o campus, o pindutin ang mapa para makita ang detalye!
            </p>
          </div>
        </div>

        {/* Header Right Controls: Layer Switcher, Boundary Drawer Toggle & Fullscreen */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">

          {/* Interactive Barangay Boundary Drawer Button */}
          <button
            onClick={() => {
              setIsDrawingMode(prev => !prev);
              if (!showBoundariesOnMap) {
                setShowBoundariesOnMap(true);
              }
            }}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
              isDrawingMode
                ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white ring-2 ring-pink-300 animate-pulse"
                : "bg-gradient-to-r from-pink-500 to-blue-600 text-white hover:from-pink-600 hover:to-blue-700 shadow-pink-500/10"
            }`}
            title="I-edit o iguhit ang boundary ng bawat barangay sa Gumaca"
          >
            <Shapes className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span>{isDrawingMode ? "✏️ Drawing..." : "✏️ Boundary"}</span>
          </button>

          {/* Toggle Saved Barangay Boundaries Overlay */}
          <button
            onClick={() => {
              if (!showBoundariesOnMap) {
                if (!selectedBarangayBoundaryFilter && drawnBarangayBoundaries.length > 0) {
                  setSelectedBarangayBoundaryFilter(drawnBarangayBoundaries[0].barangayName);
                }
                setShowBoundariesOnMap(true);
              } else {
                setShowBoundariesOnMap(false);
              }
            }}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
              showBoundariesOnMap
                ? "bg-gradient-to-r from-pink-100 to-blue-100 text-pink-900 border border-pink-300"
                : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
            }`}
            title="Ipakita o Itago ang Boundary ng Napiling Barangay"
          >
            <span>{showBoundariesOnMap ? "🗺️ Overlay ON" : "🗺️ Overlay OFF"}</span>
          </button>





          <div className="flex items-center gap-0.5 bg-stone-200/80 p-0.5 rounded-xl text-[10px] sm:text-[11px] font-medium">
            <button
              onClick={() => setMapMode("streets")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all cursor-pointer ${
                mapMode === "streets"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="Live Google Maps Standard Roadmap"
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setMapMode("satellite")}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all cursor-pointer ${
                mapMode === "satellite"
                  ? "bg-emerald-700 text-white shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="Live Google Maps Satellite View"
            >
              🛰️ Sat
            </button>
          </div>

          {/* GPS Locate User Button */}
          <button
            onClick={handleLocateUser}
            disabled={isLocatingUser}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:opacity-60 whitespace-nowrap"
            title="Point out ang iyong eksaktong kasalukuyang lokasyon gamit ang GPS"
          >
            <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-white/20" />
            <span>{isLocatingUser ? "GPS..." : "GPS 📍"}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isFullscreen
                ? "bg-amber-500 text-stone-950 font-black hover:bg-amber-400 ring-2 ring-amber-300"
                : "bg-stone-900 text-white hover:bg-stone-800"
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit ✕</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Full</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Map Location Search Bar (On mobile hidden during fullscreen to maximize map view) */}
      {mapMode !== "google_embed" && (
        <div className={`relative bg-white border-b border-stone-200 px-3 py-2 z-40 ${
          isFullscreen ? "hidden sm:block" : "block"
        }`}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Mag-search ng kalye, barangay, o dorm sa Gumaca..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-9 pr-8 py-1.5 bg-stone-100 hover:bg-stone-100/80 focus:bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/20 font-sans transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-3 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-stone-100 font-sans">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    triggerArrowHighlight(item.lat, item.lng, item.name, item.detail, 17);
                    setSearchQuery(item.name);
                    setShowSearchResults(false);

                    // Set inspect popup details
                    const info = getStreetInfoForCoordinates(item.lat, item.lng);
                    setClickedStreet(info);

                    if (item.propertyObj) {
                      onSelectProperty(item.propertyObj);
                    }
                  }}
                  className="p-2.5 hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900">{item.name}</div>
                    <div className="text-[10px] text-stone-500">{item.detail}</div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                    Jump 📍
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Jump Buttons for Laptop View when Fullscreen */}
      {mapMode !== "google_embed" && isFullscreen && (
        <div className="hidden sm:flex bg-stone-100/70 border-b border-stone-200 px-3 py-2 items-center gap-2 overflow-x-auto text-[10px] no-scrollbar">
          <span className="text-stone-400 font-mono shrink-0 mr-1 flex items-center gap-1">
            <Compass className="h-3 w-3 text-stone-400" />
            Quick Jump:
          </span>

          {/* Dynamic Jump to Barangay with Saved Boundary */}
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-lg shrink-0">
            <span className="font-bold text-indigo-900 text-[10px] flex items-center gap-1">
              <Shapes className="h-3 w-3 text-indigo-600" />
              📍 Barangay:
            </span>
            <select
              value={selectedBarangayBoundaryFilter}
              onChange={(e) => {
                const bName = e.target.value;
                setSelectedBarangayBoundaryFilter(bName);
                if (!bName) {
                  setShowBoundariesOnMap(false);
                  return;
                }
                setShowBoundariesOnMap(true);

                if (bName === "ALL_BARANGAYS") {
                  triggerArrowHighlight(13.9220, 122.0995, "📍 Lahat ng Gumaca Barangays", "Ipinapakita ang lahat ng saved barangay boundaries sa Gumaca", 15);
                  if (leafletMapRef.current) {
                    leafletMapRef.current.flyTo([13.9220, 122.0995], 15);
                  }
                  return;
                }

                const boundary = drawnBarangayBoundaries.find(b => b.barangayName === bName);
                if (boundary && boundary.points.length > 0) {
                  const lats = boundary.points.map(p => p[0]);
                  const lngs = boundary.points.map(p => p[1]);
                  const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                  const cLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

                  triggerArrowHighlight(cLat, cLng, `📍 Boundary: ${boundary.barangayName}`, `Kumpletong Na-guhit na Boundary (${boundary.points.length} tuldok)`, 16);
                  const info = getStreetInfoForCoordinates(cLat, cLng);
                  setClickedStreet(info);

                  if (leafletMapRef.current) {
                    const bounds = L.latLngBounds(boundary.points);
                    leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
                  }
                }
              }}
              className="bg-white text-indigo-950 text-[10px] font-bold py-0.5 px-1.5 rounded border border-indigo-200 focus:outline-none cursor-pointer"
            >
              <option value="">-- Piliin ({drawnBarangayBoundaries.length}) --</option>
              <option value="ALL_BARANGAYS">✨ Lahat ng Barangay ({drawnBarangayBoundaries.length})</option>
              {drawnBarangayBoundaries.map((b) => (
                <option key={b.id} value={b.barangayName}>
                  {b.barangayName} ({b.points.length} tuldok)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Jump Buttons for Laptop View when Fullscreen */}
          <button
            onClick={() => triggerSLSUHighlight(17)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            <School className="h-3 w-3 text-teal-600" />
            SLSU Villa Nava 🎓
          </button>

          <button
            onClick={() => {
              const slsu = getGumacaSchools().find(s => s.id === "slsu-main");
              const slsuLat = slsu?.lat || 13.923258;
              const slsuLng = slsu?.lng || 122.101460;
              triggerArrowHighlight(slsuLat, slsuLng, "SLSU Tabing Dagat Campus 🎓🌊", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 17);
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            <School className="h-3 w-3 text-emerald-600" />
            SLSU Tabing Dagat 🎓
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🍔 Jollibee
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920751, 122.100299, "McDonald's Gumaca 🍟🍔", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🍟 McDonald's
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920489, 122.098769, "Chowking Gumaca 🥢🥟", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🥢 Chowking
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920196, 122.097666, "Novo Department Store 🛍️🏢", "Department Store & Shopping, Maharlika Highway, Gumaca", 17)}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🛍️ Novo Dept Store
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923430, 122.100694, "Heritage Site 🏛️", "Gumaca Heritage / Historical Landmark, Tabing Dagat", 17)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏛️ Heritage
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923315, 122.097557, "Eastern Quezon College (EQC) 🏛️", "College & Educational Institution, Gumaca", 17)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏫 EQC
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920500, 122.094000, "Gumaca National High School (GNHS) 🏫", "Gumaca NHS, Mabini/Poblacion, Gumaca", 17)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏫 Gumaca NHS
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920509, 122.101597, "Gumaca Public Market 🛒🐟", "Public Market & Commercial Hub, Poblacion", 17)}
            className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🛒 Public Market
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.921103, 122.105650, "Puregold Gumaca 🟡🛒", "Puregold Supermarket, Maharlika Highway / San Diego", 17)}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🟡 Puregold
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.919680, 122.100656, "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", "Jeepney Terminal for Macalelon, Unisan & Lopez", 17)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🚐 Jeep Terminal
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.9220, 122.0995, "Whole Gumaca Overview 🔍", "Gumaca Municipality Overview", 14)}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ml-auto"
          >
            🔍 Whole Gumaca
          </button>
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 bg-[#f9f8f4] min-h-[380px] h-full w-full overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-10" />

        {/* FLOATING OVERLAY STRICTLY FOR MOBILE VIEW WHEN IN FULLSCREEN */}
        {isFullscreen && (
          <>
            <div className="sm:hidden absolute top-2.5 left-2.5 right-2.5 z-40 flex flex-col gap-2 pointer-events-none">
              {/* Top Bar: Sleek Frosted Glass Header */}
              <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-stone-700/80 shadow-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shrink-0">
                    <Map className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-xs tracking-wide text-white truncate">Gumaca Map 🗺️</span>
                    <span className="text-[9px] text-emerald-300/90 font-medium truncate">Interactive Local Guide</span>
                  </div>
                </div>

                {/* Layer Quick Switcher for Mobile Fullscreen */}
                <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700/80 shrink-0">
                  <button
                    onClick={() => setMapMode("osm")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mapMode === "osm" ? "bg-emerald-500 text-stone-950 shadow-xs" : "text-stone-300 hover:text-white"
                    }`}
                  >
                    Street
                  </button>
                  <button
                    onClick={() => setMapMode("satellite")}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      mapMode === "satellite" ? "bg-emerald-500 text-stone-950 shadow-xs" : "text-stone-300 hover:text-white"
                    }`}
                  >
                    Sat 🛰️
                  </button>
                </div>
              </div>

              {/* Mobile Quick Jump Circular Button & Floating Popover Overlay */}
              {mapMode !== "google_embed" && (
                <div className="pointer-events-auto relative">
                  {!isMobileQuickJumpOpen ? (
                    <button
                      onClick={() => setIsMobileQuickJumpOpen(true)}
                      className="bg-stone-900/90 hover:bg-stone-950 text-white backdrop-blur-md shadow-2xl border border-stone-700/80 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      title="Quick Jump"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-600/90 flex items-center justify-center shrink-0 shadow-xs">
                        <Compass className="h-3.5 w-3.5 text-white animate-spin-slow" />
                      </div>
                      <span className="text-[11px] tracking-wide font-extrabold text-amber-300">Quick Jump 🚀</span>
                    </button>
                  ) : (
                    <div className="bg-stone-900/95 backdrop-blur-md border border-stone-700 shadow-2xl p-2.5 rounded-2xl flex flex-col gap-2 max-w-[280px] w-full text-xs animate-fade-in font-sans text-white">
                      <div className="flex items-center justify-between pb-1 border-b border-stone-800">
                        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px]">
                          <Compass className="h-4 w-4 text-indigo-400 animate-spin-slow" />
                          <span>Quick Jump Navigation</span>
                        </div>
                        <button
                          onClick={() => setIsMobileQuickJumpOpen(false)}
                          className="text-stone-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-stone-800 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Barangay Filter Dropdown */}
                      <div className="flex items-center justify-between gap-2 bg-stone-800/90 border border-stone-700 px-2 py-1 rounded-xl">
                        <span className="font-bold text-indigo-300 text-[10px] shrink-0">📍 Brgy:</span>
                        <select
                          value={selectedBarangayBoundaryFilter}
                          onChange={(e) => {
                            const bName = e.target.value;
                            setSelectedBarangayBoundaryFilter(bName);
                            if (!bName) {
                              setShowBoundariesOnMap(false);
                              return;
                            }
                            setShowBoundariesOnMap(true);

                            if (bName === "ALL_BARANGAYS") {
                              triggerArrowHighlight(13.9220, 122.0995, "📍 Lahat ng Gumaca Barangays", "Ipinapakita ang lahat ng saved barangay boundaries sa Gumaca", 15);
                              if (leafletMapRef.current) {
                                leafletMapRef.current.flyTo([13.9220, 122.0995], 15);
                              }
                              setIsMobileQuickJumpOpen(false);
                              return;
                            }

                            const boundary = drawnBarangayBoundaries.find(b => b.barangayName === bName);
                            if (boundary && boundary.points.length > 0) {
                              const lats = boundary.points.map(p => p[0]);
                              const lngs = boundary.points.map(p => p[1]);
                              const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                              const cLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

                              triggerArrowHighlight(cLat, cLng, `📍 Boundary: ${boundary.barangayName}`, `Kumpletong Na-guhit na Boundary (${boundary.points.length} tuldok)`, 16);
                              const info = getStreetInfoForCoordinates(cLat, cLng);
                              setClickedStreet(info);

                              if (leafletMapRef.current) {
                                const bounds = L.latLngBounds(boundary.points);
                                leafletMapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
                              }
                            }
                            setIsMobileQuickJumpOpen(false);
                          }}
                          className="bg-stone-900 text-white text-[10px] font-bold py-0.5 px-1 rounded-lg border border-stone-700 focus:outline-none cursor-pointer min-w-0 flex-1"
                        >
                          <option value="">-- Piliin ang Barangay --</option>
                          <option value="ALL_BARANGAYS">✨ Lahat ng Barangay</option>
                          {drawnBarangayBoundaries.map((b) => (
                            <option key={b.id} value={b.barangayName}>
                              {b.barangayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Landmark Quick Jump Option Field Dropdown */}
                      <div className="flex items-center justify-between gap-2 bg-stone-800/90 border border-stone-700 px-2 py-1 rounded-xl">
                        <span className="font-bold text-amber-300 text-[10px] shrink-0">🏢 Lugar:</span>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (val === "slsu_villas") triggerSLSUHighlight(17);
                            else if (val === "slsu_main") {
                              const slsu = getGumacaSchools().find(s => s.id === "slsu-main");
                              triggerArrowHighlight(slsu?.lat || 13.923258, slsu?.lng || 122.101460, "SLSU Tabing Dagat Campus 🎓🌊", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 17);
                            }
                            else if (val === "jollibee") triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17);
                            else if (val === "mcdonalds") triggerArrowHighlight(13.920751, 122.100299, "McDonald's Gumaca 🍟🍔", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17);
                            else if (val === "chowking") triggerArrowHighlight(13.920489, 122.098769, "Chowking Gumaca 🥢🥟", "Fast Food Restaurant, Maharlika Highway, Gumaca", 17);
                            else if (val === "novo") triggerArrowHighlight(13.920196, 122.097666, "Novo Department Store 🛍️🏢", "Department Store & Shopping, Maharlika Highway, Gumaca", 17);
                            else if (val === "market") triggerArrowHighlight(13.920509, 122.101597, "Gumaca Public Market 🛒🐟", "Public Market & Commercial Hub, Poblacion", 17);
                            else if (val === "puregold") triggerArrowHighlight(13.921103, 122.105650, "Puregold Gumaca 🟡🛒", "Puregold Supermarket, Maharlika Highway / San Diego", 17);
                            else if (val === "jeep_terminal") triggerArrowHighlight(13.919680, 122.100656, "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", "Jeepney Terminal for Macalelon, Unisan & Lopez", 17);
                            else if (val === "heritage") triggerArrowHighlight(13.923430, 122.100694, "Heritage Site 🏛️", "Gumaca Heritage / Historical Landmark, Tabing Dagat", 17);
                            else if (val === "eqc") triggerArrowHighlight(13.923315, 122.097557, "Eastern Quezon College (EQC) 🏛️", "College & Educational Institution, Gumaca", 17);
                            else if (val === "gnhs") triggerArrowHighlight(13.920500, 122.094000, "Gumaca National High School (GNHS) 🏫", "Gumaca NHS, Mabini/Poblacion, Gumaca", 17);
                            else if (val === "whole_gumaca") triggerArrowHighlight(13.9220, 122.0995, "Whole Gumaca Overview 🔍", "Gumaca Municipality Overview", 14);
                            e.target.value = "";
                            setIsMobileQuickJumpOpen(false);
                          }}
                          defaultValue=""
                          className="bg-stone-900 text-white text-[10px] font-bold py-0.5 px-1 rounded-lg border border-stone-700 focus:outline-none cursor-pointer min-w-0 flex-1"
                        >
                          <option value="">-- Piliin ang Lugar --</option>
                          <option value="slsu_villas">🎓 SLSU Villa Nava</option>
                          <option value="slsu_main">🎓 SLSU Tabing Dagat</option>
                          <option value="jollibee">🍔 Jollibee</option>
                          <option value="mcdonalds">🍟 McDonald's</option>
                          <option value="chowking">🥢 Chowking</option>
                          <option value="novo">🛍️ Novo Store</option>
                          <option value="market">🛒 Public Market</option>
                          <option value="puregold">🟡 Puregold</option>
                          <option value="jeep_terminal">🚐 Jeep Terminal</option>
                          <option value="heritage">🏛️ Heritage Site</option>
                          <option value="eqc">🏫 EQC</option>
                          <option value="gnhs">🏫 GNHS</option>
                          <option value="whole_gumaca">🔍 Buong Gumaca</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FLOATING BOTTOM LEFT GPS BUTTON FOR MOBILE FULLSCREEN VIEW */}
            <div className="sm:hidden absolute bottom-5 left-3.5 z-40 pointer-events-auto">
              <button
                onClick={handleLocateUser}
                disabled={isLocatingUser}
                className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black rounded-full text-xs shadow-2xl cursor-pointer flex items-center gap-1.5 active:scale-95 border border-indigo-400/40 ring-2 ring-indigo-500/20 transition-all"
                title="Eksaktong Lokasyon sa GPS"
              >
                <Navigation className="h-4 w-4 fill-white/30 animate-pulse" />
                <span>{isLocatingUser ? "Naghahanap..." : "GPS 📍"}</span>
              </button>
            </div>

            {/* FLOATING BOTTOM RIGHT EXIT BUTTON FOR MOBILE FULLSCREEN VIEW */}
            <div className="sm:hidden absolute bottom-5 right-3.5 z-40 pointer-events-auto">
              <button
                onClick={toggleFullscreen}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-extrabold px-4.5 py-2.5 rounded-full text-xs flex items-center gap-1.5 shadow-2xl ring-4 ring-amber-300/80 cursor-pointer border border-amber-200/60 transition-all"
                title="Umalis sa Fullscreen Map"
              >
                <Minimize2 className="h-4 w-4 shrink-0" />
                <span>Exit Fullscreen ✕</span>
              </button>
            </div>
          </>
        )}



        {/* ABSOLUTE GUARANTEED REACT DOM SVG & BADGE OVERLAY FOR SAVED BOUNDARIES */}
        {showBoundariesOnMap && savedPixelBoundaries.length > 0 && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-18">
              {savedPixelBoundaries.map((b) => (
                <g key={`saved-svg-${b.id}`}>
                  {b.points.length >= 3 && (
                    <polygon
                      points={b.points.map(p => `${p.x},${p.y}`).join(" ")}
                      fill={b.color}
                      fillOpacity="0.25"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeDasharray="6,6"
                    />
                  )}
                  {b.points.length >= 2 && (
                    <polyline
                      points={[...b.points, b.points[0]].map(p => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke={b.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* DOM HTML Badges & Dots for Saved Barangay Boundaries */}
            <div className="absolute inset-0 pointer-events-none z-22 overflow-hidden">
              {savedPixelBoundaries.map((b) => (
                <React.Fragment key={`saved-dom-${b.id}`}>
                  {/* Vertex Dots for every saved point */}
                  {b.points.map((pt, pIdx) => (
                    <div
                      key={`saved-pt-${b.id}-${pIdx}`}
                      style={{ left: `${pt.x}px`, top: `${pt.y}px`, transform: "translate(-50%, -50%)" }}
                      className="absolute pointer-events-none flex flex-col items-center justify-center"
                    >
                      <span className="w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow-md ring-2 ring-indigo-300" />
                      <span className="text-[9px] font-black text-white bg-indigo-950/90 px-1 py-0.2 rounded border border-indigo-300 shadow mt-0.5 whitespace-nowrap">
                        #{pIdx + 1}
                      </span>
                    </div>
                  ))}

                  {/* Barangay Name Center Badge */}
                  <div
                    style={{ left: `${b.center.x}px`, top: `${b.center.y}px`, transform: "translate(-50%, -50%)" }}
                    className="absolute pointer-events-none bg-indigo-950/95 text-white font-extrabold text-[11px] px-3 py-1 rounded-full shadow-2xl border-2 border-indigo-300 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>🏛️ {b.barangayName} ({b.points.length} Tuldok)</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        {/* ABSOLUTE GUARANTEED REACT DOM SVG & BADGE OVERLAY FOR DRAWN POINTS & LINES */}
        {(drawnPoints.length > 0 || (isDrawingMode && mousePixel)) && (
          <>
            {/* SVG Lines & Polygon Canvas Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              {/* Polygon fill if >= 3 points */}
              {drawShapeType === "polygon" && pixelPoints.length >= 3 && (
                <polygon
                  points={pixelPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill={drawColor}
                  fillOpacity="0.3"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {/* White High-Contrast Outline Polyline */}
              {pixelPoints.length >= 2 && (
                <polyline
                  points={pixelPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
              )}

              {/* Main Vivid Colored Polyline */}
              {pixelPoints.length >= 2 && (
                <polyline
                  points={pixelPoints.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={drawColor}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Live Rubberband Line to Cursor */}
              {isDrawingMode && mousePixel && pixelPoints.length > 0 && (
                <>
                  <line
                    x1={pixelPoints[pixelPoints.length - 1].x}
                    y1={pixelPoints[pixelPoints.length - 1].y}
                    x2={mousePixel.x}
                    y2={mousePixel.y}
                    stroke="#ffffff"
                    strokeWidth="6"
                    strokeDasharray="6,6"
                  />
                  <line
                    x1={pixelPoints[pixelPoints.length - 1].x}
                    y1={pixelPoints[pixelPoints.length - 1].y}
                    x2={mousePixel.x}
                    y2={mousePixel.y}
                    stroke={drawColor}
                    strokeWidth="3.5"
                    strokeDasharray="6,6"
                  />
                  {drawShapeType === "polygon" && pixelPoints.length >= 2 && (
                    <line
                      x1={mousePixel.x}
                      y1={mousePixel.y}
                      x2={pixelPoints[0].x}
                      y2={pixelPoints[0].y}
                      stroke={drawColor}
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  )}
                </>
              )}
            </svg>

            {/* DOM HTML Badges for Every Single Point */}
            <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
              {pixelPoints.map((pt, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === pixelPoints.length - 1;
                return (
                  <div
                    key={`overlay-pin-${idx}-${pt.lat.toFixed(6)}-${pt.lng.toFixed(6)}`}
                    style={{ left: `${pt.x}px`, top: `${pt.y}px`, transform: "translate(-50%, -50%)" }}
                    className="absolute pointer-events-none flex flex-col items-center justify-center"
                  >
                    {/* Glowing outer aura ring */}
                    <span
                      className={`absolute w-12 h-12 rounded-full animate-ping opacity-80 ${
                        isFirst ? "bg-emerald-400" : isLast ? "bg-rose-500" : "bg-blue-500"
                      }`}
                    />

                    {/* Main Solid High-Contrast Number Circle Badge */}
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full font-black text-[13px] text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] border-2 border-white ${
                        isFirst
                          ? "bg-emerald-600 ring-4 ring-emerald-300"
                          : isLast
                          ? "bg-rose-600 ring-4 ring-rose-300"
                          : "bg-blue-600 ring-4 ring-blue-300"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Tag Label */}
                    <div className="absolute -top-6 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white shadow-2xl border ${
                        isFirst
                          ? "bg-emerald-950 border-emerald-400 text-emerald-200"
                          : isLast
                          ? "bg-rose-950 border-rose-400 text-rose-200"
                          : "bg-blue-950 border-blue-400 text-blue-200"
                      }`}>
                        {isFirst ? "▶ SIMULA (#1)" : isLast ? `📌 TULDOK #${idx + 1}` : `#${idx + 1}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Street Inspector Card (When user clicks anywhere on the Leaflet map) */}
        {clickedStreet && (
          <div className="fixed sm:absolute bottom-3 sm:bottom-auto sm:top-3 left-2 sm:left-3 right-auto z-30 bg-stone-900/95 backdrop-blur-md text-white p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border border-stone-700 shadow-2xl max-w-[200px] sm:max-w-sm font-sans animate-fade-in select-none">
            <div className="flex items-center justify-between gap-1 pb-0.5 sm:pb-0 border-b border-stone-800 sm:border-none">
              <div className="flex items-center gap-1 sm:gap-1.5 text-amber-400 font-bold text-[10px] sm:text-xs">
                <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">Street Inspector 📍</span>
              </div>
              <button
                onClick={() => setClickedStreet(null)}
                className="text-stone-400 hover:text-white text-[10px] sm:text-xs font-bold px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-md hover:bg-stone-800 cursor-pointer"
                title="Isara"
              >
                ✕
              </button>
            </div>

            <div className="mt-1 sm:mt-1.5 space-y-0.5 sm:space-y-1 text-xs">
              <p className="font-bold text-white text-[11px] sm:text-sm leading-tight sm:leading-snug truncate sm:whitespace-normal">
                {clickedStreet.street}
              </p>
              <p className="text-stone-300 text-[9px] sm:text-xs truncate sm:whitespace-normal">
                {clickedStreet.barangay}
              </p>

              <div className="pt-1 sm:pt-2 mt-1 sm:mt-2 border-t border-stone-800 space-y-1 sm:space-y-1.5 text-[9px] sm:text-[11px] font-mono">
                <div className="bg-stone-800/80 px-1.5 py-1 sm:p-2 rounded-lg sm:rounded-xl border border-stone-700/60 flex items-center justify-between">
                  <span className="text-stone-400 text-[8px] sm:text-[10px]">Villa Nava:</span>
                  <span className="font-bold text-teal-400 text-[9px] sm:text-xs">
                    ~{clickedStreet.distVillaNava}m ({clickedStreet.walkVillaNava}m 🚶)
                  </span>
                </div>
                <div className="pt-0.5 sm:pt-1 flex items-center justify-end text-[8px] sm:text-[10px] text-stone-300 font-sans">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${clickedStreet.lat},${clickedStreet.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-bold flex items-center gap-0.5 sm:gap-1"
                  >
                    Open Google Maps ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* School Pinpoint Editor Floating Panel - Disabled */}
        {false && (
          <div className="fixed sm:absolute bottom-2 sm:bottom-auto sm:top-3 left-2 right-2 sm:left-auto sm:right-3 z-30 bg-stone-900/95 backdrop-blur-md text-white rounded-2xl border border-amber-500/40 shadow-2xl max-w-md w-full sm:w-96 font-sans animate-fade-in flex flex-col max-h-[82vh]">
            {/* Sticky Header */}
            <div className="p-3 sm:p-3.5 border-b border-stone-800 bg-stone-950/80 rounded-t-2xl shrink-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🎓 School Pinpoint System</span>
                  </h4>
                  <p className="text-[10px] text-stone-300 leading-tight">
                    Magdagdag o mag-adjust ng School Pinpoints sa Gumaca.
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* Map Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSchoolsOnMap(prev => !prev)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      showSchoolsOnMap
                        ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
                        : "bg-stone-800 text-stone-400 border-stone-700"
                    }`}
                    title="I-toggle ang visibility ng school pins sa mapa"
                  >
                    <span>{showSchoolsOnMap ? "👁️ Pins: ON" : "🙈 Pins: OFF"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEntranceEditingMode(false)}
                    className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* System Navigation Tabs */}
              <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700/80">
                <button
                  type="button"
                  onClick={() => setSystemTab("edit")}
                  className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    systemTab === "edit"
                      ? "bg-amber-500 text-stone-950 shadow-md"
                      : "text-stone-300 hover:text-white hover:bg-stone-700/50"
                  }`}
                >
                  <span>✏️ Edit & Drag School Pin</span>
                </button>
                <button
                  type="button"
                  onClick={scrollToAddSectionSystemBox}
                  className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    systemTab === "add"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-stone-300 hover:text-white hover:bg-stone-700/50"
                  }`}
                >
                  <span>➕ Add New School</span>
                </button>
              </div>
            </div>

            {/* Scrollable System Content Box */}
            <div
              ref={systemBoxScrollRef}
              className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 scroll-smooth max-h-[60vh] sm:max-h-[65vh] pr-2 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-900"
            >
              {systemTab === "edit" ? (
                <>
                  {/* School Dropdown Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-200 flex items-center justify-between">
                      <span>Pumili ng Paaralan sa Gumaca:</span>
                      <span className="text-[10px] text-amber-400 font-mono">
                        ({getGumacaSchools().length} Total)
                      </span>
                    </label>
                    <select
                      value={selectedEditingSchoolId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedEditingSchoolId(newId);
                        const active = getGumacaSchools().find(s => s.id === newId);
                        if (active) {
                          setEditingCampusLat(active.lat);
                          setEditingCampusLng(active.lng);
                          if (leafletMapRef.current) {
                            leafletMapRef.current.flyTo([active.lat, active.lng], 18);
                          }
                        }
                      }}
                      className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {getGumacaSchools().map((sch) => (
                        <option key={sch.id} value={sch.id}>
                          🎓 {sch.shortName || sch.name} {sch.isCustom ? "⭐ (Custom)" : ""}
                        </option>
                      ))}
                    </select>

                    {/* Quick Shortcut Buttons for Schools */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {getGumacaSchools().map((sch) => {
                        const isCurr = sch.id === selectedEditingSchoolId;
                        return (
                          <button
                            key={sch.id}
                            type="button"
                            onClick={() => {
                              setSelectedEditingSchoolId(sch.id);
                              setEditingCampusLat(sch.lat);
                              setEditingCampusLng(sch.lng);
                              if (leafletMapRef.current) {
                                leafletMapRef.current.flyTo([sch.lat, sch.lng], 18);
                              }
                            }}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isCurr
                                ? "bg-amber-400 text-stone-950 border-amber-300 font-extrabold shadow-md scale-105"
                                : "bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700"
                            }`}
                          >
                            <span>🎓 {sch.shortName || sch.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campus Location Pin Card */}
                  <div className="p-2.5 rounded-xl border bg-indigo-950/50 border-indigo-500/60 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                        🎓 School Campus Pinpoint
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (leafletMapRef.current) {
                              const center = leafletMapRef.current.getCenter();
                              const newLat = Number(center.lat.toFixed(6));
                              const newLng = Number(center.lng.toFixed(6));
                              setEditingCampusLat(newLat);
                              setEditingCampusLng(newLng);
                            }
                          }}
                          className="text-[10px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/30 cursor-pointer"
                          title="Set campus coordinates to map center"
                        >
                          📍 Map Center
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (leafletMapRef.current) {
                              leafletMapRef.current.flyTo([editingCampusLat, editingCampusLng], 18);
                            }
                          }}
                          className="text-[10px] text-indigo-300 hover:text-indigo-200 underline font-semibold cursor-pointer"
                        >
                          🔍 Zoom
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-stone-300">
                      GPS: {editingCampusLat.toFixed(6)}, {editingCampusLng.toFixed(6)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          saveCustomSchoolCoord(
                            selectedEditingSchoolId,
                            editingCampusLat,
                            editingCampusLng,
                            editingCampusLat,
                            editingCampusLng,
                            false
                          );
                          setSchoolRevision(r => r + 1);
                          setEntranceSaveToast("Na-save nang matagumpay ang School Pinpoint! ✨");
                          setTimeout(() => setEntranceSaveToast(null), 3000);
                        }}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-extrabold text-xs py-2 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>💾 I-save ang School Pinpoint</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          resetCustomSchoolCoords(selectedEditingSchoolId);
                          setSchoolRevision(r => r + 1);
                          const active = getGumacaSchools().find(s => s.id === selectedEditingSchoolId);
                          if (active) {
                            setEditingCampusLat(active.lat);
                            setEditingCampusLng(active.lng);
                          }
                          setEntranceSaveToast("Na-reset ang school pinpoint sa default! 🔄");
                          setTimeout(() => setEntranceSaveToast(null), 3000);
                        }}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs px-3 py-2 rounded-xl border border-stone-700 transition-all cursor-pointer"
                        title="Reset sa default coordinates"
                      >
                        🔄 Reset
                      </button>
                    </div>

                    {/* Delete Custom School option if custom */}
                    {(() => {
                      const activeSch = getGumacaSchools().find(s => s.id === selectedEditingSchoolId);
                      if (activeSch && (activeSch as any).isCustom) {
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              deleteCustomSchoolItem(selectedEditingSchoolId);
                              setSchoolRevision(r => r + 1);
                              setSelectedEditingSchoolId("slsu-main");
                              setEntranceSaveToast("Naalis nang matagumpay ang custom school pinpoint! 🗑️");
                              setTimeout(() => setEntranceSaveToast(null), 3000);
                            }}
                            className="w-full bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 font-bold text-xs py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>🗑️ Alisin ang Custom School Pinpoint</span>
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </>
              ) : (
                /* Add New School Pinpoint Form */
                <div ref={addFormSectionRef} className="space-y-3 animate-fade-in">
                  <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/40">
                    <h5 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                      <span>➕ Magdagdag ng Bagong School Pinpoint</span>
                    </h5>
                    <p className="text-[10px] text-stone-300 mt-0.5 leading-tight">
                      Ilagay ang pangalan, uri, at lokasyon ng panibagong paaralan o campus sa Gumaca para mai-plot sa mapa.
                    </p>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">
                        Pangalan ng Paaralan / Campus: *
                      </label>
                      <input
                        type="text"
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                        placeholder="hal. Gumaca Maritime Academy"
                        className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-stone-300 block mb-1">
                          Maikling Pangalan:
                        </label>
                        <input
                          type="text"
                          value={newSchoolShortName}
                          onChange={(e) => setNewSchoolShortName(e.target.value)}
                          placeholder="hal. GMA"
                          className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-300 block mb-1">
                          Uri ng Paaralan:
                        </label>
                        <select
                          value={newSchoolType}
                          onChange={(e) => setNewSchoolType(e.target.value as any)}
                          className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="College">College</option>
                          <option value="University">University</option>
                          <option value="High School">High School</option>
                          <option value="Elementary">Elementary</option>
                        </select>
                      </div>
                    </div>

                    {/* Coordinates Inputs & Map Capture Buttons */}
                    <div className="p-2.5 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-amber-300">
                          🎓 Campus Center Coordinates:
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (leafletMapRef.current) {
                              const center = leafletMapRef.current.getCenter();
                              setNewSchoolCampusLat(Number(center.lat.toFixed(6)));
                              setNewSchoolCampusLng(Number(center.lng.toFixed(6)));
                            }
                          }}
                          className="text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 hover:bg-amber-900 font-semibold cursor-pointer"
                        >
                          📍 Map Center
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="0.000001"
                          value={newSchoolCampusLat}
                          onChange={(e) => setNewSchoolCampusLat(parseFloat(e.target.value) || 0)}
                          className="bg-stone-900 border border-stone-700 text-amber-200 text-xs font-mono rounded-lg p-1.5"
                          placeholder="Latitude"
                        />
                        <input
                          type="number"
                          step="0.000001"
                          value={newSchoolCampusLng}
                          onChange={(e) => setNewSchoolCampusLng(parseFloat(e.target.value) || 0)}
                          className="bg-stone-900 border border-stone-700 text-amber-200 text-xs font-mono rounded-lg p-1.5"
                          placeholder="Longitude"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">
                        Paglalarawan / Landmark:
                      </label>
                      <input
                        type="text"
                        value={newSchoolDesc}
                        onChange={(e) => setNewSchoolDesc(e.target.value)}
                        placeholder="hal. Poblacion, Gumaca, Quezon"
                        className="w-full bg-stone-800 border border-stone-700 text-white text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Add Action Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSchoolName.trim()) {
                        setEntranceSaveToast("⚠️ Mangyaring maglagay ng Pangalan ng Paaralan.");
                        setTimeout(() => setEntranceSaveToast(null), 3000);
                        return;
                      }

                      const addedItem = addCustomSchoolItem({
                        name: newSchoolName.trim(),
                        shortName: newSchoolShortName.trim() || newSchoolName.trim(),
                        type: newSchoolType,
                        lat: newSchoolCampusLat,
                        lng: newSchoolCampusLng,
                        entranceLat: newSchoolCampusLat,
                        entranceLng: newSchoolCampusLng,
                        desc: newSchoolDesc.trim() || `${newSchoolName.trim()}, Gumaca`,
                        isEntranceInvisible: false
                      });

                      if (addedItem) {
                        setSchoolRevision(r => r + 1);
                        setSelectedEditingSchoolId(addedItem.id);
                        setShowSchoolsOnMap(true);
                        setSystemTab("edit");
                        setNewSchoolName("");
                        setNewSchoolShortName("");
                        setNewSchoolDesc("");
                        setEntranceSaveToast("Naidagdag nang matagumpay ang bagong School Pinpoint! 🎓✨");
                        setTimeout(() => setEntranceSaveToast(null), 4000);

                        if (leafletMapRef.current) {
                          leafletMapRef.current.flyTo([addedItem.lat, addedItem.lng], 17);
                        }
                      }
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🎓 I-save at I-plot ang Bagong School Pinpoint</span>
                  </button>
                </div>
              )}

              {entranceSaveToast && (
                <div className="bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[11px] p-2.5 rounded-xl text-center font-bold animate-fade-in shadow-md">
                  {entranceSaveToast}
                </div>
              )}
            </div>

            {/* Scroll Controls Footer */}
            <div className="p-2 sm:p-2.5 bg-stone-950/90 border-t border-stone-800 rounded-b-2xl flex items-center justify-between text-[10px] text-stone-400 gap-2 shrink-0">
              <span className="font-semibold text-amber-300 flex items-center gap-1">
                <span>📜 Scroll Functions:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={scrollToTopSystemBox}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-2 py-1 rounded-md border border-stone-700 font-bold transition-all cursor-pointer flex items-center gap-0.5"
                  title="Scroll system box to top"
                >
                  <span>⬆️ Taas</span>
                </button>
                <button
                  type="button"
                  onClick={scrollToBottomSystemBox}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-2 py-1 rounded-md border border-stone-700 font-bold transition-all cursor-pointer flex items-center gap-0.5"
                  title="Scroll system box to bottom"
                >
                  <span>⬇️ Baba</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Barangay Boundary Drawer & Editor Floating Panel */}
        {isDrawingMode && (
          <div className="fixed sm:absolute bottom-2 sm:bottom-auto sm:top-3 left-2 right-2 sm:left-auto sm:right-3 z-30 bg-stone-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl border border-stone-700 shadow-2xl max-w-sm w-auto font-sans animate-fade-in max-h-[70vh] sm:max-h-[85vh] overflow-y-auto divide-y divide-stone-800 space-y-3">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-1 gap-2">
              <div className="min-w-0">
                <h4 className="font-display text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5 truncate">
                  <Shapes className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>✏️ Boundary Drawer ({drawnPoints.length} pts)</span>
                </h4>
                {!isDrawingPanelMinimized && (
                  <p className="text-[10px] text-stone-300 mt-0.5 hidden xs:block">
                    Pindutin ang mapa para maglagay ng tuldok ng boundary!
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawingPanelMinimized(prev => !prev)}
                  className="text-stone-300 hover:text-white text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  {isDrawingPanelMinimized ? "Expand ▲" : "Minimize ▼"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawingMode(false)}
                  className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {!isDrawingPanelMinimized && (
              <>
                {/* Shape & Color Settings */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-semibold">Uri ng Boundary:</span>
                    <div className="flex items-center gap-1 bg-stone-800 p-0.5 rounded-xl text-[10px]">
                      <button
                        onClick={() => setDrawShapeType("polygon")}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          drawShapeType === "polygon" ? "bg-amber-500 text-stone-950" : "text-stone-300"
                        }`}
                      >
                        🔷 Polygon
                      </button>
                      <button
                        onClick={() => setDrawShapeType("polyline")}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          drawShapeType === "polyline" ? "bg-amber-500 text-stone-950" : "text-stone-300"
                        }`}
                      >
                        〰️ Polyline
                      </button>
                      <button
                        onClick={() => setDrawShapeType("points")}
                        className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          drawShapeType === "points" ? "bg-amber-500 text-stone-950" : "text-stone-300"
                        }`}
                      >
                        📍 Points
                      </button>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-semibold">Kulay ng Boundary:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { color: "#2563eb", label: "Blue" },
                        { color: "#059669", label: "Emerald" },
                        { color: "#d97706", label: "Amber" },
                        { color: "#7c3aed", label: "Violet" },
                        { color: "#e11d48", label: "Rose" },
                        { color: "#0284c7", label: "Cyan" }
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() => setDrawColor(c.color)}
                          style={{ backgroundColor: c.color }}
                          className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                            drawColor === c.color ? "ring-2 ring-white scale-125" : "opacity-80 hover:opacity-100"
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Active Points List & Coordinate Inputs */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200 flex items-center gap-1">
                      📍 Active Points ({drawnPoints.length})
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      {drawnPoints.length > 0 && (
                        <>
                          <button
                            onClick={handleUndoPoint}
                            className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-semibold cursor-pointer"
                          >
                            ↩️ Undo
                          </button>
                          <button
                            onClick={handleClearPoints}
                            className="px-2 py-0.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded font-semibold cursor-pointer"
                          >
                            🗑️ Clear
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {drawnPoints.length === 0 ? (
                    <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-800 text-center text-stone-400 text-[11px]">
                      👆 I-click ang anumang bahagi ng mapa para maglagay ng tuldok ng boundary!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[10px] font-mono divide-y divide-stone-800">
                      {drawnPoints.map((p, idx) => (
                        <div key={idx} className="pt-1 flex items-center justify-between gap-1">
                          <span className="text-amber-400 font-bold shrink-0">#{idx + 1}</span>
                          <input
                            type="number"
                            step="0.000001"
                            value={p.lat}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                const newP = [...drawnPoints];
                                newP[idx] = { ...newP[idx], lat: val };
                                setDrawnPoints(newP);
                              }
                            }}
                            className="w-20 bg-stone-800 border border-stone-700 rounded px-1 py-0.5 text-stone-200 focus:outline-none focus:border-amber-500"
                          />
                          <input
                            type="number"
                            step="0.000001"
                            value={p.lng}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                const newP = [...drawnPoints];
                                newP[idx] = { ...newP[idx], lng: val };
                                setDrawnPoints(newP);
                              }
                            }}
                            className="w-20 bg-stone-800 border border-stone-700 rounded px-1 py-0.5 text-stone-200 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => {
                              const newP = drawnPoints.filter((_, i) => i !== idx);
                              setDrawnPoints(newP);
                            }}
                            className="text-stone-500 hover:text-rose-400 font-bold px-1"
                            title="Burahin ang tuldok na ito"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Boundary Section */}
                <div className="pt-3 space-y-2">
                  <label className="block text-xs font-semibold text-stone-300">
                    Piliin o Isulat ang Barangay:
                  </label>
                  <select
                    value={selectedBarangayToSave}
                    onChange={(e) => setSelectedBarangayToSave(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 text-stone-200 text-xs font-bold rounded-xl p-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Barangay Tabing Dagat">Barangay Tabing Dagat</option>
                    <option value="Barangay Villa Nava">Barangay Villa Nava</option>
                    <option value="Barangay San Diego">Barangay San Diego</option>
                    <option value="Barangay Bagong Buhay">Barangay Bagong Buhay</option>
                    <option value="Barangay Rizal">Barangay Rizal</option>
                    <option value="Barangay Rosario">Barangay Rosario</option>
                    <option value="Barangay Pipisik">Barangay Pipisik</option>
                    <option value="Barangay Buensuceso">Barangay Buensuceso</option>
                    <option value="Barangay Mabini">Barangay Mabini</option>
                    <option value="Barangay Peñafrancia">Barangay Peñafrancia</option>
                    <option value="Barangay Progreso Purok 1">Barangay Progreso Purok 1</option>
                    <option value="Barangay Maunlad">Barangay Maunlad</option>
                  </select>

                  <button
                    onClick={handleSaveBoundary}
                    disabled={drawnPoints.length < 2}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>💾 I-save ang Boundary sa {selectedBarangayToSave}</span>
                  </button>
                </div>

                {/* Saved Barangay Boundaries List & Manual Editor Actions */}
                <div className="pt-3 space-y-2">
                  {showConfirmDeleteAll ? (
                    <div className="bg-rose-950/90 border border-rose-700/80 p-2.5 rounded-xl text-xs space-y-2 text-rose-100 animate-fade-in">
                      <p className="font-bold text-[11px] leading-tight">
                        ⚠️ Sigurado ka bang gusto mong burahin ang LAHAT ng {drawnBarangayBoundaries.length} na-save na barangay boundary?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDrawnBarangayBoundaries([]);
                            localStorage.setItem("barangay_drawn_boundaries", JSON.stringify([]));
                            setSelectedBarangayBoundaryFilter("");
                            setShowConfirmDeleteAll(false);
                            setCopySuccessMsg("🗑️ Matagumpay na nabura ang LAHAT ng na-save na barangay boundary!");
                            setTimeout(() => setCopySuccessMsg(""), 3500);
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-1.5 px-2 rounded-lg text-[10px] cursor-pointer transition-colors text-center"
                        >
                          Oo, Burahin Lahat
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirmDeleteAll(false)}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-1.5 px-2 rounded-lg text-[10px] cursor-pointer transition-colors"
                        >
                          Kanselahin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                      <span>📋 Saved Boundaries ({drawnBarangayBoundaries.length})</span>
                      {drawnBarangayBoundaries.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowConfirmDeleteAll(true)}
                          className="text-[10px] bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          🗑️ Burahin Lahat
                        </button>
                      )}
                    </div>
                  )}

                  {drawnBarangayBoundaries.length === 0 ? (
                    <div className="bg-stone-800/40 p-3 rounded-xl text-center space-y-2 border border-stone-700/50">
                      <p className="text-[10px] text-stone-400 italic">
                        Wala pang nai-save na barangay boundary. Iguhit ang iyong unang boundary sa mapa o i-restore ang default list!
                      </p>
                      <button
                        type="button"
                        onClick={handleRestoreDefaultBoundaries}
                        className="text-[10px] bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-700/80 text-indigo-200 font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all active:scale-95"
                      >
                        ✨ Restore Default 12 Barangay Boundaries
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {drawnBarangayBoundaries.map((b) => (
                        <div
                          key={b.id}
                          className="bg-stone-800/90 p-2.5 rounded-xl border border-stone-700/80 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                              <span
                                className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                style={{ backgroundColor: b.color }}
                              />
                              <span>{b.barangayName}</span>
                            </div>
                            <span className="text-[10px] font-mono text-stone-400">
                              {b.points.length} points
                            </span>
                          </div>

                          {/* Editing Actions for this Saved Boundary */}
                          <div className="flex items-center gap-1 pt-1 border-t border-stone-700/50 text-[10px]">
                            <button
                              onClick={() => {
                                // Load existing boundary points into the drawing canvas for editing!
                                setDrawnPoints(b.points.map(p => ({ lat: p[0], lng: p[1] })));
                                setSelectedBarangayToSave(b.barangayName);
                                setDrawColor(b.color);
                                setIsDrawingMode(true);
                              }}
                              className="flex-1 py-1 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-center cursor-pointer transition-colors"
                              title="Kargahin ang mga tuldok para i-edit o dagdagan"
                            >
                              ✏️ I-edit ang Points
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBarangayBoundaryFilter(b.barangayName);
                                setShowBoundariesOnMap(true);
                                if (leafletMapRef.current && b.points.length > 0) {
                                  const bounds = L.latLngBounds(b.points);
                                  leafletMapRef.current.fitBounds(bounds, { padding: [50, 50] });
                                }
                              }}
                              className="py-1 px-2 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold rounded-lg cursor-pointer"
                              title="Tumingin sa mapa"
                            >
                              👁️ View
                            </button>

                            <button
                              onClick={() => handleDeleteBoundary(b.id)}
                              className="py-1 px-2 bg-rose-950/80 hover:bg-rose-800 text-rose-300 font-semibold rounded-lg cursor-pointer"
                              title="Burahin ang boundary"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Hover / Selection Preview Card (Draggable over the map) */}
        {!isPropertyCardDismissed && (hoveredProperty || selectedProperty) && mapMode !== "google_embed" && (
          <motion.div
            ref={propertyCardRef}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            className={isFullscreen
              ? "fixed sm:absolute top-16 sm:top-3 right-2 sm:right-3 z-50 bg-white/95 backdrop-blur-md p-2 sm:p-4 rounded-xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-[170px] sm:max-w-[320px] w-auto font-sans cursor-grab active:cursor-grabbing select-none"
              : "absolute top-2 right-2 z-50 bg-white/95 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-stone-200/90 shadow-lg max-w-[155px] sm:max-w-[185px] w-auto font-sans cursor-grab active:cursor-grabbing select-none"
            }
          >
            {(() => {
              const displayProp = hoveredProperty || selectedProperty!;
              const score = getMatchScore(displayProp.id);
              const [lat, lng] = getLatLngForProperty(displayProp);
              const schoolDistances = getSchoolDistancesForProperty(lat, lng, displayProp.neighborhood);
              const nearestSchool = schoolDistances[0];

              const handleCloseCard = (e: React.SyntheticEvent) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                setIsPropertyCardDismissed(true);
                setHoveredProperty(null);
                onSelectProperty(null as any);
                setActiveArrowLocation(null);
                setActiveSchoolRouteFilter("none");
                setDismissedSchoolId(selectedSchoolId || "none");
                if (routeLayerRef.current) {
                  try {
                    routeLayerRef.current.clearLayers();
                  } catch (err) {}
                }
              };

              return (
                <div>
                  {/* Card Header & Close */}
                  <div className={`flex items-center justify-between text-stone-400 border-b border-stone-100 ${isFullscreen ? "mb-1 sm:mb-2 pb-1 sm:pb-1.5" : "mb-0.5 pb-0.5"}`}>
                    <span className={`font-bold tracking-wider uppercase text-stone-500 flex items-center gap-1 ${isFullscreen ? "text-[8px] sm:text-[10px]" : "text-[8px]"}`}>
                      📍 Property Location
                    </span>
                    <button
                      type="button"
                      onClick={handleCloseCard}
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      onTouchStartCapture={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={handleCloseCard}
                      className="text-stone-500 hover:text-stone-900 active:text-black font-extrabold text-xs sm:text-sm p-1 rounded-lg bg-stone-100/90 hover:bg-stone-200 active:bg-stone-300 transition-colors cursor-pointer touch-manipulation w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 z-50 relative"
                      title="Isara"
                    >
                      ✕
                    </button>
                  </div>

                  <div className={`flex items-center ${isFullscreen ? "gap-1.5 sm:gap-3" : "gap-1.5"}`}>
                    <img
                      src={displayProp.image}
                      alt={displayProp.title}
                      referrerPolicy="no-referrer"
                      className={`object-cover border border-stone-100 shrink-0 shadow-2xs pointer-events-none ${isFullscreen ? "w-8 h-8 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl" : "w-7 h-7 rounded-lg"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-bold text-stone-900 leading-tight truncate ${isFullscreen ? "text-[11px] sm:text-base" : "text-[10px]"}`}>
                        {displayProp.title}
                      </h4>
                      <p className={`text-stone-500 truncate font-normal ${isFullscreen ? "text-[9px] sm:text-xs mt-0 sm:mt-0.5" : "text-[8px] mt-0.2"}`}>
                        {displayProp.neighborhood || displayProp.address || "Barangay Tabing Dagat"}
                      </p>
                      <div className={`inline-block bg-stone-100 text-stone-900 font-bold rounded-md border border-stone-200/60 ${isFullscreen ? "mt-0.5 sm:mt-1.5 text-[9px] sm:text-xs px-1.5 sm:px-2.5 py-0.2 sm:py-0.5" : "mt-0.5 text-[8px] px-1 py-0.2"}`}>
                        ₱{displayProp.price.toLocaleString()} / mo
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDetails) {
                        onOpenDetails(displayProp);
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 ${isFullscreen ? "mt-1.5 sm:mt-3 rounded-lg sm:rounded-2xl py-1 sm:py-2.5 px-2 sm:px-3 text-[10px] sm:text-xs" : "mt-1 rounded-lg py-0.5 px-1.5 text-[9px]"}`}
                  >
                    <span>Tingnan ang detalye</span>
                  </button>

                  {nearestSchool && (
                    <div className={`border-t border-stone-100 flex items-center justify-between text-stone-500 ${isFullscreen ? "mt-1.5 sm:mt-2.5 pt-1 sm:pt-2 text-[9px] sm:text-[10px]" : "mt-1 pt-0.5 text-[8px]"}`}>
                      <span className="truncate">🎓 {nearestSchool.shortName || nearestSchool.name.replace(/ [🎓🏫🏛️]/g, '')}</span>
                      <span className="font-bold text-indigo-600 font-mono shrink-0 whitespace-nowrap ml-1">{nearestSchool.walkingMinutes}m</span>
                    </div>
                  )}

                  <div className={`border-t border-stone-100 flex items-center justify-end ${isFullscreen ? "mt-1 sm:mt-2 pt-1 sm:pt-2 text-[9px] sm:text-[10px]" : "mt-0.5 pt-0.5 text-[8px]"}`}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onPointerDown={(e) => e.stopPropagation()}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                    >
                      Google Maps ↗
                    </a>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>




    </div>
  );
}
