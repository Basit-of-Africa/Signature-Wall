import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "signatures.json");

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Interface for Signature
interface Signature {
  id: string;
  name: string;
  graduation_year: string;
  department_optional: string;
  message: string;
  created_at: string;
  status: "pending" | "approved" | "flagged";
  style_variant: {
    bgColor: string;
    textColor: string;
    rotation: number;
    fontStyle: string; // "handwritten" | "sans" | "serif"
    borderStyle: string;
  };
  country_optional: string;
}

// Initial demo memory data
const DEFAULT_SIGNATURES: Signature[] = [
  {
    id: "demo-1",
    name: "Aisha Ibrahim",
    graduation_year: "Class of 2009",
    department_optional: "Computer Science",
    message: "We took the first bold steps on campus. Infinite memories of old lecture halls and lifelong friends! Proud Pioneer!",
    created_at: "2026-05-15T10:30:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-amber-50",
      textColor: "text-amber-900",
      rotation: -1.5,
      fontStyle: "font-handwritten",
      borderStyle: "border-amber-200"
    },
    country_optional: "Nigeria"
  },
  {
    id: "demo-2",
    name: "Yusuf Kolawole",
    graduation_year: "Class of 2012",
    department_optional: "Microbiology",
    message: "Fountain University shaped who I am today. The labs, the sports court, the values. Happy 20th Anniversary FUO!",
    created_at: "2026-06-01T14:22:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-900",
      rotation: 1.2,
      fontStyle: "font-sans",
      borderStyle: "border-emerald-200"
    },
    country_optional: "United Kingdom"
  },
  {
    id: "demo-3",
    name: "Zainab Alao",
    graduation_year: "Class of 2015",
    department_optional: "Economics",
    message: "Late night study groups, library drills, and endless laughter in the hostel. Forever a proud alumna!",
    created_at: "2026-06-05T09:15:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-sky-50",
      textColor: "text-sky-900",
      rotation: -2,
      fontStyle: "font-handwritten",
      borderStyle: "border-sky-200"
    },
    country_optional: "Canada"
  },
  {
    id: "demo-4",
    name: "Oluwaseun Adebayo",
    graduation_year: "Class of 2018",
    department_optional: "Mass Communication",
    message: "To the professors who challenged us and peers who became family. Thank you Fountain for the spark of purpose!",
    created_at: "2026-06-07T18:40:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      rotation: 2.2,
      fontStyle: "font-handwritten",
      borderStyle: "border-purple-200"
    },
    country_optional: "Nigeria"
  },
  {
    id: "demo-5",
    name: "Prof. AbdulRasheed A.",
    graduation_year: "Staff / Faculty",
    department_optional: "Academic Dean",
    message: "Twenty years of nurturing scholars and building character in an atmosphere of peace. A beautiful milestone globally.",
    created_at: "2026-06-08T08:00:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-rose-50",
      textColor: "text-rose-900",
      rotation: -1.2,
      fontStyle: "font-sans",
      borderStyle: "border-rose-200"
    },
    country_optional: "Nigeria"
  },
  {
    id: "demo-6",
    name: "Fatima Bello",
    graduation_year: "Class of 2021",
    department_optional: "Accounting",
    message: "Taught us faith, knowledge, and integrity. Fountain will always have a special place in my heart.",
    created_at: "2026-06-08T11:05:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-900",
      rotation: 0.8,
      fontStyle: "font-sans",
      borderStyle: "border-yellow-200"
    },
    country_optional: "United States"
  },
  {
    id: "demo-7",
    name: "Chidi Okafor",
    graduation_year: "Class of 2025",
    department_optional: "Software Engineering",
    message: "Brand new set! Ready to build the future with the top-tier preparation we received here. Alhamdullilah to 20!",
    created_at: "2026-06-08T13:12:00Z",
    status: "approved",
    style_variant: {
      bgColor: "bg-stone-50",
      textColor: "text-stone-900",
      rotation: -2.5,
      fontStyle: "font-handwritten",
      borderStyle: "border-stone-200"
    },
    country_optional: "Germany"
  }
];

// Load signatures from file
const loadSignatures = (): Signature[] => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } else {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SIGNATURES, null, 2));
      return DEFAULT_SIGNATURES;
    }
  } catch (err) {
    console.error("Error reading signatures file, resetting to default:", err);
    return DEFAULT_SIGNATURES;
  }
};

// Save signatures to file
const saveSignatures = (data: Signature[]) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing signatures file:", err);
  }
};

// Expose JSON middlewares
app.use(express.json());

