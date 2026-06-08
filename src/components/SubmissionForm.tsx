import React, { useState } from "react";
import { Plus, Sparkles, Check, ChevronRight, RefreshCw, AlertCircle, Info } from "lucide-react";
import { Signature } from "../types";

interface SubmissionFormProps {
  onSuccess: (newEntry: Signature) => void;
}

const BG_COLOR_THEMES = [
  { id: "amber", class: "bg-amber-50 text-amber-900 border-amber-200", label: "Pioneer Gold", dot: "bg-amber-400" },
  { id: "emerald", class: "bg-emerald-50 text-emerald-900 border-emerald-200", label: "Academic Green", dot: "bg-emerald-400" },
  { id: "sky", class: "bg-sky-50 text-sky-900 border-sky-200", label: "Trust Blue", dot: "bg-sky-400" },
  { id: "purple", class: "bg-purple-50 text-purple-900 border-purple-200", label: "Nostalgic Violet", dot: "bg-purple-400" },
  { id: "rose", class: "bg-rose-50 text-rose-900 border-rose-200", label: "Rose Petal", dot: "bg-rose-400" },
  { id: "yellow", class: "bg-yellow-50 text-yellow-900 border-yellow-200", label: "Sunshine Joy", dot: "bg-yellow-300" },
  { id: "stone", class: "bg-stone-50 text-stone-900 border-stone-200", label: "Classic Parchment", dot: "bg-stone-400" },
  { id: "orange", class: "bg-orange-50 text-orange-900 border-orange-200", label: "Autumn Sunset", dot: "bg-orange-400" }
];

const FONTS_STYLING = [
  { id: "font-handwritten", label: "Handwritten", sample: "Sign of the Era" },
  { id: "font-sans", label: "Clean UI Sans", sample: "Modern Classic" },
  { id: "font-display", label: "Bold Display", sample: "Legacy Impact" }
];

const POPULAR_COUNTRIES = [
  "Nigeria", "United Kingdom", "United States", "Canada", "Saudi Arabia", 
  "Germany", "South Africa", "United Arab Emirates", "Ghana", "Malaysia", "Other"
];

const GRADUATION_SETS = [
  "Class of 2009", "Class of 2010", "Class of 2011", "Class of 2012", 
  "Class of 2013", "Class of 2014", "Class of 2015", "Class of 2016", 
  "Class of 2017", "Class of 2018", "Class of 2019", "Class of 2020", 
  "Class of 2021", "Class of 2022", "Class of 2023", "Class of 2024", 
  "Class of 2025", "Class of 2026", "Current Student", "Staff / Faculty", "Friend of FUO"
];

