import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, Calendar, ShieldCheck, Facebook, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

interface LandlordUser {
  name: string;
  username: string;
  role: string;
  avatar?: string;
  gender?: string;
  mobile?: string;
  email?: string;
  facebook?: string;
  address?: string;
  bio?: string;
  school?: string;
  businessName?: string;
  yearsOperation?: string;
  permitNo?: string;
  permitFile?: string;
  permitStatus?: string;
  accountStatus?: "pending" | "approved" | "rejected";
}

interface Props {
  user: LandlordUser;
  onClose: () => void;
  onApprove: (username: string) => void;
  onReject: (username: string) => void;
}

export default function LandlordAdminProfileModal({ user, onClose, onApprove, onReject }: Props) {
  const status = user.accountStatus || "pending";
  const businessName = user.businessName || user.school || "";
  const barangay = user.address || "";

  const statusColor = {
    approved: "bg-emerald-50 border-emerald-200 text-emerald-700",
    rejected: "bg-red-50 border-red-200 text-red-700",
    pending: "bg-amber-50 border-amber-200 text-amber-700",
  }[status];

  const statusLabel = {
    approved: "✅ Approved",
    rejected: "❌ Rejected",
    pending: "⏳ Pending Review",
  }[status];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-stone-900 via-indigo-950 to-blue-950 p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-10">
              <X className="h-4 w-4 text-white" />
            </button>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-lg shrink-0 bg-white/10 flex items-center justify-center">
                {user.avatar && (user.avatar.startsWith("data:image/") || user.avatar.startsWith("http")) ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-2xl">{user.avatar || "🏠"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-base leading-tight truncate">{user.name}</p>
                <p className="text-xs text-white/60 font-mono">@{user.username}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {user.gender && <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-semibold">{user.gender}</span>}
                  <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-semibold">🏠 Landlord</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColor}`}>{statusLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">

            {/* Contact Info */}
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Contact Information</p>
              <div className="space-y-1.5">
                {user.mobile && (
                  <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-200">
                    <Phone className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono">{user.mobile}</span>
                  </div>
                )}
                {user.email && (
                  <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-200">
                    <span className="text-[13px] shrink-0">✉️</span>
                    <span className="font-mono truncate">{user.email}</span>
                  </div>
                )}
                {user.facebook && (
                  <div className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-200">
                    <Facebook className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <a href={user.facebook} target="_blank" rel="noopener noreferrer"
                      className="truncate text-blue-600 hover:underline">{user.facebook}</a>
                  </div>
                )}
                {!user.mobile && !user.email && !user.facebook && (
                  <p className="text-[10px] text-stone-400 italic">No contact info provided.</p>
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="border border-blue-100 dark:border-blue-900/50 rounded-2xl overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-950/40 px-3 py-2 flex items-center gap-1.5">
                <span className="text-xs">🏢</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Business / Property Info</span>
              </div>
              <div className="p-3 space-y-2">
                {businessName && (
                  <div className="flex items-start gap-2">
                    <span className="text-[13px] mt-0.5 shrink-0">🏠</span>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-bold">Property / Business Name</p>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{businessName}</p>
                    </div>
                  </div>
                )}
                {barangay && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-bold">Barangay / Address</p>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{barangay}</p>
                    </div>
                  </div>
                )}
                {user.yearsOperation && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-bold">Operating Since</p>
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-200">{user.yearsOperation}</p>
                    </div>
                  </div>
                )}
                {!businessName && !barangay && !user.yearsOperation && (
                  <p className="text-[10px] text-stone-400 italic">No business info provided yet.</p>
                )}
              </div>
            </div>

            {/* Permit Info */}
            <div className="border border-amber-100 dark:border-amber-900/50 rounded-2xl overflow-hidden">
              <div className="bg-amber-50 dark:bg-amber-950/40 px-3 py-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Permit & Verification</span>
              </div>
              <div className="p-3 space-y-2">
                {user.permitNo ? (
                  <div className="flex items-start gap-2">
                    <FileText className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-bold">Mayor's Permit No.</p>
                      <p className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-200">{user.permitNo}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-400 italic">No permit number submitted yet.</p>
                )}
                {user.permitStatus && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">{user.permitStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400">About</p>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/80">
            {status === "pending" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { onApprove(user.username); onClose(); }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve Account
                </button>
                <button
                  type="button"
                  onClick={() => { onReject(user.username); onClose(); }}
                  className="flex-1 py-2.5 bg-white dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 border border-red-200 dark:border-red-800 rounded-xl text-xs font-extrabold active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            ) : status === "approved" ? (
              <div className="flex gap-2">
                <div className="flex-1 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Account Approved
                </div>
                <button
                  type="button"
                  onClick={() => { onReject(user.username); onClose(); }}
                  className="px-4 py-2.5 bg-white dark:bg-stone-800 hover:bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { onApprove(user.username); onClose(); }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" /> Re-approve
                </button>
                <div className="flex-1 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-600 dark:text-red-300 flex items-center justify-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Rejected
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