// List of profane / inappropriate terms (extremely basic client/server list for moderation)
const BAD_WORDS = [
  "scam", "spam", "fucker", "fuck", "bitch", "shit", "bastard", "asshole", 
  "idiot", "kill", "porn", "prostitute", "gambling", "crypto scam", "hack"
];

const containsInappropriateContent = (text: string): boolean => {
  const normalized = text.toLowerCase();
  return BAD_WORDS.some(word => normalized.includes(word));
};

// API ROUTES

// 1. Get all signatures
app.get("/api/signatures", (req, res) => {
  const signatures = loadSignatures();
  
  // Admin requests might want everything, but public gets only 'approved'
  const isAdmin = req.headers["x-admin-token"] === (process.env.ADMIN_PASSWORD || "fuo20admin");
  
  let filtered = signatures;
  
  if (!isAdmin) {
    filtered = signatures.filter(s => s.status === "approved" || s.status === "pending"); 
    // Show approved to all. You can also show pending right away for immediate gratification, or restrict. Let's auto-approve first.
  }
  
  // Apply Search
  const search = req.query.search as string;
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(term) || 
      (s.department_optional && s.department_optional.toLowerCase().includes(term)) ||
      s.message.toLowerCase().includes(term)
    );
  }

  // Apply Set / Year Filter
  const setYear = req.query.set_year as string;
  if (setYear && setYear !== "all") {
    filtered = filtered.filter(s => s.graduation_year === setYear);
  }

  // Apply Decade/Era filter
  // "early" (2005-2010), "growth" (2011-2018), "recent" (2019-2026), "other" (staff/guest)
  const era = req.query.era as string;
  if (era && era !== "all") {
    filtered = filtered.filter(s => {
      if (s.graduation_year.includes("Staff") || s.graduation_year.includes("Guest")) {
        return era === "other";
      }
      const yearMatch = s.graduation_year.match(/\d+/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0], 10);
        if (era === "early" && year >= 2005 && year <= 2011) return true;
        if (era === "growth" && year >= 2012 && year <= 2018) return true;
        if (era === "recent" && year >= 2019 && year <= 2026) return true;
      }
      return false;
    });
  }

  // Apply Sorting
  const sort = req.query.sort as string; // 'recent' | 'oldest' | 'random'
  if (sort === "oldest") {
    filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sort === "random") {
    filtered.sort(() => Math.random() - 0.5);
  } else {
    // default recent
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json(filtered);
});

// 2. Submit a new signature
app.post("/api/signatures", (req, res) => {
  const { name, graduation_year, department_optional, message, country_optional, bgColor, fontStyle } = req.body;

  if (!name || !graduation_year || !message) {
    return res.status(400).json({ error: "Name, Graduation Set, and Message are required." });
  }

  if (message.length > 120) {
    return res.status(400).json({ error: "Message exceeds 120 character limit." });
  }

  // Basic profanity check
  if (containsInappropriateContent(name) || containsInappropriateContent(message) || (department_optional && containsInappropriateContent(department_optional))) {
    return res.status(400).json({ error: "Your message contains words flagged as inappropriate. Please keep it celebratory!" });
  }

  const signatures = loadSignatures();

  // Spam prevention (duplicate detection): check if this name has sent the exact same message recently
  const isDuplicate = signatures.some(s => 
    s.name.toLowerCase() === name.trim().toLowerCase() && 
    s.message.toLowerCase() === message.trim().toLowerCase()
  );

  if (isDuplicate) {
    return res.status(400).json({ error: "This exact memory was already submitted! Search for your memory on the wall." });
  }

  // Assign a beautiful organic style variant
  const bgColorsList = ["bg-amber-50", "bg-emerald-50", "bg-sky-50", "bg-purple-50", "bg-rose-50", "bg-yellow-50", "bg-stone-50", "bg-orange-50", "bg-lime-50"];
  const borderColorsList = ["border-amber-200", "border-emerald-200", "border-sky-200", "border-purple-200", "border-rose-200", "border-yellow-200", "border-stone-200", "border-orange-200", "border-lime-200"];
  const textColorsList = ["text-amber-900", "text-emerald-900", "text-sky-900", "text-purple-900", "text-rose-900", "text-yellow-900", "text-stone-900", "text-orange-900", "text-emerald-950"];
  
  const bgIndex = bgColor ? bgColorsList.indexOf(bgColor) : Math.floor(Math.random() * bgColorsList.length);
  const selectedBg = bgIndex >= 0 ? bgColorsList[bgIndex] : bgColorsList[0];
  const selectedBorder = bgIndex >= 0 ? borderColorsList[bgIndex] : borderColorsList[0];
  const selectedText = bgIndex >= 0 ? textColorsList[bgIndex] : textColorsList[0];

  const rotation = (Math.random() * 4) - 2; // slight shift between -2deg and 2deg for yearbook sticker feel
  const styleVariants = ["font-handwritten", "font-sans", "font-display"];
  const selectedFont = fontStyle && styleVariants.includes(fontStyle) ? fontStyle : styleVariants[Math.floor(Math.random() * styleVariants.length)];

  const newSignature: Signature = {
    id: "fuo-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    name: name.trim().substring(0, 50),
    graduation_year,
    department_optional: (department_optional || "").trim().substring(0, 50),
    message: message.trim(),
    created_at: new Date().toISOString(),
    status: "approved", // Auto-approved by default for high visual responsiveness, with moderation filter and flagging!
    style_variant: {
      bgColor: selectedBg,
      textColor: selectedText,
      rotation: parseFloat(rotation.toFixed(2)),
      fontStyle: selectedFont,
      borderStyle: selectedBorder
    },
    country_optional: (country_optional || "Nigeria").trim().substring(0, 50)
  };

  signatures.push(newSignature);
  saveSignatures(signatures);

  res.status(201).json({ success: true, entry: newSignature });
});

