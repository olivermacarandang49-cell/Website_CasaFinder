import React, { useState } from "react";
import { motion } from "motion/react";
import { X, KeyRound, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Language } from "../utils/translations";

interface ForgotPasswordModalProps {
  registeredUsers: {
    name: string;
    username: string;
    role: "student" | "landlord";
    password: string;
    email: string;
    mobile: string;
  }[];
  onUpdatePassword: (username: string, newPass: string) => void;
  onClose: () => void;
  language?: Language;
}

export default function ForgotPasswordModal({
  registeredUsers,
  onUpdatePassword,
  onClose,
  language = "english",
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"search" | "verify" | "reset" | "success">("search");
  const [identifier, setIdentifier] = useState("");
  const [foundUser, setFoundUser] = useState<typeof registeredUsers[0] | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isTagalog = language === "tagalog";

  // Step 1: Find Account
  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const query = identifier.trim().toLowerCase();
    if (!query) {
      setErrorMsg(isTagalog ? "Pakilagay ang iyong Username o Email Address." : "Please enter your Username or Email Address.");
      return;
    }

    const user = registeredUsers.find(
      (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );

    if (!user) {
      setErrorMsg(isTagalog ? "Walang nahanap na account para sa detalye na iyon." : "No account found with that Username or Email.");
      return;
    }

    setFoundUser(user);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setStep("verify");
  };

  // Step 2: Verify Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (enteredCode.trim() !== verificationCode) {
      setErrorMsg(isTagalog ? "Maling verification code! Pakisuri ang code." : "Invalid verification code! Please use the code shown above.");
      return;
    }
    setStep("reset");
  };

  // Step 3: Set New Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newPassword.trim()) {
      setErrorMsg(isTagalog ? "Pakilagay ang iyong bagong password." : "Please enter your new password.");
      return;
    }
    if (newPassword.length < 3) {
      setErrorMsg(isTagalog ? "Ang password ay dapat hindi bababa sa 3 characters." : "Password must be at least 3 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isTagalog ? "Hindi magkatugma ang dalawang password!" : "Passwords do not match!");
      return;
    }

    if (foundUser) {
      onUpdatePassword(foundUser.username, newPassword);
      setStep("success");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors"
      >
        {/* Header */}
        <div className="bg-stone-900 dark:bg-stone-950 p-5 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base font-display">
                {isTagalog ? "Password Recovery / Pag-reset ng Password" : "Forgot Password / Recovery"}
              </h3>
              <p className="text-[11px] text-stone-300">
                {isTagalog ? "I-recover ang iyong CasaFinder account" : "Recover your CasaFinder account"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Search Account */}
          {step === "search" && (
            <form onSubmit={handleFindAccount} className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-light">
                {isTagalog
                  ? "I-type ang iyong Username o Email upang simulan ang pag-recover ng iyong password."
                  : "Enter your Username or Registered Email to begin recovering your password."}
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {isTagalog ? "Username o Email Address:" : "Username or Email Address:"}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isTagalog ? "Halimbawa: juan.student o nena.landlord" : "Example: juan.student or nena.landlord"}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isTagalog ? "Hanapin ang Account" : "Find Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Verify Code */}
          {step === "verify" && foundUser && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-3.5 space-y-1">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  {isTagalog ? "Nahanap na Account:" : "Account Found:"} {foundUser.name} (@{foundUser.username})
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                  {isTagalog
                    ? `Uri ng account: ${foundUser.role === "landlord" ? "Landlord" : "Student"}.`
                    : `Account found as ${foundUser.role === "landlord" ? "Landlord" : "Student"}.`}
                </p>
              </div>

              {/* Demo Code Simulated SMS alert */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  {isTagalog ? "Simulated Code:" : "Simulated Recovery Code:"} <span className="font-mono text-sm bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-950 dark:text-amber-200 font-bold">{verificationCode}</span>
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  ({isTagalog ? "Ipinadala sa mobile number:" : "Sent to mobile number:"} {foundUser.mobile.slice(0, 4)}****{foundUser.mobile.slice(-2)})
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {isTagalog ? "Ipasok ang 4-digit Code:" : "Enter 4-digit Code:"}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  placeholder="0000"
                  className="w-full text-center font-mono text-lg tracking-widest bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl py-2 text-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {isTagalog ? "I-verify ang Code at Ipagpatuloy" : "Verify Code & Continue"}
              </button>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {isTagalog ? "Gumawa ng bagong password para sa iyong account." : "Create a new password for your account."}
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {isTagalog ? "Bagong Password:" : "New Password:"}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isTagalog ? "Ipasok ang bagong password" : "Enter new password"}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {isTagalog ? "Ulitin ang Bagong Password:" : "Confirm New Password:"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isTagalog ? "Ulitin ang bagong password" : "Confirm new password"}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-800 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer"
              >
                {isTagalog ? "I-save ang Bagong Password 🔑" : "Save New Password 🔑"}
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {isTagalog ? "Matagumpay na Napalitan ang Password! 🎉" : "Password Changed Successfully! 🎉"}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isTagalog ? "Maaari ka nang mag-log in gamit ang iyong bagong password." : "You can now log in using your new password."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                {isTagalog ? "Bumalik sa Log In Page" : "Back to Log In Page"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
