import React from "react";
import { Property } from "../data/properties";
import { motion } from "motion/react";
import { X, ShieldCheck, Phone, Mail, FileCheck, CheckCircle2, Home, MapPin, GraduationCap, Map, Facebook, Calendar, Building2 } from "lucide-react";
import { getSchoolDistancesForProperty } from "../utils/schoolDistances";
import { Language } from "../utils/translations";

interface LandlordProfileModalProps {
  landlordInfo: {
    username?: string;
    name?: string;
    mobile?: string;
    email?: string;
    facebook?: string;
    facebookLink?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    businessName?: string;
    yearsOperation?: string;
    permits?: {
      businessPermit?: string;
      barangayClearance?: string;
      dtiRegistration?: string;
      fireSafetyCert?: string;
      sanitaryPermit?: string;
    };
  };
  landlordProperties: Property[];
  onClose: () => void;
  onSelectProperty?: (property: Property) => void;
  onViewOnMap?: (property: Property, schoolId?: string) => void;
  language?: Language;
}

export default function LandlordProfileModal({
  landlordInfo,
  landlordProperties,
  onClose,
  onSelectProperty,
  onViewOnMap,
  language = "english",
}: LandlordProfileModalProps) {
  const name = landlordInfo.name || "Aling Nena";
  const avatar = landlordInfo.avatar || "";
  const mobile = landlordInfo.mobile || "";
  const email = landlordInfo.email || "";
  const facebook = landlordInfo.facebook || "";
  const facebookLink = landlordInfo.facebookLink || "";
  const isTagalog = language === "tagalog";

  const bio = landlordInfo.bio || "";
  const businessName = landlordInfo.businessName || "";
  const barangay = landlordInfo.address || "";
  const yearsOperation = landlordInfo.yearsOperation || "";
  
  const permits = landlordInfo.permits || {};
  const hasAnyPermit = Boolean(
    permits.businessPermit ||
    permits.barangayClearance ||
    permits.fireSafetyCert ||
    permits.dtiRegistration ||
    permits.sanitaryPermit
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-stone-900/65 backdrop-blur-md overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-md sm:max-w-xl bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[88vh] my-auto transition-colors"
      >
        {/* Header Banner */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-stone-900 p-4 sm:p-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-row items-center gap-3">
            <div className="relative shrink-0">
              {avatar && (avatar.startsWith("http") || avatar.startsWith("data:image/")) ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover border-2 border-white/80 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white text-2xl flex items-center justify-center font-bold border-2 border-white/80 shadow-md">
                  {avatar || "🏠"}
                </div>
              )}
              {hasAnyPermit && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow-md" title="LGU & BFP Verified">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="text-left space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-display tracking-tight text-white truncate">{name}</h3>
                <span className={`border text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 ${
                  hasAnyPermit
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                }`}>
                  <ShieldCheck className="h-2.5 w-2.5" />
                  {hasAnyPermit ? (isTagalog ? "Verified Landlord" : "Verified Landlord") : (isTagalog ? "Landlord / Owner" : "Landlord Owner")}
                </span>
              </div>
              <p className="text-[10px] text-indigo-200 font-mono">@{landlordInfo.username || "landlord_owner"}</p>
              {bio && <p className="text-[11px] text-stone-300 line-clamp-2 pt-0.5 font-light">{bio}</p>}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-5 space-y-4 overflow-y-auto">
          {/* Business Info */}
          {(businessName || barangay || yearsOperation || facebook) && (
            <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50 rounded-2xl p-3.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Business Information
              </p>
              <div className="space-y-1.5">
                {businessName && <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-200"><Home className="h-3.5 w-3.5 text-indigo-500 shrink-0" /><span className="font-semibold">{businessName}</span></div>}
                {barangay && <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300"><MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" /><span>{barangay}</span></div>}
                {yearsOperation && <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300"><Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" /><span>Operating since {yearsOperation}</span></div>}
              </div>
            </div>
          )}
          {/* Quick Contact Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mobile && (
            <a
              href={`tel:${mobile}`}
              className="flex items-center gap-3 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-indigo-900 dark:text-indigo-300 tracking-wider">
                  {isTagalog ? "Tawag / SMS Contact" : "Call / SMS Contact"}
                </p>
                <p className="text-xs font-mono font-bold text-indigo-950 dark:text-indigo-100">{mobile}</p>
              </div>
            </a>
            )}

            {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 rounded-2xl transition-all cursor-pointer group"
            >
              <div className="p-2.5 bg-stone-800 dark:bg-stone-700 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 tracking-wider">Email Address</p>
                <p className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 truncate max-w-[170px]">{email}</p>
              </div>
            </a>
            )}

            {!mobile && !email && !facebook && !facebookLink && (
              <p className="col-span-2 text-xs text-stone-400 italic text-center py-2">No contact info provided yet.</p>
            )}

            {(facebook || facebookLink) && (
              <div className={`flex items-center gap-3 p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl ${facebookLink ? "cursor-pointer hover:bg-blue-100/90 dark:hover:bg-blue-900/50 transition-all group" : ""} sm:col-span-2`}>
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Facebook className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-blue-900 dark:text-blue-300 tracking-wider">Facebook / Messenger</p>
                  {facebookLink ? (
                    <a href={facebookLink.startsWith("http") ? facebookLink : `https://${facebookLink}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-700 dark:text-blue-200 truncate hover:underline block">
                      {facebook || facebookLink}
                    </a>
                  ) : (
                    <p className="text-xs font-medium text-blue-950 dark:text-blue-100 truncate">{facebook}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Types of Permits & LGU Verifications Section */}
          <div className="bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {isTagalog ? "Mga Rehistrado at Legal na Permit:" : "Registered & Legal Permits:"}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasAnyPermit ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
              }`}>
                {hasAnyPermit ? "Gumaca LGU Verified" : (isTagalog ? "Wala pang Permit" : "No Permit On File")}
              </span>
            </div>

            {hasAnyPermit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Business Permit */}
                {permits.businessPermit && (
                  <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Mayor&apos;s / Business Permit</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        No: <span className="font-semibold text-stone-700 dark:text-stone-200">{permits.businessPermit}</span>
                      </p>
                      <p className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">Verified Valid & Active</p>
                    </div>
                  </div>
                )}

                {/* Barangay Clearance */}
                {permits.barangayClearance && (
                  <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Barangay Clearance</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        No: <span className="font-semibold text-stone-700 dark:text-stone-200">{permits.barangayClearance}</span>
                      </p>
                      <p className="text-[9px] text-blue-700 dark:text-blue-400 font-medium">Barangay Licensed Boarding</p>
                    </div>
                  </div>
                )}

                {/* Fire Safety Inspection Certificate (BFP) */}
                {permits.fireSafetyCert && (
                  <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Fire Safety Inspection (FSIC)</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        BFP No: <span className="font-semibold text-stone-700 dark:text-stone-200">{permits.fireSafetyCert}</span>
                      </p>
                      <p className="text-[9px] text-rose-700 dark:text-rose-400 font-medium">BFP Inspection Passed</p>
                    </div>
                  </div>
                )}

                {/* DTI Business Name Registration */}
                {permits.dtiRegistration && (
                  <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">DTI Registration Certificate</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        DTI No: <span className="font-semibold text-stone-700 dark:text-stone-200">{permits.dtiRegistration}</span>
                      </p>
                      <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">Nationally Registered Business</p>
                    </div>
                  </div>
                )}

                {/* Sanitary Permit */}
                {permits.sanitaryPermit && (
                  <div className="bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs sm:col-span-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-100">Sanitary & Health Permit</p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                        Health Office No: <span className="font-semibold text-stone-700 dark:text-stone-200">{permits.sanitaryPermit}</span>
                      </p>
                      <p className="text-[9px] text-teal-700 dark:text-teal-400 font-medium">Cleanliness & Hygiene Standard Compliant</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-stone-800 border border-dashed border-stone-200 dark:border-stone-700 rounded-xl p-3.5 text-center space-y-1">
                <FileCheck className="h-5 w-5 text-stone-300 dark:text-stone-600 mx-auto" />
                <p className="text-xs font-bold text-stone-600 dark:text-stone-300">
                  {isTagalog ? "Walang naisusumiteng Permit" : "No Business Permits Provided"}
                </p>
                <p className="text-[11px] text-stone-400 max-w-sm mx-auto font-light">
                  {isTagalog
                    ? "Hindi pa nakakapag-lagay ng Mayor's Permit o Barangay Clearance ang landlord na ito sa kanyang profile."
                    : "This landlord has not provided any Mayor's permit or Barangay clearance in their profile."}
                </p>
              </div>
            )}
          </div>

          {/* Landlord Boarding Houses & Apartments Owned */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                {isTagalog
                  ? `Mga Boarding House / Apartment ng Landlord (${landlordProperties.length}):`
                  : `Landlord's Properties (${landlordProperties.length}):`}
              </span>
            </h4>

            {landlordProperties.length === 0 ? (
              <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700 text-center text-xs text-stone-400">
                {isTagalog ? "Wala pang ipinost na ibang property ang landlord na ito." : "No properties posted yet by this landlord."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {landlordProperties.map((prop) => {
                  const nearest = getSchoolDistancesForProperty(
                    prop.coordinates,
                    prop.neighborhood
                  )[0];

                  return (
                    <div
                      key={prop.id}
                      onClick={() => {
                        if (onSelectProperty) {
                          onSelectProperty(prop);
                          onClose();
                        }
                      }}
                      className="bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="aspect-video overflow-hidden relative bg-stone-100 dark:bg-stone-800">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs text-stone-800 dark:text-stone-200 font-bold text-[9px] px-2 py-0.5 rounded-full">
                          {prop.type}
                        </span>
                        <span className="absolute bottom-2 right-2 bg-indigo-900/90 text-white font-mono font-bold text-xs px-2 py-0.5 rounded-lg shadow-xs">
                          ₱{prop.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <h5 className="font-bold text-xs text-stone-800 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {prop.title}
                        </h5>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-stone-400" />
                          {prop.neighborhood}
                        </p>

                        {nearest && (
                          <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px]">
                            <span className="text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1 truncate">
                              <GraduationCap className="h-3 w-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              {nearest.distanceKm.toFixed(2)} km {isTagalog ? "sa" : "to"} {nearest.shortName || nearest.name.replace(/ [🎓🏫🏛️]/g, '')}
                            </span>

                            {onViewOnMap && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewOnMap(prop, nearest.id);
                                  onClose();
                                }}
                                className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-md font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Map className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{isTagalog ? "Mapa" : "Map"}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-850 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5 font-medium text-[11px] text-stone-500 dark:text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {isTagalog ? "Verified Landlord Profile • CasaFinder Gumaca" : "Verified Landlord Profile • CasaFinder Gumaca"}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {landlordProperties.length} {isTagalog ? "lisensyadong post" : "active listings"}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
