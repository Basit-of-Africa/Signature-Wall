import React, { useState } from "react";
import { Signature } from "../types";
import { Flag, Trash2, ShieldAlert, Sparkles, MapPin, Calendar } from "lucide-react";

interface SignatureCardProps {
  key?: React.Key | string | number;
  signature: Signature;
  isAdmin?: boolean;
  onFlag?: (id: string) => void;
  onModerate?: (id: string, newStatus: "approved" | "flagged") => void;
  onDelete?: (id: string) => void;
}

export default function SignatureCard({
  signature,
  isAdmin = false,
  onFlag,
  onModerate,
  onDelete,
}: SignatureCardProps) {
  const [reported, setReported] = useState(false);
  const [reportingLoading, setReportingLoading] = useState(false);

  const rawBg = signature.style_variant?.bgColor || "bg-stone-50";
  const rawFont = signature.style_variant?.fontStyle || "font-handwritten";
  const rotation = signature.style_variant?.rotation !== undefined 
    ? signature.style_variant.rotation 
    : (Number(signature.id) % 2 === 0 ? 1.5 : -1);

  let cardBg = "bg-white";
  let borderTopColor = "border-primary-green";
  let textThemeColor = "text-stone-800";

  if (rawBg.includes("amber") || rawBg.includes("yellow")) {
    cardBg = "bg-[#FFFBEB]";
    borderTopColor = "border-accent-gold";
    textThemeColor = "text-amber-950";
  } else if (rawBg.includes("emerald") || rawBg.includes("sky") || rawBg.includes("teal") || rawBg.includes("green")) {
    cardBg = "bg-[#F0FDF4]";
    borderTopColor = "border-primary-green-light";
    textThemeColor = "text-emerald-950";
  } else if (rawBg.includes("rose") || rawBg.includes("purple")) {
    cardBg = "bg-white";
    borderTopColor = "border-accent-gold";
    textThemeColor = "text-stone-800";
  } else {
    cardBg = "bg-white";
    borderTopColor = "border-primary-green";
    textThemeColor = "text-stone-800";
  }

  let fontClass = "font-handwritten text-lg md:text-xl";
  if (rawFont === "font-sans") {
    fontClass = "font-sans text-xs sm:text-sm text-stone-700 leading-normal";
  } else if (rawFont === "font-display" || rawFont.includes("serif") || rawFont.includes("display")) {
    fontClass = "font-serif text-sm md:text-base italic font-semibold leading-relaxed text-stone-750";
  }

  // Convert status to readable indicators for administrators
  const statusColors = {
    approved: "bg-emerald-500/10 text-emerald-800 border-emerald-500/25",
    pending: "bg-yellow-500/10 text-yellow-800 border-yellow-500/25",
    flagged: "bg-rose-500/10 text-rose-800 border-rose-500/25",
  };

  const handleReport = async () => {
    if (reported || reportingLoading) return;
    const confirmReport = window.confirm(
      "Are you sure you want to flag this signature for review? It will be reviewed by Fountain University administrators."
    );
    if (!confirmReport) return;

    setReportingLoading(true);
    try {
      const response = await fetch(`/api/signatures/${signature.id}/report`, {
        method: "POST",
      });
      if (response.ok) {
        setReported(true);
        if (onFlag) {
          onFlag(signature.id);
        }
      }
    } catch (err) {
      console.error("Error reporting signature:", err);
    } finally {
      setReportingLoading(false);
    }
  };

  const formattedDate = new Date(signature.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`relative w-full border-t-4 border-l border-r border-b border-stone-200/60 p-5 md:p-6 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] duration-200 ${cardBg} ${borderTopColor} ${textThemeColor}`}
      style={{
        transform: `rotate(${rotation || 0}deg)`,
      }}
      id={`sig-card-${signature.id}`}
    >
      {/* Decorative notebook lines or pin circle for realistic physical banner feel */}
      <div className="absolute top-3 right-4 flex gap-1 items-center">
        {signature.status === "flagged" && !isAdmin && (
          <span className="flex items-center gap-1 bg-rose-50 text-rose-800 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
            Flagged Review
          </span>
        )}
        <div className="w-2.5 h-2.5 rounded-full bg-stone-900/10 border border-stone-900/5 shadow-inner"></div>
      </div>

      <div className="flex flex-col h-full justify-between">
        <div className="space-y-3.5">
          {/* Header */}
          <div>
            <h4 className="font-serif font-bold text-sm md:text-base tracking-tight flex items-center gap-1 text-primary-green">
              {signature.name}
              {rotation < -1.5 && (
                <Sparkles className="w-3.5 h-3.5 text-accent-gold shrink-0" />
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-[10px] md:text-xs opacity-75 font-mono">
              <span className="font-bold underline tracking-wide">
                {signature.graduation_year}
              </span>
              {signature.department_optional && (
                <>
                  <span className="opacity-40">•</span>
                  <span>{signature.department_optional}</span>
                </>
              )}
            </div>
          </div>

          {/* Core Autograph Content */}
          <p
            className={`min-h-[3.5rem] select-all ${fontClass}`}
          >
            &ldquo;{signature.message}&rdquo;
          </p>
        </div>

        {/* Footer info & moderation */}
        <div className="mt-5 pt-3 border-t border-stone-200/40 flex items-center justify-between text-[10px] md:text-xs opacity-80 font-mono text-stone-500">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Calendar className="w-3 h-3 text-stone-400" />
              {formattedDate}
            </span>
            {signature.country_optional && (
              <span className="flex items-center gap-0.5 border border-stone-200 px-1.5 py-0.2 rounded bg-white/40 text-stone-600">
                <MapPin className="w-2.5 h-2.5 text-rose-500" />
                {signature.country_optional}
              </span>
            )}
          </div>

          {/* Action layout depending on role */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5" id={`admin-controls-${signature.id}`}>
              {/* Status Badge */}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-md uppercase ${
                  statusColors[signature.status]
                }`}
              >
                {signature.status}
              </span>

              {signature.status !== "approved" && (
                <button
                  onClick={() => onModerate && onModerate(signature.id, "approved")}
                  className="p-1 hover:bg-emerald-500/10 hover:text-emerald-500 rounded text-slate-800 transition border border-transparent hover:border-emerald-500/25 cursor-pointer"
                  title="Approve Signature"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}

              {signature.status !== "flagged" && (
                <button
                  onClick={() => onModerate && onModerate(signature.id, "flagged")}
                  className="p-1 hover:bg-amber-500/10 hover:text-amber-500 rounded text-slate-800 transition border border-transparent hover:border-amber-500/25 cursor-pointer"
                  title="Flag Signature"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => onDelete && onDelete(signature.id)}
                className="p-1 hover:bg-rose-500/10 hover:text-rose-500 rounded text-rose-950 transition border border-transparent hover:border-rose-500/25 cursor-pointer"
                title="Delete Signature"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleReport}
              disabled={reported}
              className={`p-1.5 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer hover:bg-slate-900/5 ${
                reported 
                  ? "text-rose-600 font-bold" 
                  : "text-slate-800/60 hover:text-rose-600"
              }`}
              title="Report inappropriate content"
            >
              {reported ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" /> Flagged
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[9px] uppercase tracking-wider font-semibold">Report</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