// 3. Flag / Report a signature
app.post("/api/signatures/:id/report", (req, res) => {
  const { id } = req.params;
  const signatures = loadSignatures();
  const index = signatures.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Signature not found." });
  }

  // Set status as flagged or add reports counter
  signatures[index].status = "flagged";
  saveSignatures(signatures);

  res.json({ success: true, message: "Thank you. This memory has been flagged for admin review." });
});

// 4. Commemorative Metrics api
app.get("/api/metrics", (req, res) => {
  const signatures = loadSignatures();
  const approved = signatures.filter(s => s.status === "approved" || s.status === "flagged");

  // Represented years set
  const sets = new Set(approved.map(s => s.graduation_year));
  
  // Total sets represented (calculating unique ones matching 'Class of')
  const classSets = [...sets].filter(y => y.startsWith("Class of"));

  // Country counting
  const countries = new Set(approved.map(s => s.country_optional || "Nigeria"));

  // Departments represented (non-empty)
  const departments = [...new Set(approved.map(s => s.department_optional).filter(Boolean))];

  res.json({
    totalSignatures: approved.length,
    setsCount: classSets.length || 1, // list has at least some class entries
    deptCount: departments.length || 1,
    countriesCount: countries.size || 1,
    newest: approved.slice(-3).reverse() // final visual entries
  });
});

// ADMIN ROUTES

// A. Verify admin password
app.post("/api/admin/verify", (req, res) => {
  const { password } = req.body;
  const truePassword = process.env.ADMIN_PASSWORD || "fuo20admin";
  if (password === truePassword) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "Invalid admin key. Try 'fuo20admin'." });
});

// B. Load all items for admin
app.get("/api/admin/signatures", (req, res) => {
  const password = req.headers["x-admin-token"] as string;
  if (password !== (process.env.ADMIN_PASSWORD || "fuo20admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const signatures = loadSignatures();
  res.json(signatures);
});

// C. Update status (approve/flag/unflag)
app.put("/api/admin/signatures/:id", (req, res) => {
  const password = req.get("x-admin-token");
  if (password !== (process.env.ADMIN_PASSWORD || "fuo20admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'pending' | 'flagged'

  if (!["approved", "pending", "flagged"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const signatures = loadSignatures();
  const index = signatures.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Signature not found." });
  }

  signatures[index].status = status;
  saveSignatures(signatures);

  res.json({ success: true, item: signatures[index] });
});

// D. Delete a signature node entirely
app.delete("/api/admin/signatures/:id", (req, res) => {
  const password = req.get("x-admin-token");
  if (password !== (process.env.ADMIN_PASSWORD || "fuo20admin")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const signatures = loadSignatures();
  const filtered = signatures.filter(s => s.id !== id);

  if (signatures.length === filtered.length) {
    return res.status(404).json({ error: "Signature not found." });
  }

  saveSignatures(filtered);
  res.json({ success: true, message: "Signature deleted successfully." });
});

// VITE MIDDLEWARE INTERACTION (For development vs production runtime build systems)
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      // In Express 4, use app.get('*', ...)
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FUO @20 Signature Wall server running on port ${PORT}`);
  });
};

startServer();
