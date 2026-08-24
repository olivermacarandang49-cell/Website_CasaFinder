import { useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import { Language } from "../utils/translations";

interface ChecklistItem {
  id: string;
  textEn: string;
  textTl: string;
  categoryEn: "Utilities" | "Location" | "House Rules" | "Safety";
  categoryTl: "Utility" | "Lokasyon" | "Patakaran" | "Kaseguruhan";
}

interface StudentChecklistProps {
  language?: Language;
}

export default function StudentChecklist({ language = "english" }: StudentChecklistProps) {
  const items: ChecklistItem[] = [
    {
      id: "1",
      textEn: "Test cellular signal inside the room (Smart/Globe/DITO)",
      textTl: "I-test ang signal ng cellphone sa loob ng kwarto (Smart/Globe/DITO)",
      categoryEn: "Utilities",
      categoryTl: "Utility",
    },
    {
      id: "2",
      textEn: "Check water pressure & separate utility meters",
      textTl: "Suriin ang lakas ng tubig at sariling sub-meter ng kuryente at tubig",
      categoryEn: "Utilities",
      categoryTl: "Utility",
    },
    {
      id: "3",
      textEn: "Confirm if curfew hours exist (strict vs flexible gates)",
      textTl: "Alamin kung may curfew o lock ng gate sa gabi",
      categoryEn: "House Rules",
      categoryTl: "Patakaran",
    },
    {
      id: "4",
      textEn: "Ask if classmate study-visits or group works are allowed",
      textTl: "Itanong kung pinapayagan ang classmate mag-study o mag-group work",
      categoryEn: "House Rules",
      categoryTl: "Patakaran",
    },
    {
      id: "5",
      textEn: "Measure distance/walking time to SLSU/EQC campus gates",
      textTl: "Sukatin ang distansya at lakad patungong SLSU o EQC gate",
      categoryEn: "Location",
      categoryTl: "Lokasyon",
    },
    {
      id: "6",
      textEn: "Verify proximity to tricycle line & budget eateries (carinderias)",
      textTl: "Suriin ang lapit sa sakayan ng tricycle at mga karinderya",
      categoryEn: "Location",
      categoryTl: "Lokasyon",
    },
    {
      id: "7",
      textEn: "Check gate padlocks, emergency exits & window screens",
      textTl: "Tingnan ang lock ng gate, emergency exit, at Screen ng bintana",
      categoryEn: "Safety",
      categoryTl: "Kaseguruhan",
    },
    {
      id: "8",
      textEn: "Confirm roommate limits per room and bunk-bed stability",
      textTl: "Alamin ang maximum na kasama sa kwarto at tibay ng double deck",
      categoryEn: "Safety",
      categoryTl: "Kaseguruhan",
    },
  ];

  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const progressPercentage = Math.round((checkedIds.length / items.length) * 100);
  const isTagalog = language === "tagalog";

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-pink-100 dark:border-stone-800 p-5 shadow-sm shadow-pink-500/5 dark:shadow-none flex flex-col space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-gradient-to-tr from-pink-500 to-blue-600 text-white rounded-lg shadow-2xs">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <h3 className="font-display text-sm font-semibold text-stone-800 dark:text-stone-100">
            {isTagalog ? "Student Inspection Checklist 📋" : "Student Inspection Checklist 📋"}
          </h3>
        </div>
        <span className="text-[10px] bg-gradient-to-r from-pink-50 to-blue-50 dark:from-stone-800 dark:to-stone-800 text-pink-700 dark:text-pink-300 font-mono font-bold px-2 py-0.5 rounded-full border border-pink-200/80 dark:border-stone-700">
          {progressPercentage}% {isTagalog ? "Nacheck Na" : "Checked"}
        </span>
      </div>

      <p className="text-stone-500 dark:text-stone-400 text-[11px] font-light leading-relaxed">
        {isTagalog
          ? "Huwag kalimutang suriin ang mga mahalagang detalye na ito bago kumuha ng boarding room o makipag-usap sa landlord!"
          : "Don't forget to check these critical details when inspecting boarding rooms or meeting landlords!"}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-pink-50 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden border border-pink-100 dark:border-stone-700">
        <div
          className="bg-gradient-to-r from-pink-500 to-blue-600 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="space-y-2 pt-1 max-h-[220px] overflow-y-auto">
        {items.map((item) => {
          const isChecked = checkedIds.includes(item.id);
          const itemText = isTagalog ? item.textTl : item.textEn;
          const categoryText = isTagalog ? item.categoryTl : item.categoryEn;

          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                isChecked
                  ? "bg-pink-50/40 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/40 text-stone-500 dark:text-stone-400"
                  : "bg-stone-50/70 dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/60 text-stone-800 dark:text-stone-200 hover:bg-pink-50/30 dark:hover:bg-stone-750 hover:border-pink-200 dark:hover:border-stone-600"
              }`}
            >
              <button type="button" className="shrink-0 mt-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                {isChecked ? (
                  <CheckCircle2 className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                ) : (
                  <Circle className="h-4 w-4 text-stone-300 dark:text-stone-600" />
                )}
              </button>
              <div className="flex-1">
                <p className={`leading-relaxed ${isChecked ? "line-through" : "font-light"}`}>
                  {itemText}
                </p>
                <span
                  className={`inline-block text-[9px] font-medium px-1.5 py-0.2 rounded-md mt-1 ${
                    item.categoryEn === "Utilities"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800/60"
                      : item.categoryEn === "House Rules"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                      : item.categoryEn === "Safety"
                      ? "bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border border-pink-100 dark:border-pink-800/60"
                      : "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-800/60"
                  }`}
                >
                  {categoryText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
