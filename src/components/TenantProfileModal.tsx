import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, GraduationCap, Calendar, Users, Clock } from "lucide-react";

interface TenantUser {
  name: string;
  username: string;
  role: string;
  avatar?: string;
  age?: string;
  gender?: string;
  occupation?: string;
  school?: string;
  address?: string;
  bio?: string;
  prefLocation?: string;
  prefType?: string;
  budgetMin?: string;
  budgetMax?: string;
  occupants?: string;
  moveIn?: string;
  stayDuration?: string;
  pets?: string;
  smoking?: string;
}

interface Props {
  user: TenantUser;
  onClose: () => void;
}

export default function TenantProfileModal({ user, onClose }: Props) {
  const hasPrefs = user.prefLocation || user.prefType || user.budgetMin || user.budgetMax ||
    user.occupants || user.moveIn || user.stayDuration || user.pets || user.smoking;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer z-10">
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-3 ring-white/30 shadow-lg shrink-0 bg-white/20 flex items-center justify-center">
                {user.avatar && (user.avatar.startsWith("data:image/") || user.avatar.startsWith("http")) ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl">{user.avatar || "🎓"}</span>
                )}
              </div>
              <div>
                <p className="font-black text-base leading-tight">{user.name}</p>
                <p className="text-xs text-white/70 font-mono">@{user.username}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {user.age && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">Age {user.age}</span>}
                  {user.gender && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">{user.gender}</span>}
                  {user.occupation && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">{user.occupation}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
            {/* About */}
            {(user.school || user.bio) && (
              <div className="space-y-1.5">
                {user.school && (
                  <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium">{user.school}</span>
                  </div>
                )}
                {user.bio && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed pl-5">{user.bio}</p>
                )}
              </div>
            )}

            {/* Rental Preferences */}
            {hasPrefs ? (
              <div className="border border-indigo-100 dark:border-indigo-900/50 rounded-2xl overflow-hidden">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 flex items-center gap-1.5">
                  <span className="text-xs">🏠</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Rental Preferences</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2">
                  {user.prefLocation && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold">Location</p>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{user.prefLocation}</p>
                      </div>
                    </div>
                  )}
                  {user.prefType && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-[11px] mt-0.5">🏢</span>
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold">Property</p>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{user.prefType}</p>
                      </div>
                    </div>
                  )}
                  {(user.budgetMin || user.budgetMax) && (
                    <div className="flex items-start gap-1.5">
                      <span className="text-[11px] mt-0.5">💰</span>
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold">Budget</p>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                          ₱{user.budgetMin || "?"} – ₱{user.budgetMax || "?"}
                        </p>
                      </div>
                    </div>
                  )}
                  {user.occupants && (
                    <div className="flex items-start gap-1.5">
                      <Users className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold">Occupants</p>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{user.occupants}</p>
                      </div>
                    </div>
                  )}
                  {user.moveIn && (
                    <div className="flex items-start gap-1.5">
                      <Calendar className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold">Move-in</p>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{user.moveIn}</p>
                      </div>
                    </div>
                  )}
                  {user.stayDuration && (
                    <div className="flex items-start gap-1.5">
                      <Clock className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] text-stone-400 uppercase font-bold">Stay</p>
                        <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{user.stayDuration}</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Lifestyle */}
                {(user.pets || user.smoking) && (
                  <div className="border-t border-indigo-100 dark:border-indigo-900/50 px-3 py-2 flex items-center gap-3">
                    {user.pets && (
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${user.pets === "yes" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-stone-50 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700"}`}>
                        🐾 Pets: {user.pets}
                      </span>
                    )}
                    {user.smoking && (
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${user.smoking === "yes" ? "bg-red-50 text-red-700 border border-red-200" : "bg-stone-50 dark:bg-stone-800 text-stone-500 border border-stone-200 dark:border-stone-700"}`}>
                        🚬 Smoking: {user.smoking}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-stone-400">
                No rental preferences set yet.
              </div>
            )}

            {/* Privacy note */}
            <p className="text-[9px] text-stone-400 dark:text-stone-600 text-center pt-1">
              🔒 Contact info and address are private — only preferences are shown.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
