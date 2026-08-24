import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Target, Eye, Zap, Shield, Users, GraduationCap, Phone, Mail, Globe, Star, SlidersHorizontal, Star as StarIcon, UserCircle, Building2, BadgeCheck } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefLanguage?: string;
  userRole?: "student" | "landlord" | "admin";
}

export default function AboutModal({
  isOpen,
  onClose,
  prefLanguage = "english",
  userRole
}: AboutModalProps) {
  if (!isOpen) return null;

  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  const team = [
    { name: "Oliver D. Macarandang",      role: "Lead Developer",                   initial: "O", color: "from-violet-500 to-indigo-600", photo: "/oliver.jpg"  },
    { name: "Marinard Kaizier Cañizares", role: "Content Management Specialist",    initial: "M", color: "from-pink-500 to-rose-600",     photo: "/marinard.jpg" },
    { name: "Lorena G. Dacup",            role: "UI/UX Auditor / Reviewer",         initial: "L", color: "from-emerald-500 to-teal-600",  photo: "/lorena.jpg"  },
    { name: "Aliah E. Andal",             role: "Research & Logistics Coordinator", initial: "A", color: "from-amber-500 to-orange-600",  photo: "/aliah.jpg"   },
  ];

  const studentFeatures = [
    { icon: <Zap             className="h-4 w-4" />, color: "text-amber-400   bg-amber-400/10   border-amber-400/20",   title: "AI-Powered Matching",       desc: "Gemini AI scores every listing 0–100 based on your preferences and search criteria."            },
    { icon: <MapPin          className="h-4 w-4" />, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", title: "Interactive Map",            desc: "View property locations, school route lines, GPS position, and barangay boundaries on a live map." },
    { icon: <SlidersHorizontal className="h-4 w-4" />, color: "text-teal-400  bg-teal-400/10    border-teal-400/20",    title: "Property & Search Filters", desc: "Filter listings by barangay, price range, room type, and gender policy to narrow down results."   },
    { icon: <StarIcon        className="h-4 w-4" />, color: "text-yellow-400  bg-yellow-400/10  border-yellow-400/20",  title: "Reviews & Ratings",         desc: "Rate properties 1–5 stars, leave comments, and read feedback from fellow students."              },
    { icon: <GraduationCap   className="h-4 w-4" />, color: "text-sky-400     bg-sky-400/10     border-sky-400/20",     title: "School Distance Finder",    desc: "See walking and tricycle distances to SLSU, EQC, PIAT, GNHS, and Holy Child for every property." },
    { icon: <UserCircle      className="h-4 w-4" />, color: "text-pink-400    bg-pink-400/10    border-pink-400/20",    title: "User Account",              desc: "Manage your profile, change password, set language/theme preferences, and track active sessions."  },
    { icon: <Globe           className="h-4 w-4" />, color: "text-purple-400  bg-purple-400/10  border-purple-400/20",  title: "Bilingual Support",         desc: "Switch between English and Filipino (Tagalog) anytime from your profile settings."                },
    { icon: <Shield          className="h-4 w-4" />, color: "text-indigo-400  bg-indigo-400/10  border-indigo-400/20",  title: "Verified Listings Only",    desc: "All properties shown are LGU-approved with valid Mayor's Permit and safety document badges."       },
  ];

  const landlordFeatures = [
    { icon: <Building2       className="h-4 w-4" />, color: "text-orange-400  bg-orange-400/10  border-orange-400/20",  title: "Post Listings",             desc: "Add boarding houses or apartments with photos, 17 amenity presets, pricing, and gender policy."    },
    { icon: <MapPin          className="h-4 w-4" />, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", title: "Map Pin Placement",         desc: "Drag a pin or use GPS on the posting map to set the exact location of your property."             },
    { icon: <BadgeCheck      className="h-4 w-4" />, color: "text-lime-400    bg-lime-400/10    border-lime-400/20",    title: "Permit & Document Badges",  desc: "Verified landlords display Business Permit, Barangay Clearance, BFP Fire Safety, and DTI badges."  },
    { icon: <StarIcon        className="h-4 w-4" />, color: "text-yellow-400  bg-yellow-400/10  border-yellow-400/20",  title: "Reviews & Replies",         desc: "View student ratings on your properties and reply directly to tenant reviews."                     },
    { icon: <UserCircle      className="h-4 w-4" />, color: "text-pink-400    bg-pink-400/10    border-pink-400/20",    title: "Landlord Profile",          desc: "Manage your public profile, contact info, mayor's permit number, and bio shown to students."       },
    { icon: <Shield          className="h-4 w-4" />, color: "text-indigo-400  bg-indigo-400/10  border-indigo-400/20",  title: "Approval Workflow",         desc: "Submitted listings go through LGU admin review before appearing publicly on the platform."         },
    { icon: <Globe           className="h-4 w-4" />, color: "text-purple-400  bg-purple-400/10  border-purple-400/20",  title: "Bilingual Support",         desc: "Switch between English and Filipino (Tagalog) anytime from your profile settings."                },
    { icon: <Users           className="h-4 w-4" />, color: "text-rose-400    bg-rose-400/10    border-rose-400/20",    title: "Tenant Visibility",         desc: "Approved listings are visible to all students browsing the CasaFinder student housing directory."   },
  ];

  // Admin features are intentionally not exposed — admin accounts are secret/system-level.
  // Admin users see the same features as landlords with a neutral label.
  const features = userRole === "landlord" || userRole === "admin"
    ? landlordFeatures
    : studentFeatures;

  const schools = [
    { name: "SLSU",       full: "Southern Luzon State University"              },
    { name: "EQC",        full: "Eastern Quezon College"                       },
    { name: "PIAT",       full: "Philippine Inst. of Accountancy & Technology" },
    { name: "GNHS",       full: "Gumaca National High School"                  },
    { name: "Holy Child", full: "Holy Child College of Gumaca"                 },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full sm:max-w-2xl bg-[#0f1117] text-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden max-h-[95dvh] sm:max-h-[90vh] flex flex-col"
        >
          {/* ── Close ── */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 flex flex-col">

            {/* ── HERO ── */}
            <div className="relative flex flex-col items-center text-center px-6 pt-14 pb-8">
              {/* ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/60 to-[#0f1117] pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

              {/* Logo */}
              <div className="relative z-10 mb-5">
                <div className="h-28 w-28 rounded-3xl bg-white shadow-2xl shadow-indigo-500/40 overflow-hidden ring-4 ring-white/30 flex items-center justify-center">
                  <img
                    src="/casafinder-logo.png"
                    alt="CasaFinder Logo"
                    className="w-full h-full object-contain p-1.5"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1.5 ring-2 ring-[#0f1117]">
                  <Star className="h-3 w-3 text-white fill-white" />
                </div>
              </div>

              <div className="relative z-10 space-y-1.5">
                <h2 className="text-3xl font-extrabold tracking-tight text-white">CasaFinder</h2>
                <p className="text-indigo-300 text-sm font-semibold tracking-wide">Your Partner in Finding Your Home</p>
                <p className="text-stone-400 text-xs max-w-xs mx-auto leading-relaxed mt-2">
                  A digital housing directory and AI-assisted search platform serving students and residents of <span className="text-white font-medium">Gumaca, Quezon</span>.
                </p>
              </div>

              {/* Version pill */}
              <div className="relative z-10 mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-[11px] text-indigo-300 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Version 1.0.0 · Beta Release 2026
              </div>
            </div>

            <div className="px-5 sm:px-7 pb-8 space-y-7">

              {/* ── DIVIDER ── */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* ── MISSION & VISION ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="group relative bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-4 space-y-2 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-amber-400/10 rounded-lg">
                      <Target className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Mission</span>
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    To provide a transparent, accessible, and AI-powered housing platform that connects students and workers with safe, affordable, and verified accommodations in Gumaca, Quezon.
                  </p>
                </div>
                <div className="group relative bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4 space-y-2 hover:border-indigo-500/40 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-indigo-400/10 rounded-lg">
                      <Eye className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Vision</span>
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed">
                    To become the leading local housing technology solution in Quezon Province, empowering every student to find a home that supports their academic journey and well-being.
                  </p>
                </div>
              </div>

              {/* ── FEATURES ── */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Platform Features</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {features.map((f, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-xl p-3 border bg-white/[0.03] hover:bg-white/[0.06] transition-colors ${f.color.split(" ").slice(1).join(" ")}`}>
                      <div className={`shrink-0 mt-0.5 p-1.5 rounded-lg border ${f.color}`}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{f.title}</p>
                        <p className="text-[11px] text-stone-400 leading-relaxed mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SCHOOLS ── */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Schools Served in Gumaca</p>
                <div className="flex flex-wrap gap-2">
                  {schools.map(s => (
                    <div key={s.name} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-sky-500/30 hover:bg-sky-500/5 transition-colors">
                      <div className="p-1 bg-sky-400/10 rounded-md">
                        <GraduationCap className="h-3 w-3 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-none">{s.name}</p>
                        <p className="text-[9px] text-stone-500 leading-tight mt-0.5">{s.full}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── TEAM ── */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Development Team</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {team.map((m, i) => (
                    <div
                      key={i}
                      onClick={() => setExpandedMember(i)}
                      className="flex flex-col items-center text-center bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                    >
                      <div className="h-11 w-11 rounded-full overflow-hidden ring-2 ring-white/20 mb-2.5 shadow-lg">
                        {m.photo ? (
                          <img src={m.photo} alt={m.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-extrabold text-base`}>
                            {m.initial}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white leading-tight">{m.name}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{m.role}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MEMBER DETAIL MODAL ── */}
              <AnimatePresence>
                {expandedMember !== null && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="relative w-full max-w-xs bg-[#0f1117] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center"
                    >
                      {/* X button */}
                      <button
                        onClick={() => setExpandedMember(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Photo */}
                      <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-indigo-500/30 shadow-2xl mb-4">
                        {team[expandedMember].photo ? (
                          <img
                            src={team[expandedMember].photo!}
                            alt={team[expandedMember].name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${team[expandedMember].color} flex items-center justify-center text-white font-extrabold text-4xl`}>
                            {team[expandedMember].initial}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="text-lg font-extrabold text-white leading-tight">{team[expandedMember].name}</h3>
                      <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${team[expandedMember].color} text-white shadow`}>
                        {team[expandedMember].role}
                      </span>
                      <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
                        CasaFinder Development Team<br />Gumaca, Quezon, Philippines
                      </p>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* ── CONTACT & LEGAL ── */}
              <div className="space-y-4 pt-1 border-t border-white/10">
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4">
                  {[
                    { icon: <Mail className="h-3.5 w-3.5" />,  label: "support@casafinder.com"     },
                    { icon: <Phone className="h-3.5 w-3.5" />, label: "042-311-0000"               },
                    { icon: <MapPin className="h-3.5 w-3.5" />,label: "Gumaca, Quezon, Philippines"},
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-400">
                      <span className="text-stone-500">{c.icon}</span>
                      {c.label}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-stone-600 leading-relaxed">
                  © 2026 CasaFinder. All rights reserved. Information is based on publicly available data and user-submitted listings. CasaFinder does not guarantee listing accuracy. Please verify all details directly with landlords. All transactions are solely between tenant and landlord.
                </p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
