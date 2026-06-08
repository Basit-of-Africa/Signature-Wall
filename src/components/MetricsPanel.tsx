import { CommunityMetrics } from "../types";
import { Award, BookOpen, Globe, Sparkles, MapPin } from "lucide-react";

interface MetricsPanelProps {
  metrics: CommunityMetrics;
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="bg-white border border-stone-150 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-serif text-lg font-bold text-primary-green flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-gold" />
          Community Milestones & Metrics
        </h3>
        <p className="text-xs text-stone-500">
          Tracking memory highlights of Fountain University&apos;s twenty-year visual archive.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="metrics-grid">
        {/* Metric 1 */}
        <div className="bg-stone-50/50 border border-stone-150 rounded-sm p-4 flex items-center gap-3.5 shadow-sm transition-transform hover:scale-[1.01]">
          <div className="p-2.5 bg-accent-gold/10 rounded-full text-accent-gold border border-accent-gold/10">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-bold font-serif text-primary-green tracking-tight">
              {metrics.totalSignatures}
            </span>
            <span className="text-[11px] text-stone-500 font-mono font-medium block uppercase tracking-wider">Signatures</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-stone-50/50 border border-stone-150 rounded-sm p-4 flex items-center gap-3.5 shadow-sm transition-transform hover:scale-[1.01]">
          <div className="p-2.5 bg-primary-green/10 rounded-full text-primary-green border border-primary-green/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-bold font-serif text-primary-green tracking-tight">
              {metrics.setsCount || 15}
            </span>
            <span className="text-[11px] text-stone-500 font-mono font-medium block uppercase tracking-wider">Sets</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-stone-50/50 border border-stone-150 rounded-sm p-4 flex items-center gap-3.5 shadow-sm transition-transform hover:scale-[1.01]">
          <div className="p-2.5 bg-primary-green/10 rounded-full text-primary-green border border-primary-green/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-bold font-serif text-primary-green tracking-tight">
              {metrics.deptCount || 9}
            </span>
            <span className="text-[11px] text-stone-500 font-mono font-medium block uppercase tracking-wider">Faculties</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-stone-50/50 border border-stone-150 rounded-sm p-4 flex items-center gap-3.5 shadow-sm transition-transform hover:scale-[1.01]">
          <div className="p-2.5 bg-accent-gold/10 rounded-full text-accent-gold border border-accent-gold/10">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xl md:text-2xl font-bold font-serif text-primary-green tracking-tight">
              {metrics.countriesCount || 4}
            </span>
            <span className="text-[11px] text-stone-500 font-mono font-medium block uppercase tracking-wider">Countries</span>
          </div>
        </div>
      </div>

      {metrics.newest && metrics.newest.length > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-150">
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-green-light opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-green"></span>
            </span>
            Latest Signatures Joining the Wall:
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.newest.slice(0, 3).map((sig) => (
              <span 
                key={sig.id} 
                className="bg-[#FDFCFB] hover:bg-stone-50 border border-stone-200 rounded-full py-1 px-3 text-[11px] text-stone-700 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="font-bold text-primary-green">{sig.name}</span>
                <span className="text-stone-400">({sig.graduation_year})</span>
                {sig.country_optional && (
                  <span className="text-[10px] bg-stone-100 text-stone-550 px-1.5 py-0.2 rounded-md font-sans inline-flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-accent-gold" />
                    {sig.country_optional}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
