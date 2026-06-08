import React, { useState, useEffect } from "react";
import { Signature } from "../types";
import { 
  ShieldAlert, Sparkles, Trash2, Search, Filter, RefreshCw, 
  Download, LayoutDashboard, Database, Key, HelpCircle, Check, MapPin 
} from "lucide-react";

interface AdminDashboardProps {
  onDatabaseUpdate: () => void;
}

export default function AdminDashboard({ onDatabaseUpdate }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Stats calculation
  const totalCount = signatures.length;
  const approvedCount = signatures.filter(s => s.status === "approved").length;
  const flaggedCount = signatures.filter(s => s.status === "flagged").length;
  const pendingCount = signatures.filter(s => s.status === "pending").length;

  // Real auth verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        // Persist password temporarily in session storage
        sessionStorage.setItem("fuo_admin_token", password);
        fetchAdminSignatures(password);
      } else {
        setAuthError(data.error || "Incorrect password. Default is 'fuo20admin'");
      }
    } catch {
      setAuthError("Failed to authenticate.");
    }
  };

  // Check storage on load
  useEffect(() => {
    const savedToken = sessionStorage.getItem("fuo_admin_token");
    if (savedToken) {
      setPassword(savedToken);
      setIsAuthenticated(true);
      fetchAdminSignatures(savedToken);
    }
  }, []);

  const fetchAdminSignatures = async (token: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/signatures", {
        headers: { "x-admin-token": token }
      });
      if (response.ok) {
        const data = await response.json();
        setSignatures(data);
      } else {
        // Clear token if invalid
        sessionStorage.removeItem("fuo_admin_token");
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching admin signatures:", err);
    } finally {
      setLoading(false);
    }
  };

  // Administration adjustments: Approve/Flag
  const handleUpdateStatus = async (id: string, newStatus: "approved" | "flagged" | "pending") => {
    setActionLoadingId(id);
    const token = sessionStorage.getItem("fuo_admin_token") || password;
    try {
      const response = await fetch(`/api/admin/signatures/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-token": token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSignatures(prev => 
          prev.map(sig => sig.id === id ? { ...sig, status: newStatus } : sig)
        );
        onDatabaseUpdate();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete signature node
  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you absolutely sure you want to permanently delete this memory signature? This operation is irreversible.");
    if (!confirm) return;

    setActionLoadingId(id);
    const token = sessionStorage.getItem("fuo_admin_token") || password;
    try {
      const response = await fetch(`/api/admin/signatures/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token }
      });

      if (response.ok) {
        setSignatures(prev => prev.filter(s => s.id !== id));
        onDatabaseUpdate();
      }
    } catch (err) {
      console.error("Failed to delete signature:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Graduation Year", "Department", "Message", "Country", "Status", "Timestamp"];
    const rows = signatures.map(sig => [
      sig.id,
      `"${sig.name.replace(/"/g, '""')}"`,
      sig.graduation_year,
      `"${(sig.department_optional || "").replace(/"/g, '""')}"`,
      `"${sig.message.replace(/"/g, '""')}"`,
      sig.country_optional || "Nigeria",
      sig.status,
      sig.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fuo_20_signature_wall_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fuo_admin_token");
    setIsAuthenticated(false);
    setPassword("");
    setSignatures([]);
  };

  // Filter signatures list
  const filteredSignatures = signatures.filter(sig => {
    const matchesSearch = 
      sig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sig.department_optional && sig.department_optional.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || sig.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-stone-200 rounded-sm p-6 md:p-8 shadow-sm max-w-md mx-auto text-center">
        <div className="w-12 h-12 bg-primary-green/10 border border-primary-green/20 text-primary-green rounded-full flex items-center justify-center mx-auto mb-5">
          <Key className="w-5 h-5" />
        </div>
        <h3 className="font-serif font-bold text-primary-green text-xl mb-2">Admin Portal Access</h3>
        <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
          Authenticate using the Fountain University committee authorization credentials to manage memory wall signatures.
        </p>

        {authError && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md text-xs mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
          <div className="space-y-1.5 text-left">
            <label htmlFor="admin-pin" className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
              Administrative PIN / Password
            </label>
            <input
              id="admin-pin"
              type="password"
              placeholder="Enter PIN (e.g., fuo20admin)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none rounded-sm px-4 py-2.5 text-xs text-stone-880 outline-none leading-relaxed transition focus-visible:ring-2 focus-visible:ring-primary-green"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-green hover:bg-[#1B4332] text-white font-serif font-bold py-2.5 rounded-sm uppercase tracking-wider cursor-pointer"
          >
            Authenticate
          </button>
        </form>

        <p className="text-[10px] text-stone-400 mt-5 flex items-center justify-center gap-1">
          <HelpCircle className="w-3 h-3" /> Note: The default credentials is <code className="bg-stone-50 border border-stone-200 px-1 py-0.5 rounded text-accent-brown font-mono font-bold">fuo20admin</code>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-sm p-6 md:p-8 shadow-sm space-y-6">
      {/* Header section with Stats & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h3 className="font-serif font-bold text-primary-green text-xl flex items-center gap-2">
            <LayoutDashboard className="w-5.5 h-5.5 text-primary-green" />
            Administrative Moderation Panel
          </h3>
          <p className="text-xs text-stone-500">
            Fountain University Commemorative Commission &bull; Status & Safety Controller
          </p>
        </div>

        <div className="flex gap-2">
          {signatures.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-sm text-xs font-mono font-medium flex items-center gap-1.5 border border-stone-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-gold"
              aria-label="Export all yearbooks as CSV file"
            >
              <Download className="w-3.5 h-3.5 text-accent-gold" /> Export Yearbooks (.CSV)
            </button>
          )}
          <button
            onClick={() => fetchAdminSignatures(sessionStorage.getItem("fuo_admin_token") || password)}
            className="p-2 bg-stone-50 hover:bg-stone-100 text-stone-750 rounded-sm border border-stone-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green"
            title="Refresh database records"
            aria-label="Refresh signatures database ledger"
          >
            <RefreshCw className={`w-4 h-4 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-sm text-xs font-mono font-bold border border-rose-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Log out of admin moderation session"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Analytics Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats">
        <div className="bg-[#FCFAF7] border border-stone-200/80 p-4 rounded-sm shadow-sm">
          <span className="block text-stone-500 text-[10px] font-mono uppercase tracking-wider font-semibold">Total Records</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-primary-green flex items-center gap-1.5 mt-1">
            <Database className="w-4 h-4 text-accent-gold inline" /> {totalCount}
          </span>
        </div>
        <div className="bg-[#FCFAF7] border border-stone-200/80 p-4 rounded-sm shadow-sm">
          <span className="block text-stone-500 text-[10px] font-mono uppercase tracking-wider font-semibold">Approved Wall Live</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-primary-green flex items-center gap-1.5 mt-1">
            <Check className="w-4 h-4" /> {approvedCount}
          </span>
        </div>
        <div className="bg-[#FCFAF7] border border-stone-200/80 p-4 rounded-sm shadow-sm">
          <span className="block text-stone-500 text-[10px] font-mono uppercase tracking-wider font-semibold">Flagged Reviews</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-accent-brown flex items-center gap-1.5 mt-1">
            <ShieldAlert className="w-4 h-4" /> {flaggedCount}
          </span>
        </div>
        <div className="bg-[#FCFAF7] border border-stone-200/80 p-4 rounded-sm shadow-sm">
          <span className="block text-stone-500 text-[10px] font-mono uppercase tracking-wider font-semibold">Pending Holds</span>
          <span className="text-xl md:text-2xl font-bold font-serif text-stone-600 flex items-center gap-1.5 mt-1">
            <RefreshCw className="w-3.5 h-3.5" /> {pendingCount}
          </span>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            aria-label="Search administration signatures"
            placeholder="Search entries by name, message, major/dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none rounded-sm pl-10 pr-4 py-2.5 text-xs text-stone-800 outline-none transition"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter administration records by validation status"
            className="bg-white border border-stone-200 text-stone-700 text-xs rounded-sm px-3 py-2.5 outline-none cursor-pointer hover:border-primary-green focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:outline-none transition"
          >
            <option value="all">All Moderation Status</option>
            <option value="approved">Approved Live</option>
            <option value="flagged">Flagged Only</option>
            <option value="pending">Pending Holds</option>
          </select>
        </div>
      </div>

      {/* Signatures Records Database View */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 flex flex-col items-center gap-2.5">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-green" />
          <span className="font-mono text-xs text-stone-400">Synchronizing commemorative wall ledger...</span>
        </div>
      ) : filteredSignatures.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-stone-200 rounded-sm text-stone-400">
          <Database className="w-8 h-8 mx-auto mb-2 text-stone-300" />
          <span className="font-sans text-xs">No signatures found matching search parameters.</span>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="admin-table">
              <thead>
                <tr className="bg-stone-50 text-[10px] uppercase font-mono tracking-widest text-stone-500 border-b border-stone-200">
                  <th className="px-4 py-3 font-semibold">User Details</th>
                  <th className="px-4 py-3 font-semibold">Grad Set</th>
                  <th className="px-4 py-3 font-semibold">Commemorative Message</th>
                  <th className="px-4 py-3 font-semibold">Date / Location</th>
                  <th className="px-4 py-3 font-semibold text-right">Moderations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white text-xs">
                {filteredSignatures.map((sig) => (
                  <tr 
                    key={sig.id} 
                    className={`hover:bg-stone-50/50 transition duration-100 ${
                      sig.status === "flagged" ? 'bg-rose-50/60' : ''
                    }`}
                  >
                    {/* User profile */}
                    <td className="px-4 py-3.5">
                      <div className="font-serif font-bold text-stone-800">{sig.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5 max-w-[140px] truncate">
                        {sig.department_optional || "No Major Specified"}
                      </div>
                    </td>

                    {/* Set year */}
                    <td className="px-4 py-3.5 text-primary-green font-mono font-bold">
                      {sig.graduation_year}
                    </td>

                    {/* Message box */}
                    <td className="px-4 py-3.5 max-w-sm">
                      <span className="text-stone-600 block break-words leading-relaxed font-sans">
                        &ldquo;{sig.message}&rdquo;
                      </span>
                    </td>

                    {/* DateTime & country */}
                    <td className="px-4 py-3.5 font-mono text-[10px] text-stone-500 space-y-1">
                      <div>{new Date(sig.created_at).toLocaleDateString()}</div>
                      {sig.country_optional && (
                        <div className="inline-flex items-center gap-0.5 bg-stone-50 border border-stone-200 px-1.5 py-0.2 rounded text-stone-600">
                          <MapPin className="w-2.5 h-2.5 text-primary-green shrink-0" />
                          {sig.country_optional}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        {sig.status !== "approved" && (
                          <button
                            disabled={actionLoadingId === sig.id}
                            onClick={() => handleUpdateStatus(sig.id, "approved")}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-[#1B4332] text-emerald-800 hover:text-white rounded-sm border border-emerald-200 transition text-[10px] font-serif font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            aria-label={`Approve signature by ${sig.name}`}
                          >
                            Approve
                          </button>
                        )}
                        
                        {sig.status !== "flagged" && (
                          <button
                            disabled={actionLoadingId === sig.id}
                            onClick={() => handleUpdateStatus(sig.id, "flagged")}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-accent-brown text-amber-800 hover:text-white rounded-sm border border-amber-200 transition text-[10px] font-serif font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-gold"
                            aria-label={`Flag and hide signature by ${sig.name}`}
                          >
                            Flag / Hide
                          </button>
                        )}

                        <button
                          disabled={actionLoadingId === sig.id}
                          onClick={() => handleDelete(sig.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white rounded-sm border border-rose-200 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
                          title="Permanently Delete Record"
                          aria-label={`Permanently delete memory by ${sig.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