export default function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const [name, setName] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [selectedFontStyle, setSelectedFontStyle] = useState("font-handwritten");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);

  const charCount = message.length;
  const isMessageTooLong = charCount > 120;

  // Live validation checklist
  const isFormValid = name.trim() !== "" && graduationYear !== "" && message.trim() !== "" && !isMessageTooLong;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          graduation_year: graduationYear,
          department_optional: department.trim(),
          message: message.trim(),
          country_optional: country,
          bgColor: BG_COLOR_THEMES[selectedBgIndex].class.split(" ")[0], // get bg class e.g bg-amber-50
          fontStyle: selectedFontStyle
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred while posting your signature.");
      }

      setSuccessState(true);
      onSuccess(data.entry);

      // Reset form variables
      setName("");
      setGraduationYear("");
      setDepartment("");
      setMessage("");
      setCountry("Nigeria");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setSuccessState(false);
    setErrorMsg(null);
  };

  if (successState) {
    return (
      <div className="bg-[#FCFAF7] border border-primary-green/20 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto dynamic-card-entrance">
        <div className="w-16 h-16 bg-primary-green/10 border border-primary-green text-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-primary-green mb-3">
          Your signature is now part of the FUO story.
        </h3>
        <p className="text-sm text-stone-600 max-w-sm mx-auto mb-8">
          Thank you for leaving your mark! Your digital yearbook autograph has been posted onto the live commemorative anniversary wall.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleResetForm}
            className="px-6 py-2.5 bg-primary-green hover:bg-[#1B4332] text-white font-serif font-semibold rounded-sm transition duration-150 shadow-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Sign Another Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-sm p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6" id="form-header">
        <div className="p-1.5 bg-primary-green/10 border border-primary-green/20 text-primary-green rounded-full">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-primary-green text-lg flex items-center gap-1.5">
            Leave Your Signature
            <Sparkles className="w-4 h-4 text-accent-gold inline fill-accent-gold" />
          </h3>
          <p className="text-stone-500 text-xs">Signing the guestbook preserves your memory inside our time capsule.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 mb-5 rounded-md text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="submission-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Display Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-serif uppercase tracking-wider text-stone-600 font-bold">
              Preferred Name <span className="text-primary-green">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={50}
              placeholder="e.g. Aisha Ibrahim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-1 focus:ring-primary-green rounded-sm px-3.5 py-2.5 text-xs text-stone-850 outline-none transition"
            />
          </div>

          {/* Set / Graduation Year Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-serif uppercase tracking-wider text-stone-600 font-bold">
              Graduation Set <span className="text-primary-green">*</span>
            </label>
            <select
              required
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-1 focus:ring-primary-green rounded-sm px-3.5 py-2.5 text-xs text-stone-750 outline-none transition cursor-pointer"
            >
              <option value="" disabled>Select your Set / Role</option>
              {GRADUATION_SETS.map((set) => (
                <option key={set} value={set} className="bg-white text-stone-800">
                  {set}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Department */}
          <div className="space-y-1.5">
            <label className="block text-xs font-serif uppercase tracking-wider text-stone-600 font-bold">
              Department / Faculty <span className="text-stone-400 text-[10px] normal-case">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={50}
              placeholder="e.g. Computer Science"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-1 focus:ring-primary-green rounded-sm px-3.5 py-2.5 text-xs text-stone-850 outline-none transition"
            />
          </div>

          {/* Country Representing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-serif uppercase tracking-wider text-stone-600 font-bold">
              Representing Country <span className="text-primary-green">*</span>
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-1 focus:ring-primary-green rounded-sm px-3.5 py-2.5 text-xs text-stone-750 outline-none transition cursor-pointer"
            >
              {POPULAR_COUNTRIES.map((cntry) => (
                <option key={cntry} value={cntry} className="bg-white text-stone-800">
                  {cntry}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message / Memory */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-serif uppercase tracking-wider text-stone-600 font-bold">
              Commemorative Message <span className="text-primary-green">*</span>
            </label>
            <span className={`text-[10px] items-center font-mono ${isMessageTooLong ? 'text-rose-600 font-bold' : 'text-stone-400'}`}>
              {charCount} / 120 chars
            </span>
          </div>
          <textarea
            required
            maxLength={130} // slight buffer, validation catches if strictly above 120
            rows={3}
            placeholder="Write your FUO memory or congratulations. (e.g., 'Found lifelong purpose, friendships, and values in Osogbo. Proud to representing Class of 2016!')"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-1 focus:ring-primary-green rounded-sm px-3.5 py-2.5 text-xs text-stone-850 outline-none transition resize-none leading-relaxed"
          />
        </div>

        {/* Note Customization parameters */}
        <div className="space-y-4 pt-3 border-t border-stone-150">
          <h4 className="text-xs font-serif uppercase tracking-wider text-primary-green font-bold flex items-center gap-1.5">
            Customize Autograph Card
          </h4>

          {/* Color choice */}
          <div className="space-y-1.5">
            <span className="block text-[11px] text-stone-500 font-sans">Choice of Paper Shade</span>
            <div className="flex flex-wrap gap-2">
              {BG_COLOR_THEMES.map((theme, i) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setSelectedBgIndex(i)}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    selectedBgIndex === i 
                      ? "ring-2 ring-primary-green border-white scale-110 shadow-sm" 
                      : "border-stone-300 hover:scale-[1.05]"
                  } ${theme.class.split(" ")[0]}`}
                  title={theme.label}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Font choice */}
          <div className="space-y-1.5">
            <span className="block text-[11px] text-stone-500 font-sans">Write Font Style Accent</span>
            <div className="grid grid-cols-3 gap-2">
              {FONTS_STYLING.map((fnt) => (
                <button
                  type="button"
                  key={fnt.id}
                  onClick={() => setSelectedFontStyle(fnt.id)}
                  className={`border rounded-sm p-2.5 text-left transition-all ${
                    selectedFontStyle === fnt.id 
                      ? "bg-stone-50 border-primary-green ring-1 ring-primary-green" 
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <span className="block text-[10px] text-stone-500 font-mono font-bold tracking-tight uppercase">{fnt.label}</span>
                  <span className={`block text-xs mt-1 truncate ${fnt.id} text-primary-green font-semibold`}>{fnt.sample}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="pt-3 flex flex-col items-center sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full sm:w-auto px-7 py-3.5 font-serif font-bold text-xs rounded-sm shadow transition duration-200 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer ${
              loading || !isFormValid
                ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                : "bg-primary-green hover:bg-[#1B4332] text-white font-bold"
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                Publish My Signature <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
          
          <div className="flex items-center gap-1.5 text-[10px] text-stone-450" id="submission-disclaimer">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Contributions are moderated for academic spam and duplication.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
