import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { motion } from "motion/react";
import { GUMACA_SCHOOLS, getSchoolDistancesForProperty, getGumacaSchools, saveCustomSchoolCoord, resetCustomSchoolCoords, addCustomSchoolItem, deleteCustomSchoolItem, saveCustomPropertyCoord, getCustomPropertyCoords, resetCustomPropertyCoords, parsePropertyLatLng } from "../utils/schoolDistances";
import { AiMatch } from "../types";
import { Property } from "../data/properties";
import { Map, MapPin, Navigation, Layers, Compass, ExternalLink, School, Info, Search, Maximize2, Minimize2, Pencil, Trash2, Copy, Check, RotateCcw, Save, Ruler, Footprints, GripHorizontal } from "lucide-react";

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
  { name: "SLSU Villa Nava 🎓", lat: 13.912125, lng: 122.104057, type: "University", desc: "Campus - Brgy. Villa Nava" },
  { name: "SLSU Tabing Dagat 🎓🌊", lat: 13.9230, lng: 122.1014, type: "University", desc: "Campus - Brgy. Tabing Dagat" },
  { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, type: "College", desc: "College, Gumaca" },
  { name: "Gumaca National High School (GNHS) 🏫", lat: 13.9182, lng: 122.0956, type: "High School", desc: "Gumaca NHS, Mabini/Poblacion" },
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
  { name: "Jeep Terminal (Lopez) 🚐", lat: 13.9222, lng: 122.1009, type: "Transit", desc: "Jeepney Terminal bound for Lopez" },
  { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, type: "Landmark", desc: "Piat Area, Mabini / Poblacion, Gumaca" },
  { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, type: "Heritage", desc: "Holy Child Jesus Christ Church / Chapel, Town Proper, Gumaca" },
  { name: "578 Emporium 📍", lat: 13.921341, lng: 122.103364, type: "Shopping", desc: "Emporium & Shopping Center, Maharlika Highway, Gumaca" },
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
  const [isMobileQuickJumpOpen, setIsMobileQuickJumpOpen] = useState(false);
  const [isPropertyCardDismissed, setIsPropertyCardDismissed] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState("");

  useEffect(() => {
    if (selectedProperty) {
      setIsPropertyCardDismissed(false);
    }
  }, [selectedProperty]);
  const [showSchoolsOnMap, setShowSchoolsOnMap] = useState(false);

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

  // Persistent draggable arrow markers — one per quick-jump destination
  // Key = stable landmark ID, value = current coords + label
  // Pre-populated so ALL arrows are visible immediately when the map opens
  const ARROW_STORAGE_KEY = "casafinder_arrow_markers_v1";

  // _v = version — bump this number whenever coordinates are updated in code.
  // A version mismatch with localStorage means the code has newer coords → use code coords.
  const DEFAULT_ARROW_MARKERS: Record<string, { lat: number; lng: number; title: string; desc?: string; _v: number }> = {
    "slsu-villa-nava":   { _v:1, lat: 13.912125, lng: 122.104057, title: "SLSU Villa Nava 🎓",                desc: "Southern Luzon State University - Villa Nava Campus" },
    "slsu-tabing-dagat": { _v:2, lat: 13.9230,   lng: 122.1014,   title: "SLSU Tabing Dagat Campus 🎓",       desc: "Southern Luzon State University - Tabing Dagat Campus" },
    "jollibee":          { _v:1, lat: 13.920523, lng: 122.099064, title: "Jollibee Gumaca 🍔🐝",               desc: "Fast Food Restaurant, Maharlika Highway, Gumaca" },
    "mcdonalds":         { _v:1, lat: 13.920751, lng: 122.100299, title: "McDonald's Gumaca 🍟🍔",             desc: "Fast Food Restaurant, Maharlika Highway, Gumaca" },
    "chowking":          { _v:1, lat: 13.920489, lng: 122.098769, title: "Chowking Gumaca 🥢🥟",               desc: "Fast Food Restaurant, Maharlika Highway, Gumaca" },
    "novo":              { _v:1, lat: 13.920196, lng: 122.097666, title: "Novo Department Store 🛍️🏢",         desc: "Department Store & Shopping, Maharlika Highway, Gumaca" },
    "heritage":          { _v:1, lat: 13.923430, lng: 122.100694, title: "Heritage Site 🏛️",                  desc: "Gumaca Heritage / Historical Landmark, Tabing Dagat" },
    "eqc":               { _v:1, lat: 13.923315, lng: 122.097557, title: "Eastern Quezon College (EQC) 🏛️",   desc: "College & Educational Institution, Gumaca" },
    "gnhs":              { _v:2, lat: 13.9182, lng: 122.0956, title: "Gumaca National High School (GNHS) 🏫", desc: "Gumaca NHS, Mabini/Poblacion, Gumaca" },
    "market":            { _v:1, lat: 13.920509, lng: 122.101597, title: "Gumaca Public Market 🛒🐟",          desc: "Public Market & Commercial Hub, Poblacion" },
    "puregold":          { _v:1, lat: 13.921103, lng: 122.105650, title: "Puregold Gumaca 🟡🛒",              desc: "Puregold Supermarket, Maharlika Highway / San Diego" },
    "jeep-terminal":     { _v:1, lat: 13.919680, lng: 122.100656, title: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", desc: "Jeepney Terminal for Macalelon, Unisan & Lopez" },
    "jeep-terminal-lopez": { _v:1, lat: 13.9222, lng: 122.1009, title: "Jeep Terminal (Lopez) 🚐", desc: "Jeepney Terminal bound for Lopez, Gumaca" },
    "rakk-prophet":      { _v:1, lat: 13.932183, lng: 122.091994, title: "RAKKK Prophet Medical Center 🏥",             desc: "Hospital / Medical Center, Km. 194 Maharlika Highway, Brgy. Rosario, Gumaca" },
    "district-hospital": { _v:1, lat: 13.933120, lng: 122.089487, title: "Gumaca District Hospital 🏥",                 desc: "Gumaca District Hospital, Maharlika Highway, Brgy. Rosario, Gumaca" },
    "convention-center": { _v:2, lat: 13.9236, lng: 122.1020, title: "Southern Luzon Convention Center 🏛️",         desc: "Convention & Events Center, Tabing Dagat Area, Gumaca" },
  };

  const [arrowMarkers, setArrowMarkers] = useState<Record<string, {
    lat: number;
    lng: number;
    title: string;
    desc?: string;
    _v?: number;
  }>>({});
  // Refs so dragend handlers always see latest coords without stale closure
  const arrowMarkersRef = useRef<Record<string, L.Marker>>({});
  const [mapReady, setMapReady] = useState(false);
  // Ref to latest arrowMarkers so map-init callback can access without stale closure
  const arrowMarkersStateRef = useRef<Record<string, { lat: number; lng: number; title: string; desc?: string; _v?: number }>>(DEFAULT_ARROW_MARKERS);

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
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);

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
    { name: "SLSU Villa Nava 🎓", lat: 13.912125, lng: 122.104057, detail: "Brgy. Villa Nava Campus" },
    { name: "SLSU Tabing Dagat Campus 🎓", lat: 13.9230, lng: 122.1014, detail: "Brgy. Tabing Dagat Campus" },
    { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, detail: "College, Gumaca" },
    { name: "Gumaca National High School (GNHS) 🏫", lat: 13.9182, lng: 122.0956, detail: "High School, Mabini/Poblacion" },
    { name: "Gumaca West & East Central Elementary ", lat: 13.918000, lng: 122.099000, detail: "Elementary School, M.H. Del Pilar St." },
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
    { name: "Jeep Terminal (Lopez) 🚐", lat: 13.9222, lng: 122.1009, detail: "Jeep Terminal bound for Lopez" },
    { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, detail: "Piat Area, Mabini / Poblacion" },
    { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, detail: "Church / Chapel, Town Proper" },
    { name: "578 Emporium 📍", lat: 13.921341, lng: 122.103364, detail: "Shopping Center & Emporium, Maharlika Highway" },
    ...properties.map(p => {
      const [lat, lng] = getLatLngForProperty(p);
      return {
        name: ` ${p.title}`,
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

  // Inject keyframes for arrow marker animations (ping + bounce)
  useEffect(() => {
    const id = "casafinder-arrow-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
    setMapReady(true);

    // Arrows are shown on-demand when user selects a Quick Jump destination
    // No arrows placed on map init

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

    // Click on map to inspect street or set school pinpoint
    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (isEntranceEditingModeRef.current) {
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
          if (isEntranceEditingModeRef.current) {
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

    // Clean up on unmount
    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      // Clear stale arrow marker refs so next mount recreates them fresh
      arrowMarkersRef.current = {};
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
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lat.toFixed(3)}N</div>`,
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
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lng.toFixed(3)}E</div>`,
          iconSize: [55, 14],
          iconAnchor: [27, 0]
        });
        gridLayerRef.current.addLayer(L.marker([latStart + 0.001, lng], { icon: labelIcon, interactive: false }));
      }
    }
  }, [showGrid]);

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

    // Quick Jump Arrow Pointers — managed separately in their own useEffect below
    // (do NOT add/remove arrows here to avoid wiping them on property/school re-renders)

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
          triggerArrowHighlight(sch.lat, sch.lng, sch.name, sch.desc, 20);
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
                  <span class="text-amber-300"> ${distObj.distanceKm.toFixed(2)} km</span>
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
                            <span class="text-amber-300"> ${osrmDistKm.toFixed(2)} km</span>
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
  }, [properties, selectedProperty, aiMatches, onSelectProperty, showLandmarks, showSchoolsOnMap, villaNavaCoords, tabingDagatCoords, activeSchoolRouteFilter, selectedSchoolId, schoolRevision]);

  // Keep ref in sync with state so map-init callback always has latest coords
  useEffect(() => {
    arrowMarkersStateRef.current = arrowMarkers;
  }, [arrowMarkers]);

  // Dedicated useEffect for arrow markers — completely isolated from the main marker useEffect
  // so that dragging an arrow never causes property/school markers to re-render/disappear
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const buildArrowIcon = (title: string, isDragging = false) => L.divIcon({
      className: "",
      html: `
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;width:44px;height:44px;cursor:${isDragging ? "grabbing" : "grab"};user-select:none;">
          <!-- Label floats above, pointer-events none so it never blocks drag -->
          <div style="position:absolute;bottom:52px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#dc2626;color:#fff;font-weight:800;font-size:10px;padding:3px 10px;border-radius:999px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);pointer-events:none;">
            ${title}
          </div>
          <!-- Ping ring -->
          ${!isDragging ? `<div style="position:absolute;inset:-8px;background:rgba(239,68,68,0.3);border-radius:50%;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></div>` : ""}
          <!-- Circle drag handle -->
          <div style="width:44px;height:44px;background:#dc2626;border-radius:50%;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;stroke-width:3.5;${!isDragging ? "animation:bounce 1s infinite;" : ""}" fill="none" viewBox="0 0 24 24" stroke="#fff">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44]
    });

    Object.entries(arrowMarkers).forEach(([arrowId, arrow]) => {
      // If marker already exists on map, just move it — don't recreate
      if (arrowMarkersRef.current[arrowId]) {
        arrowMarkersRef.current[arrowId].setLatLng([arrow.lat, arrow.lng]);
        return;
      }

      const arrowMarker = L.marker([arrow.lat, arrow.lng], {
        icon: buildArrowIcon(arrow.title),
        draggable: true,
        title: arrow.title,
        zIndexOffset: 1000
      }).addTo(map);

      arrowMarker.on("click", () => {
        const { lat, lng } = arrowMarker.getLatLng();
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([lat, lng], 20, { animate: true, duration: 1.2 });
        }
      });

      arrowMarker.on("dragstart", () => {
        arrowMarker.setIcon(buildArrowIcon(arrow.title, true));
      });

      arrowMarker.on("drag", () => {
        arrowMarker.setIcon(buildArrowIcon(arrow.title, true));
      });

      arrowMarker.on("dragend", () => {
        const { lat, lng } = arrowMarker.getLatLng();
        const newLat = Number(lat.toFixed(6));
        const newLng = Number(lng.toFixed(6));
        arrowMarker.setIcon(buildArrowIcon(arrow.title, false));
        // Update state AND auto-save to localStorage
        setArrowMarkers(prev => {
          const updated = { ...prev, [arrowId]: { ...prev[arrowId], lat: newLat, lng: newLng, _v: DEFAULT_ARROW_MARKERS[arrowId]?._v ?? 1 } };
          try {
            // Save only this arrow's position to localStorage
            const existing = JSON.parse(localStorage.getItem(ARROW_STORAGE_KEY) || "{}");
            existing[arrowId] = { lat: newLat, lng: newLng, _v: DEFAULT_ARROW_MARKERS[arrowId]?._v ?? 1 };
            localStorage.setItem(ARROW_STORAGE_KEY, JSON.stringify(existing));
          } catch (_) {}
          return updated;
        });
      });

      arrowMarkersRef.current[arrowId] = arrowMarker;
    });

    // Remove arrows that no longer exist in state
    Object.keys(arrowMarkersRef.current).forEach(id => {
      if (!arrowMarkers[id]) {
        try { arrowMarkersRef.current[id].remove(); } catch (_) {}
        delete arrowMarkersRef.current[id];
      }
    });
  }, [arrowMarkers, mapReady]);

  const panToArea = (lat: number, lng: number, zoom: number = 20) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
    }
  };

  const triggerArrowHighlight = (lat: number, lng: number, title: string, desc?: string, zoom: number = 17, arrowId?: string) => {
    setActiveArrowLocation({ lat, lng, title, desc });
    const id = arrowId || title.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);

    // Get saved position for this arrow (user may have dragged it before)
    const savedCoords = (() => {
      try {
        const saved = localStorage.getItem(ARROW_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const defaultVersion = DEFAULT_ARROW_MARKERS[id]?._v ?? 1;
          const savedVersion = parsed[id]?._v ?? 0;
          if (parsed[id] && savedVersion >= defaultVersion) {
            return { lat: parsed[id].lat, lng: parsed[id].lng };
          }
        }
      } catch (_) {}
      return null;
    })();

    const finalLat = savedCoords?.lat ?? lat;
    const finalLng = savedCoords?.lng ?? lng;

    // Show ONLY this arrow — clear all others
    setArrowMarkers({ [id]: { lat: finalLat, lng: finalLng, title, desc } });
    panToArea(finalLat, finalLng, zoom);
  };

  const triggerSLSUHighlight = (zoom: number = 20) => {
    triggerArrowHighlight(
      villaNavaCoords[0],
      villaNavaCoords[1],
      "SLSU Villa Nava 🎓",
      "Southern Luzon State University - Villa Nava Campus, Gumaca, Quezon.",
      zoom,
      "slsu-villa-nava"
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
              Gumaca, Quezon Interactive Street Map
            </h3>
            <p className="text-[10px] text-stone-500 font-light hidden sm:block">
              Mag-search ng kalye, barangay, o campus, o pindutin ang mapa para makita ang detalye!
            </p>
          </div>
        </div>
        {/* Header Right Controls: Layer Switcher & Fullscreen */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">

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
              Map
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
            <span>{isLocatingUser ? "GPS..." : "GPS"}</span>
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
                    triggerArrowHighlight(item.lat, item.lng, item.name, item.detail, 20);
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

          {/* Quick Jump Buttons for Laptop View when Fullscreen */}
          <button
            onClick={() => triggerSLSUHighlight(17)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            SLSU Villa Nava
          </button>

          <button
            onClick={() => {
              const slsu = getGumacaSchools().find(s => s.id === "slsu-main");
              const slsuLat = slsu?.lat || 13.9230;
              const slsuLng = slsu?.lng || 122.1014;
              triggerArrowHighlight(slsuLat, slsuLng, "SLSU Tabing Dagat Campus 🎓", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 20, "slsu-tabing-dagat");
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            SLSU Tabing Dagat
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "jollibee")}
            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            Jollibee
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920751, 122.100299, "McDonald's Gumaca 🍟🍔", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "mcdonalds")}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            McDonald's
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920489, 122.098769, "Chowking Gumaca 🥢🥟", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "chowking")}
            className="bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            Chowking
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920196, 122.097666, "Novo Department Store 🛍️🏢", "Department Store & Shopping, Maharlika Highway, Gumaca", 20, "novo")}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            📍 Novo Dept Store
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923430, 122.100694, "Heritage Site 🏛️", "Gumaca Heritage / Historical Landmark, Tabing Dagat", 20, "heritage")}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏛️ Heritage
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.923315, 122.097557, "Eastern Quezon College (EQC) 🏛️", "College & Educational Institution, Gumaca", 20, "eqc")}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏛️ EQC
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.9182, 122.0956, "Gumaca National High School (GNHS) 🏫", "Gumaca NHS, Mabini/Poblacion, Gumaca", 20, "gnhs")}
            className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏫 Gumaca NHS
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.920509, 122.101597, "Gumaca Public Market 🛒🐟", "Public Market & Commercial Hub, Poblacion", 20, "market")}
            className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            Public Market
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.921103, 122.105650, "Puregold Gumaca 🟡🛒", "Puregold Supermarket, Maharlika Highway / San Diego", 20, "puregold")}
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-900 border border-yellow-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            Puregold
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.919680, 122.100656, "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", "Jeepney Terminal for Macalelon, Unisan & Lopez", 20, "jeep-terminal")}
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🚐 Jeep Terminal
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.9222, 122.1009, "Jeep Terminal (Lopez) 🚐", "Jeepney Terminal bound for Lopez, Gumaca", 20, "jeep-terminal-lopez")}
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🚐 Jeep Terminal (Lopez)
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.932183, 122.091994, "RAKKK Prophet Medical Center 🏥", "Hospital / Medical Center, Km. 194 Maharlika Highway, Brgy. Rosario, Gumaca", 20, "rakk-prophet")}
            className="bg-red-50 hover:bg-red-100 text-red-900 border border-red-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏥 RAKKK Medical
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.933120, 122.089487, "Gumaca District Hospital 🏥", "Gumaca District Hospital, Maharlika Highway, Brgy. Rosario, Gumaca", 20, "district-hospital")}
            className="bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏥 District Hospital
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.9236, 122.1020, "Southern Luzon Convention Center 🏛️", "Convention & Events Center, Tabing Dagat Area, Gumaca", 20, "convention-center")}
            className="bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            🏛️ Convention Center
          </button>

          <button
            onClick={() => triggerArrowHighlight(13.9220, 122.0995, "Whole Gumaca Overview 🔍", "Gumaca Municipality Overview", 14)}
            className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ml-auto"
          >
            Whole Gumaca
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
                    <span className="font-extrabold text-xs tracking-wide text-white truncate">Gumaca Map</span>
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
                    Sat
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

                      {/* Landmark Quick Jump Option Field Dropdown */}
                      <div className="flex items-center justify-between gap-2 bg-stone-800/90 border border-stone-700 px-2 py-1 rounded-xl">
                        <span className="font-bold text-amber-300 text-[10px] shrink-0"> Lugar:</span>
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (val === "slsu_villas") triggerSLSUHighlight(17);
                            else if (val === "slsu_main") {
                              const slsu = getGumacaSchools().find(s => s.id === "slsu-main");
                              triggerArrowHighlight(slsu?.lat || 13.9230, slsu?.lng || 122.1014, "SLSU Tabing Dagat Campus 🎓", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 20, "slsu-tabing-dagat");
                            }
                            else if (val === "jollibee") triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "jollibee");
                            else if (val === "mcdonalds") triggerArrowHighlight(13.920751, 122.100299, "McDonald's Gumaca 🍟🍔", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "mcdonalds");
                            else if (val === "chowking") triggerArrowHighlight(13.920489, 122.098769, "Chowking Gumaca 🥢🥟", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "chowking");
                            else if (val === "novo") triggerArrowHighlight(13.920196, 122.097666, "Novo Department Store 🛍️🏢", "Department Store & Shopping, Maharlika Highway, Gumaca", 20, "novo");
                            else if (val === "market") triggerArrowHighlight(13.920509, 122.101597, "Gumaca Public Market 🛒🐟", "Public Market & Commercial Hub, Poblacion", 20, "market");
                            else if (val === "puregold") triggerArrowHighlight(13.921103, 122.105650, "Puregold Gumaca 🟡🛒", "Puregold Supermarket, Maharlika Highway / San Diego", 20, "puregold");
                            else if (val === "jeep_terminal") triggerArrowHighlight(13.919680, 122.100656, "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", "Jeepney Terminal for Macalelon, Unisan & Lopez", 20, "jeep-terminal");
                            else if (val === "jeep_terminal_lopez") triggerArrowHighlight(13.9222, 122.1009, "Jeep Terminal (Lopez) 🚐", "Jeepney Terminal bound for Lopez, Gumaca", 20, "jeep-terminal-lopez");
                            else if (val === "heritage") triggerArrowHighlight(13.923430, 122.100694, "Heritage Site 🏛️", "Gumaca Heritage / Historical Landmark, Tabing Dagat", 20, "heritage");
                            else if (val === "eqc") triggerArrowHighlight(13.923315, 122.097557, "Eastern Quezon College (EQC) 🏛️", "College & Educational Institution, Gumaca", 20, "eqc");
                            else if (val === "gnhs") triggerArrowHighlight(13.9182, 122.0956, "Gumaca National High School (GNHS) 🏫", "Gumaca NHS, Mabini/Poblacion, Gumaca", 20, "gnhs");
                            else if (val === "rakk_prophet") triggerArrowHighlight(13.932183, 122.091994, "RAKKK Prophet Medical Center 🏥", "Hospital / Medical Center, Km. 194 Maharlika Highway, Brgy. Rosario, Gumaca", 20, "rakk-prophet");
                            else if (val === "district_hospital") triggerArrowHighlight(13.933120, 122.089487, "Gumaca District Hospital 🏥", "Gumaca District Hospital, Maharlika Highway, Brgy. Rosario, Gumaca", 20, "district-hospital");
                            else if (val === "convention_center") triggerArrowHighlight(13.9236, 122.1020, "Southern Luzon Convention Center 🏛️", "Convention & Events Center, Tabing Dagat Area, Gumaca", 20, "convention-center");
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
                          <option value="jollibee">
            Jollibee
          </option>
                          <option value="mcdonalds">
            McDonald's
          </option>
                          <option value="chowking">🥢 Chowking</option>
                          <option value="novo">📍 Novo Store</option>
                          <option value="market">🛒 Public Market</option>
                          <option value="puregold">🟡 Puregold</option>
                          <option value="jeep_terminal"> Jeep Terminal</option>
                          <option value="jeep_terminal_lopez"> Jeep Terminal (Lopez)</option>
                          <option value="heritage"> Heritage Site</option>
                          <option value="eqc"> EQC</option>
                          <option value="gnhs"> GNHS</option>
                          <option value="rakk_prophet"> RAKKK Prophet Medical</option>
                          <option value="district_hospital"> District Hospital</option>
                          <option value="convention_center"> Convention Center</option>
                          <option value="whole_gumaca">📍 Buong Gumaca</option>
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
                <span>{isLocatingUser ? "Naghahanap..." : "GPS"}</span>
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
                {/* Coordinates — prominent and copyable */}
                <div className="bg-amber-950/60 border border-amber-700/60 px-2 py-1.5 rounded-lg flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-amber-300 text-[10px] sm:text-xs tracking-wide select-all">
                    {clickedStreet.lat}, {clickedStreet.lng}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${clickedStreet.lat}, ${clickedStreet.lng}`);
                      setCopySuccessMsg("📋 Coordinates copied!");
                      setTimeout(() => setCopySuccessMsg(""), 2500);
                    }}
                    className="shrink-0 bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                    title="Copy coordinates"
                  >
                    {copySuccessMsg === "📋 Coordinates copied!" ? "✓" : "Copy"}
                  </button>
                </div>
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
                    <span>{showSchoolsOnMap ? " Pins: ON" : "🙈 Pins: OFF"}</span>
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
                  <span> Edit & Drag School Pin</span>
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
                          🎓 {sch.shortName || sch.name} {sch.isCustom ? " (Custom)" : ""}
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
                          📍 Zoom
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
                        setEntranceSaveToast("⚠ Mangyaring maglagay ng Pangalan ng Paaralan.");
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
                      <span className="truncate">🎓 {nearestSchool.shortName || nearestSchool.name.replace(/ [🎓]/g, '')}</span>
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
