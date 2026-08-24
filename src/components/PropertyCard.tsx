import { Property } from "../data/properties";
import { AiMatch } from "../types";
import { motion } from "motion/react";
import { MapPin, BedDouble, Bath, Star, UserCheck, Edit3, ShieldCheck, GraduationCap, Map } from "lucide-react";
import { getSchoolDistancesForProperty } from "../utils/schoolDistances";
import { getTranslation, Language } from "../utils/translations";

interface PropertyCardProps {
  property: Property;
  aiMatch?: AiMatch;
  onSelect: () => void;
  onEdit?: (property: Property) => void;
  onApprove?: (property: Property) => void;
  onReject?: (property: Property) => void;
  onViewLandlordProfile?: (property: Property) => void;
  onViewOnMap?: (property: Property, schoolId?: string) => void;
  currentUserRole?: "student" | "landlord" | "admin" | null;
  language?: Language;
  key?: string;
}

export default function PropertyCard({
  property,
  aiMatch,
  onSelect,
  onEdit,
  onApprove,
  onReject,
  onViewLandlordProfile,
  onViewOnMap,
  currentUserRole,
  language = "tagalog"
}: PropertyCardProps) {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Nearest school distance calculation
  const schoolDistances = getSchoolDistancesForProperty(
    property.coordinates,
    property.neighborhood
  );
  const nearestSchool = schoolDistances[0];

  // Calculate student reviews rating
  const reviews = property.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // Determine score color/badge
  const getScoreBadgeStyles = (score: number) => {
    if (score >= 90) return "bg-amber-500/10 text-amber-600 border-amber-500/30 ring-4 ring-amber-500/5";
    if (score >= 70) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    return "bg-stone-100 text-stone-600 border-stone-200";
  };

  return (
    <div
      id={`property-card-${property.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:bg-stone-900 transition-all duration-300 hover:-translate-y-2 hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/15 dark:hover:border-pink-600 dark:hover:shadow-pink-600/10 cursor-pointer"
      onClick={onSelect}
    >
      {/* Property Image & Overlays */}
      <div className="relative aspect-video overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={property.image}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

        {/* Property Type, Gender Policy, and Approval Status Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-2 items-center max-w-[85%]">
          {property.approvalStatus === "pending" && (
            <span className="rounded-full bg-amber-500 text-stone-950 font-black px-3 py-1.5 text-[9px] sm:text-[10px] shadow-lg animate-pulse border border-amber-300">
              ⏳ Pending
            </span>
          )}
          {property.approvalStatus === "rejected" && (
            <span className="rounded-full bg-red-600/90 text-white font-bold px-3 py-1.5 text-[9px] sm:text-[10px] shadow-lg border border-red-400">
              ❌ Rejected
            </span>
          )}
          <span className="rounded-full bg-stone-900/90 backdrop-blur-md px-3 py-1.5 text-[9px] sm:text-[10px] font-bold text-white shadow-lg border border-white/30">
            {property.type}
          </span>
          {property.genderPolicy === "Girls Only" && (
            <span className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold px-2.5 py-1 text-[9px] sm:text-[10px] shadow-xs">
              👧 {language === "tagalog" ? "Pang-babe" : "Girls Only"}
            </span>
          )}
          {property.genderPolicy === "Boys Only" && (
            <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-2.5 py-1 text-[9px] sm:text-[10px] shadow-xs">
              👦 {language === "tagalog" ? "Pang-lalaki" : "Boys Only"}
            </span>
          )}
          {property.genderPolicy === "Both" && (
            <span className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 text-white font-bold px-2.5 py-1 text-[9px] sm:text-[10px] shadow-xs">
              🚻 Co-ed
            </span>
          )}
        </div>

        {/* AI Match Score Badge */}
        {aiMatch && (
          <div className={`absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] sm:text-xs font-bold backdrop-blur-md shadow-lg transition-all duration-300 ${getScoreBadgeStyles(aiMatch.score)}`}>
            <span className="text-xs">⭐</span>
            <span>{aiMatch.score}%</span>
          </div>
        )}

        {/* Location Tag Bottom-Left overlay */}
        <div className="absolute bottom-2 left-2.5 sm:bottom-3 sm:left-3 flex items-center gap-1 text-white max-w-[90%] truncate">
          <MapPin className="h-3.5 w-3.5 text-pink-400 shrink-0 drop-shadow-xs" />
          <span className="text-[10px] sm:text-xs font-semibold text-white shadow-xs drop-shadow-md truncate">
            {property.neighborhood}, {property.city}
          </span>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-col">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 dark:from-pink-400 dark:to-indigo-400">
              {formatPrice(property.price)}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-stone-400 mt-0.5">{t("perMonth")}</span>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 text-[10px] sm:text-xs font-bold text-amber-800 dark:text-amber-300 shrink-0 shadow-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
            <span>{avgRating ? avgRating : "New"}</span>
            {reviews.length > 0 && (
              <span className="text-[9px] text-amber-600/70 dark:text-amber-400/70 font-normal">({reviews.length})</span>
            )}
          </div>
        </div>

        <h3 className="mb-2 sm:mb-3 font-display text-base sm:text-lg font-bold leading-snug text-stone-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2">
          {property.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-stone-600 dark:text-stone-400 font-normal">
          {property.description}
        </p>

        {/* School Distance Badge */}
        {nearestSchool && (
          <div
            onClick={(e) => {
              if (onViewOnMap) {
                e.stopPropagation();
                onViewOnMap(property, nearestSchool.id);
              }
            }}
            className="mb-4 bg-gradient-to-r from-pink-50/95 via-indigo-50/60 to-blue-50/95 dark:from-pink-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 hover:from-pink-100 hover:to-indigo-100 dark:hover:from-pink-900/50 dark:hover:to-indigo-900/50 border border-pink-200/80 dark:border-pink-800/50 rounded-lg p-3 flex items-center justify-between text-xs text-stone-800 dark:text-stone-200 font-medium transition-all cursor-pointer group/school gap-2 shadow-sm"
            title="I-click para makita ang linya papuntang paaralan sa mapa"
          >
            <div className="flex items-center gap-2 truncate">
              <GraduationCap className="h-4 w-4 text-pink-600 dark:text-pink-400 shrink-0" />
              <span className="truncate text-[10px] sm:text-xs">
                <strong>{nearestSchool.distanceKm.toFixed(1)}km</strong> • {nearestSchool.shortName || nearestSchool.name.replace(/ [🎓🏫🏛️]/g, '')}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-pink-500 to-indigo-600 group-hover/school:from-pink-600 group-hover/school:to-indigo-700 text-white font-bold px-2.5 py-1 rounded-lg shrink-0 shadow-md">
              {nearestSchool.walkingMinutes}min
            </span>
          </div>
        )}

        {/* Features Row */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {property.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-gradient-to-r from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-700 px-2.5 py-1 text-[10px] font-medium text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/80 truncate max-w-[130px] shadow-sm hover:shadow-md transition-shadow"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spacer & Specs */}
        <div className="mt-auto pt-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-stone-600 dark:text-stone-400 gap-2">
          {/* Specs */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <BedDouble className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <strong className="text-stone-800 dark:text-stone-200">{property.beds}</strong> <span className="text-stone-500 dark:text-stone-400 hidden sm:inline text-[10px]">bed</span>
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
              <Bath className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <strong className="text-stone-800 dark:text-stone-200">{property.baths}</strong> <span className="text-stone-500 dark:text-stone-400 hidden sm:inline text-[10px]">bath</span>
            </span>
          </div>

          {/* Edit Button for Landlords */}
          {currentUserRole === "landlord" && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(property);
              }}
              className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Landlord Profile Bar */}
        <div className="mt-4 pt-3.5 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs gap-2">
          <div
            className={`flex items-center gap-2 min-w-0 ${onViewLandlordProfile ? "cursor-pointer group/owner hover:opacity-80 transition-opacity" : ""}`}
            onClick={(e) => {
              if (onViewLandlordProfile) {
                e.stopPropagation();
                onViewLandlordProfile(property);
              }
            }}
          >
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden shrink-0 border-2 border-stone-300 dark:border-stone-600 shadow-sm">
              {property.landlordAvatar ? (
                <img
                  src={property.landlordAvatar}
                  alt={property.landlordName || "Landlord"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold flex items-center justify-center text-xs">
                  {(property.landlordName || "L").charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-stone-800 dark:text-stone-100 leading-tight flex items-center gap-1.5 truncate group-hover/owner:text-indigo-600 dark:group-hover/owner:text-indigo-400 transition-colors">
                <span className="truncate">{property.landlordName || "Owner"}</span>
                {property.landlordPermits?.businessPermit && (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
              </span>
              <span className="text-[9px] text-stone-500 dark:text-stone-400">Landlord</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onViewOnMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewOnMap(property);
                }}
                className="p-1.5 sm:px-3 sm:py-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:shadow-md"
                title="Tingnan ang lokasyon sa interactive map"
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            )}

            {onViewLandlordProfile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLandlordProfile(property);
                }}
                className="p-1.5 sm:px-3 sm:py-1.5 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Info</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Action Bar */}
        {currentUserRole === "admin" && (
          <div className="mt-3 pt-2.5 border-t border-amber-200 dark:border-stone-800 bg-amber-50/80 dark:bg-stone-800/90 -mx-3.5 -mb-3.5 p-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Admin Action:
            </span>
            <div className="flex items-center gap-1.5">
              {property.approvalStatus !== "approved" && onApprove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(property);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Approve ✅</span>
                </button>
              )}
              {property.approvalStatus !== "rejected" && onReject && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(property);
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Reject ❌</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendation Context Footer */}
      {aiMatch && aiMatch.reason && (
        <div id={`property-match-reason-${property.id}`} className="bg-amber-500/5 dark:bg-amber-950/20 border-t border-amber-500/10 dark:border-amber-900/30 px-5 py-3 text-xs text-amber-800 dark:text-amber-300 flex gap-2 items-start">
          <p className="italic leading-relaxed">
            {aiMatch.reason}
          </p>
        </div>
      )}
    </div>
  );
}
