import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, PenTool, BookOpen, Search, Filter, RefreshCw, 
  Settings, Award, Lock, ArrowUpRight, HelpCircle, AlertTriangle, 
  CheckCircle, ShieldAlert, History, Globe, Star, MapPin 
} from "lucide-react";
import AnniversaryCountdown from "./components/AnniversaryCountdown";
import MetricsPanel from "./components/MetricsPanel";
import SubmissionForm from "./components/SubmissionForm";
import SignatureCard from "./components/SignatureCard";
import AdminDashboard from "./components/AdminDashboard";
import { Signature, CommunityMetrics } from "./types";

export default function App() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    totalSignatures: 0,
    setsCount: 0,
    deptCount: 0,
    countriesCount: 0,
    newest: []
  });

  const [loading, setLoading] = useState(true);
  const [querySearch, setQuerySearch] = useState("");
  const [selectedSet, setSelectedSet] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all"); // 'all' | 'early' (2005-2011) | 'growth' (2012-2018) | 'recent' (2019-2026) | 'other' (staff)
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'oldest' | 'random'

  // Modal / Display toggles
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  // Success message after submitting
  const [justSubmitted, setJustSubmitted] = useState<Signature | null>(null);

  // Fetch core signatures and metrics from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch public approved signatures
      const sigUrl = `/api/signatures?search=${encodeURIComponent(querySearch)}&set_year=${selectedSet}&era=${selectedEra}&sort=${sortBy}`;
      const sigRes = await fetch(sigUrl);
      if (sigRes.ok) {
        const sigData = await sigRes.ok ? await sigRes.json() : [];
        setSignatures(sigData);
      }

      // Fetch metrics
      const metricsRes = await fetch("/api/metrics");
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (err) {
      console.error("Error synchronization data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on parameters change
  useEffect(() => {
    fetchData();
  }, [querySearch, selectedSet, selectedEra, sortBy]);

  // Handle successful submission
  const handleSubmissionSuccess = (newEntry: Signature) => {
    setJustSubmitted(newEntry);
    fetchData(); // reload
    setTimeout(() => {
      // scroll to wall after a slight delay
      const element = document.getElementById("signatures-wall-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 1200);
  };

  // Toggle Time Capsule pre-selection era
  const handleEraSelect = (eraId: string) => {
    setSelectedEra(eraId);
    setSelectedSet("all"); // reset set year dropdown to prevent intersection issues
    // Scroll down to cards grid
    document.getElementById("signatures-wall-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // List of all graduation sets for filtering
  const GRADUATION_SETS_FILTER = [
    "Class of 2009", "Class of 2010", "Class of 2011", "Class of 2012", 
    "Class of 2013", "Class of 2014", "Class of 2015", "Class of 2016", 
    "Class of 2517", "Class of 2018", "Class of 2019", "Class of 2020", 
    "Class of 2021", "Class of 2022", "Class of 2023", "Class of 2024", 
    "Class of 2025", "Class of 2026", "Current Student", "Staff / Faculty", "Friend of FUO"
  ];

  // Randomly select up to 3 signatures to highlight as "Featured Memories"
  const featuredMemories = signatures.length > 5 
    ? signatures.slice(1, 4) // sample some entries
    : signatures.slice(0, 3); // list top ones

  return (
    <div className="min-h-screen bg-parchment-cream text-stone-900 font-sans selection:bg-primary-green-light selection:text-white">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant Fountain/Centennial inspired logo matching Sleek Interface theme */}
            <div className="w-11 h-11 bg-primary-green rounded-full flex items-center justify-center text-white font-serif text-lg font-bold italic border-2 border-accent-gold shadow-sm shrink-0">
              20
            </div>
            <div>
              <span className="font-display font-bold text-primary-green tracking-tight text-sm md:text-base block leading-tight">
                FUO @20
              </span>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-widest block leading-none">
                Signature Wall
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick action controls */}
            <button
              onClick={() => {
                setIsAdminView(false);
                setIsSubmitOpen(!isSubmitOpen);
                if (!isSubmitOpen) {
                  document.getElementById("submission-container")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-5 py-2.5 bg-primary-green hover:bg-primary-green-hover text-white font-display font-semibold text-xs rounded-sm shadow-sm transition transform active:scale-95 inline-flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1"
              aria-expanded={isSubmitOpen}
              aria-label="Toggle yearbook signature submission form"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave Your Signature</span>
              <span className="sm:hidden">Sign</span>
            </button>

            <button
              onClick={() => {
                setIsAdminView(!isAdminView);
                setIsSubmitOpen(false);
                if (!isAdminView) {
                  setTimeout(() => {
                    document.getElementById("admin-container")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }}
              className={`px-3.5 py-2.5 rounded-sm text-xs font-mono font-bold border transition flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
                isAdminView 
                  ? "bg-accent-gold/15 border-accent-gold text-accent-brown" 
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:text-primary-green hover:border-primary-green-light"
              }`}
              aria-expanded={isAdminView}
              aria-label="Toggle administration console panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">School Portal</span>
              <span className="md:hidden">Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE HERO WRAPPER */}
      <section className="relative overflow-hidden py-16 md:py-20 bg-parchment-tan border-b border-stone-150" id="hero-section">
        {/* Subtle decorative elements for university aesthetic */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-green/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 relative z-10">
          
          {/* Anniversary badge emblem */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-stone-200 text-primary-green text-xs rounded-full font-mono font-bold tracking-widest uppercase mb-2 shadow-sm">
            <Star className="w-3.5 h-3.5 text-accent-gold shrink-0 fill-accent-gold" />
            20th Anniversary Jubilee
          </div>

          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] text-primary-green max-w-4xl mx-auto">
            Twenty years. Thousands of stories.
          </h1>

          <p className="font-serif italic text-lg sm:text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto tracking-wide leading-relaxed">
            From lecture halls to lifelong journeys, celebrate your place in the Fountain University story.
          </p>

          <p className="text-stone-500 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-sans">
            Your mark, preserved forever. This commemorative digital memory board preserves our values, legacy, and friendships in Osogbo.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsSubmitOpen(true);
                setIsAdminView(false);
                document.getElementById("submission-container")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary-green hover:bg-primary-green-hover text-white font-semibold font-display text-xs rounded-sm shadow-md transition duration-150 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <PenTool className="w-4 h-4" /> Leave Your Signature
            </button>
            <button
              onClick={() => {
                setIsSubmitOpen(false);
                setIsAdminView(false);
                document.getElementById("signatures-wall-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-250 font-semibold font-display text-xs rounded-sm transition duration-150 uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-primary-green" /> Browse Memories
            </button>
          </div>
        </div>
      </section>

      {/* COUNTDOWN TICKER & SCARCITY COMPONENT */}
      <section className="px-4" id="countdown-section">
        <AnniversaryCountdown />
      </section>

      {/* CORE CONTENT LAYOUT */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* SUBMISSION WORKFLOW CONTAINER */}
        {(isSubmitOpen || justSubmitted) && (
          <div className="pt-2 duration-300 transition-all" id="submission-container">
            <div className="flex justify-between items-center max-w-2xl mx-auto mb-4">
              <span className="text-xs font-mono text-slate-500">YEARBOOK SIGN-OFF WIDGET</span>
              <button 
                onClick={() => setIsSubmitOpen(false)} 
                className="text-xs text-rose-450 hover:text-rose-400 font-mono underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 rounded px-1 flex-inline"
                aria-label="Close yearbook signature form editor"
              >
                Close Editor
              </button>
            </div>
            <SubmissionForm onSuccess={handleSubmissionSuccess} />
          </div>
        )}

        {/* ADMIN WORKFLOW PANEL */}
        {isAdminView && (
          <div className="pt-2 duration-300 transition-all" id="admin-container">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-amber-500 flex items-center gap-1.5 uppercase font-bold">
                <ShieldAlert className="w-3.5 h-3.5" /> High Sec Security Ledger View
              </span>
              <button 
                onClick={() => setIsAdminView(false)} 
                className="text-xs text-rose-450 hover:text-rose-400 font-mono underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 rounded px-1 flex-inline"
                aria-label="Close high security admin container"
              >
                Hide Console
              </button>
            </div>
            <AdminDashboard onDatabaseUpdate={fetchData} />
          </div>
        )}

        {/* COMMUNITY METRICS PANEL */}
        <section id="metrics-panel">
          <MetricsPanel metrics={metrics} />
        </section>

        {/* TIME CAPSULE NAVIGATION CHIPS */}
        <div className="bg-white border border-stone-150 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent-gold" />
            <h3 className="font-serif text-base font-bold text-primary-green">Time Capsule Chapters</h3>
          </div>
          <p className="text-xs text-stone-500">
            Fountain University was established in 2005. Toggle pre-set historical chapters to instantly explore yearbooks!
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5" id="time-capsule-era-grid">
            <button
              onClick={() => handleEraSelect("early")}
              className={`p-3.5 rounded-sm border text-left transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
                selectedEra === "early"
                  ? "bg-primary-green text-white border-primary-green shadow-md"
                  : "bg-stone-50 border-stone-200 hover:border-primary-green hover:bg-white text-stone-700"
              }`}
              aria-pressed={selectedEra === "early"}
              aria-label="Time capsule chapter 1: The Pioneers years 2005 to 2011"
            >
              <span className={`block text-xs font-mono font-bold tracking-wider mb-1 uppercase ${selectedEra === "early" ? "text-accent-gold" : "text-stone-400"}`}>Era I</span>
              <span className={`block font-serif text-sm font-bold ${selectedEra === "early" ? "text-white" : "text-stone-800"}`}>The Pioneers</span>
              <span className={`block text-[10px] mt-0.5 ${selectedEra === "early" ? "text-stone-300" : "text-stone-500"}`}>Years 2005 - 2011</span>
            </button>

            <button
              onClick={() => handleEraSelect("growth")}
              className={`p-3.5 rounded-sm border text-left transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
                selectedEra === "growth"
                  ? "bg-primary-green text-white border-primary-green shadow-md"
                  : "bg-stone-50 border-stone-200 hover:border-primary-green hover:bg-white text-stone-700"
              }`}
              aria-pressed={selectedEra === "growth"}
              aria-label="Time capsule chapter 2: Growth Years 2012 to 2018"
            >
              <span className={`block text-xs font-mono font-bold tracking-wider mb-1 uppercase ${selectedEra === "growth" ? "text-accent-gold" : "text-stone-400"}`}>Era II</span>
              <span className={`block font-serif text-sm font-bold ${selectedEra === "growth" ? "text-white" : "text-stone-800"}`}>Growth Years</span>
              <span className={`block text-[10px] mt-0.5 ${selectedEra === "growth" ? "text-stone-300" : "text-stone-500"}`}>Years 2012 - 2018</span>
            </button>

            <button
              onClick={() => handleEraSelect("recent")}
              className={`p-3.5 rounded-sm border text-left transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
                selectedEra === "recent"
                  ? "bg-primary-green text-white border-primary-green shadow-md"
                  : "bg-stone-50 border-stone-200 hover:border-primary-green hover:bg-white text-stone-700"
              }`}
              aria-pressed={selectedEra === "recent"}
              aria-label="Time capsule chapter 3: Recent Generation years 2019 to 2026"
            >
              <span className={`block text-xs font-mono font-bold tracking-wider mb-1 uppercase ${selectedEra === "recent" ? "text-accent-gold" : "text-stone-400"}`}>Era III</span>
              <span className={`block font-serif text-sm font-bold ${selectedEra === "recent" ? "text-white" : "text-stone-800"}`}>Recent Gen</span>
              <span className={`block text-[10px] mt-0.5 ${selectedEra === "recent" ? "text-stone-300" : "text-stone-500"}`}>Years 2019 - 2026</span>
            </button>

            <button
              onClick={() => handleEraSelect("other")}
              className={`p-3.5 rounded-sm border text-left transition duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green focus:ring-offset-1 ${
                selectedEra === "other"
                  ? "bg-primary-green text-white border-primary-green shadow-md"
                  : "bg-stone-50 border-stone-200 hover:border-primary-green hover:bg-white text-stone-700"
              }`}
              aria-pressed={selectedEra === "other"}
              aria-label="Time capsule chapter 4: Staff, Faculty, Founders and Scholars"
            >
              <span className={`block text-xs font-mono font-bold tracking-wider mb-1 uppercase ${selectedEra === "other" ? "text-accent-gold" : "text-stone-400"}`}>Era IV</span>
              <span className={`block font-serif text-sm font-bold ${selectedEra === "other" ? "text-white" : "text-stone-800"}`}>Staff & Faculty</span>
              <span className={`block text-[10px] mt-0.5 ${selectedEra === "other" ? "text-stone-300" : "text-stone-500"}`}>Founders & Scholars</span>
            </button>
          </div>
          {selectedEra !== "all" && (
            <div className="pt-1 flex justify-between items-center text-xs">
              <span className="text-accent-brown font-medium">Currently viewing selected Era Chapter of Fountain history.</span>
              <button 
                onClick={() => setSelectedEra("all")}
                className="text-stone-500 underline hover:text-stone-700 font-mono text-[11px] cursor-pointer"
              >
                Clear Chapter Filter
              </button>
            </div>
          )}
        </div>

        {/* RANDOM / FEATURED MEMORIES SPOTLIGHT */}
        {featuredMemories.length > 0 && querySearch === "" && selectedSet === "all" && selectedEra === "all" && (
          <div className="bg-[#FFFBEB]/40 border border-accent-gold/30 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5.5 h-5.5 text-accent-gold fill-accent-gold" />
                <h3 className="font-serif text-lg font-bold text-primary-green flex items-center gap-1.5">
                  Featured Alumni Memories
                </h3>
              </div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wide">Randomly Surfaced</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="featured-grid">
              {featuredMemories.map((sig) => (
                <SignatureCard 
                  key={`featured-${sig.id}`} 
                  signature={sig} 
                  onFlag={fetchData}
                />
              ))}
            </div>
          </div>
        )}

        {/* MAIN SIGNATURE WALL SECTION (SEARCH, FILTERS, CARDS) */}
        <section id="signatures-wall-section" className="space-y-6 pt-4">
          
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-stone-155">
            <div>
              <h2 className="font-serif font-bold text-xl md:text-2xl text-primary-green flex items-center gap-2">
                <BookOpen className="w-5.5 h-5.5 text-primary-green shrink-0" />
                The Autograph Memory Wall
              </h2>
              <p className="text-xs text-stone-500">
                Displaying signatures left by our beautiful global alumni network. Touch or click any memory.
              </p>
            </div>

            {/* Controls panel */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 lg:w-[60%]">
              
              {/* Search text input */}
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  aria-label="Search memory wall signatures"
                  placeholder="Search by name, message, major..."
                  value={querySearch}
                  onChange={(e) => setQuerySearch(e.target.value)}
                  className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none rounded-sm pl-9 pr-4 py-2.5 text-xs text-stone-800 outline-none transition"
                />
              </div>

              {/* Browse by Set / Dropdown */}
              <div className="relative">
                <select
                  value={selectedSet}
                  onChange={(e) => {
                    setSelectedSet(e.target.value);
                    setSelectedEra("all"); // clear era to prevent conflict
                  }}
                  aria-label="Filter signatures on memory wall by graduation set or role"
                  className="w-full bg-white border border-stone-200 text-stone-700 text-xs rounded-sm px-3 py-2.5 outline-none hover:border-primary-green focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none transition cursor-pointer"
                >
                  <option value="all">Every Set / Class</option>
                  {GRADUATION_SETS_FILTER.map((set) => (
                    <option key={set} value={set}>{set}</option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort memory wall signatures"
                  className="w-full bg-white border border-stone-200 text-stone-700 text-xs rounded-sm px-3 py-2.5 outline-none hover:border-primary-green focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none transition cursor-pointer"
                >
                  <option value="recent">Recent Signatures</option>
                  <option value="oldest">Early Signatures</option>
                  <option value="random">Shuffle Wall</option>
                </select>
              </div>

            </div>
          </div>

          {/* Filtering Indicators */}
          {(querySearch || selectedSet !== "all" || selectedEra !== "all") && (
            <div className="flex justify-between items-center text-xs bg-stone-50 px-4 py-2.5 rounded-sm border border-stone-200/80">
              <span className="text-stone-600">
                Matched <strong className="text-primary-green">{signatures.length}</strong> record{signatures.length === 1 ? '' : 's'} based on active lookups.
              </span>
              <button
                onClick={() => {
                  setQuerySearch("");
                  setSelectedSet("all");
                  setSelectedEra("all");
                }}
                className="text-accent-brown hover:text-accent-brown/80 underline font-mono text-[11px] cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Signatures Cards Grid Flow */}
          {loading ? (
            <div className="text-center py-20 text-stone-500 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-green" />
              <span className="font-mono text-xs text-stone-400">Assembling memory parchment boards...</span>
            </div>
          ) : signatures.length === 0 ? (
            <div className="text-center py-24 bg-stone-50/50 border border-dashed border-stone-200 rounded-xl text-stone-500 max-w-lg mx-auto">
              <History className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <h4 className="font-serif font-bold text-stone-850 mb-1">No Signatures Found</h4>
              <p className="text-xs text-stone-400 px-4">
                Be the first to leave your signature for this selection! Leave a congratulations note above.
              </p>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-4 pb-12" id="signatures-grid"
            >
              {signatures.map((sig) => (
                <SignatureCard
                  key={sig.id}
                  signature={sig}
                  onFlag={() => fetchData()}
                />
              ))}
            </div>
          )}

        </section>

        {/* ANNIVERSARY ARCHIVE CONCLUDED TEXT CAPSULE */}
        <div className="bg-parchment-deep border border-stone-200/60 p-6 md:p-8 rounded-sm text-center space-y-4 max-w-4xl mx-auto shadow-sm">
          <BookOpen className="w-8 h-8 mx-auto text-accent-gold" />
          <h4 className="font-serif text-lg font-bold text-primary-green">
            FUO @20 Preserved Anniversary Archive
          </h4>
          <p className="text-xs md:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Following the Fountain University 20th Anniversary Gown Convocation, this visual guestbook wall will be compiled, printed, and compiled into permanent physical plaques displayed in the university foyer and administrative archives in Osogbo to honor different pioneer generations.
          </p>
          <span className="inline-block text-[10px] font-mono tracking-widest text-accent-brown font-bold uppercase">
            &bull; FAITH &bull; KNOWLEDGE &bull; CHARACTER &bull;
          </span>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-primary-green border-t border-white/10 py-12 text-white/70 text-[10px] uppercase tracking-widest">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white text-primary-green border border-accent-gold/40 flex items-center justify-center font-bold text-xs">
              20
            </div>
            <div className="text-left">
              <span className="block font-medium text-white">FUO @20 Commemorative Commission</span>
              <span className="block text-[10px] text-white/50 font-mono mt-0.5 normal-case">© 2005-2025 Fountain University, Osogbo • Celebrating 20 Years of Impact</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-mono">
            <a 
              href="#hero-section" 
              className="hover:text-accent-gold transition"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Leave Message
            </a>
            <a 
              href="#signatures-wall-section" 
              className="hover:text-accent-gold transition"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("signatures-wall-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Alumni Logs
            </a>
            <button
              onClick={() => {
                setIsAdminView(true);
                setIsSubmitOpen(false);
                document.getElementById("admin-container")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-accent-gold transition cursor-pointer flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Committee Console
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
