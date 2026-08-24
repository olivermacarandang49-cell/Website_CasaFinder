import { useState } from "react";
import { Users, Zap, Droplet, Wifi } from "lucide-react";
import { Language } from "../utils/translations";

interface BudgetSplitterProps {
  language?: Language;
}

export default function BudgetSplitter({ language = "english" }: BudgetSplitterProps) {
  const [rent, setRent] = useState<number>(3000);
  const [roommates, setRoommates] = useState<number>(3);
  
  // Utilities
  const [includeElectricity, setIncludeElectricity] = useState(true);
  const [elecCost, setElecCost] = useState<number>(900);
  
  const [includeWater, setIncludeWater] = useState(true);
  const [waterCost, setWaterCost] = useState<number>(300);
  
  const [includeWifi, setIncludeWifi] = useState(true);
  const [wifiCost, setWifiCost] = useState<number>(1000);

  // Math
  const totalRent = rent;
  const totalUtilities = 
    (includeElectricity ? elecCost : 0) + 
    (includeWater ? waterCost : 0) + 
    (includeWifi ? wifiCost : 0);
  
  const overallTotal = totalRent + totalUtilities;
  const sharePerPerson = Math.round(overallTotal / roommates);
  const isTagalog = language === "tagalog";

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-pink-100 dark:border-stone-800 p-5 shadow-sm shadow-pink-500/5 dark:shadow-none flex flex-col space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-gradient-to-tr from-pink-500 to-blue-600 text-white rounded-lg shadow-2xs">
            <Users className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-semibold text-stone-800 dark:text-stone-100">
            {isTagalog ? "Kuwenta ng Hatian sa Badyet 📊" : "Student Cost Splitter 📊"}
          </h3>
        </div>
        <span className="text-[10px] bg-gradient-to-r from-pink-50 to-blue-50 dark:from-stone-800 dark:to-stone-800 text-pink-700 dark:text-pink-300 font-bold font-mono px-2 py-0.5 rounded-full border border-pink-200/80 dark:border-stone-700">
          {isTagalog ? "Kalkulator ng Hatian" : "Co-living Estimator"}
        </span>
      </div>

      <p className="text-stone-500 dark:text-stone-400 text-[11px] font-light leading-relaxed">
        {isTagalog
          ? "Mag-o-dorm kasama ang mga kaklase? Mabilis na kalkulahin ang hatian bawat tao kabilang ang kuryente, tubig, at internet."
          : "Planning to share with schoolmates? Calculate your individual monthly share including common utility bills."}
      </p>

      <div className="space-y-3 pt-1">
        {/* Base Rent Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-stone-600 dark:text-stone-300 font-medium">
              {isTagalog ? "Buwanang Upa (Rent)" : "Monthly Rent"}
            </span>
            <span className="font-bold text-pink-600 dark:text-pink-400">₱{rent.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="15000"
            step="200"
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            className="w-full h-1.5 bg-pink-100 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-pink-600"
          />
        </div>

        {/* Roommates Button Group */}
        <div>
          <span className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-1.5">
            {isTagalog ? "Bilang ng Magkakasama sa Kwarto (kasama ka)" : "Number of Roommates (including you)"}
          </span>
          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRoommates(num)}
                className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  roommates === num
                    ? "bg-gradient-to-r from-pink-500 to-blue-600 text-white border-pink-600 shadow-xs"
                    : "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-pink-50 dark:hover:bg-stone-700 hover:text-pink-600 dark:hover:text-pink-300"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Utilities Checklist */}
        <div className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span className="block text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-1">
            {isTagalog ? "Isama ang mga Bayarin sa Kuryente / Tubig / Wi-Fi" : "Include Shared Utilities"}
          </span>
          
          {/* Electricity */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-light cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeElectricity}
                onChange={(e) => setIncludeElectricity(e.target.checked)}
                className="rounded border-pink-300 dark:border-stone-600 text-pink-600 focus:ring-pink-500 h-3.5 w-3.5"
              />
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>{isTagalog ? "Bill sa Kuryente" : "Electricity Bill"}</span>
            </label>
            {includeElectricity && (
              <input
                type="number"
                min="0"
                value={elecCost}
                onChange={(e) => setElecCost(Math.max(0, Number(e.target.value)))}
                className="w-20 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-stone-800 dark:text-stone-100"
              />
            )}
          </div>

          {/* Water */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-light cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeWater}
                onChange={(e) => setIncludeWater(e.target.checked)}
                className="rounded border-pink-300 dark:border-stone-600 text-pink-600 focus:ring-pink-500 h-3.5 w-3.5"
              />
              <Droplet className="h-3.5 w-3.5 text-blue-500" />
              <span>{isTagalog ? "Bill sa Tubig" : "Water Supply"}</span>
            </label>
            {includeWater && (
              <input
                type="number"
                min="0"
                value={waterCost}
                onChange={(e) => setWaterCost(Math.max(0, Number(e.target.value)))}
                className="w-20 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-stone-800 dark:text-stone-100"
              />
            )}
          </div>

          {/* Wi-Fi */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-light cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeWifi}
                onChange={(e) => setIncludeWifi(e.target.checked)}
                className="rounded border-pink-300 dark:border-stone-600 text-pink-600 focus:ring-pink-500 h-3.5 w-3.5"
              />
              <Wifi className="h-3.5 w-3.5 text-blue-500" />
              <span>{isTagalog ? "Bill sa Wi-Fi Internet" : "Wi-Fi Internet"}</span>
            </label>
            {includeWifi && (
              <input
                type="number"
                min="0"
                value={wifiCost}
                onChange={(e) => setWifiCost(Math.max(0, Number(e.target.value)))}
                className="w-20 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-xs text-right font-mono font-bold text-stone-800 dark:text-stone-100"
              />
            )}
          </div>
        </div>

        {/* Calculation Result Panel */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-blue-50/80 dark:from-stone-800 dark:via-stone-800 dark:to-stone-800 border border-pink-100 dark:border-stone-700 flex flex-col items-center text-center">
          <span className="text-[10px] text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wider">
            {isTagalog ? "Hatian Bawat Tao" : "Per Person Share"}
          </span>
          <span className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600 mt-1">
            ₱{sharePerPerson.toLocaleString()}
            <span className="text-xs font-sans font-light text-stone-500 dark:text-stone-400 ml-1">
              {isTagalog ? "/ buwan" : "/ mo"}
            </span>
          </span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1.5 font-light">
            {isTagalog
              ? `Kabuuan: ₱${overallTotal.toLocaleString()} • Hati sa ${roommates} tao`
              : `Total expenses: ₱${overallTotal.toLocaleString()} • Split ${roommates} ways`}
          </span>
        </div>
      </div>
    </div>
  );
}
