import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Download
} from "lucide-react";
import { formatCurrency } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

export interface Vendor {
  id: string;
  name: string;
  tradeName: string;
  category: "IT & Hardware" | "Field Logistics" | "Training & Labs" | "Civil Works" | "Professional Services";
  gstin: string;
  pan: string;
  isMsme: boolean;
  msmeRegNo?: string;
  bankAccount: string;
  ifsc: string;
  bankName: string;
  paymentTerms: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: "Empaneled" | "Under Verification" | "Review Required";
  complianceScore: number;
  ytdSpend: number; // in Lakhs
  activeContracts: number;
}

const initialVendors: Vendor[] = [
  {
    id: "VND-2026-001",
    name: "Zenith Digital & Hardware Labs Pvt Ltd",
    tradeName: "Zenith Labs",
    category: "IT & Hardware",
    gstin: "21AAACZ4819M1Z8",
    pan: "AAACZ4819M",
    isMsme: true,
    msmeRegNo: "UDYAM-OD-19-0018429",
    bankAccount: "91802004819201",
    ifsc: "UTIB0000119",
    bankName: "Axis Bank",
    paymentTerms: "Net 30 Days",
    contactPerson: "Rajesh Mohanty",
    email: "procurement@zenithlabs.in",
    phone: "+91 94370 28194",
    location: "Bhubaneswar, Odisha",
    status: "Empaneled",
    complianceScore: 99,
    ytdSpend: 48.6,
    activeContracts: 3
  },
  {
    id: "VND-2026-002",
    name: "Kalinga Agro & Rural Logistics Ltd",
    tradeName: "Kalinga Logistics",
    category: "Field Logistics",
    gstin: "21AABCK9921B1ZD",
    pan: "AABCK9921B",
    isMsme: true,
    msmeRegNo: "UDYAM-OD-04-0092184",
    bankAccount: "389201940182",
    ifsc: "SBIN0001042",
    bankName: "State Bank of India",
    paymentTerms: "Net 15 Days",
    contactPerson: "Bikash Pattnaik",
    email: "operations@kalingalogistics.com",
    phone: "+91 98610 49102",
    location: "Cuttack, Odisha",
    status: "Empaneled",
    complianceScore: 97,
    ytdSpend: 34.2,
    activeContracts: 4
  },
  {
    id: "VND-2026-003",
    name: "Pratham Skill & Vocational Pedagogy LLP",
    tradeName: "Pratham Vocational",
    category: "Training & Labs",
    gstin: "21AAHCP1829L1Z2",
    pan: "AAHCP1829L",
    isMsme: true,
    msmeRegNo: "UDYAM-OD-19-0034812",
    bankAccount: "50200049182910",
    ifsc: "HDFC0000284",
    bankName: "HDFC Bank",
    paymentTerms: "Milestone-based",
    contactPerson: "Dr. Ananya Dash",
    email: "academic@prathamskills.org",
    phone: "+91 97760 12849",
    location: "Rourkela, Odisha",
    status: "Empaneled",
    complianceScore: 100,
    ytdSpend: 82.5,
    activeContracts: 6
  },
  {
    id: "VND-2026-004",
    name: "Eastern GeoTech & Community Infrastructure",
    tradeName: "GeoTech Infra",
    category: "Civil Works",
    gstin: "21AACCE4810K1ZT",
    pan: "AACCE4810K",
    isMsme: false,
    bankAccount: "004205008192",
    ifsc: "ICIC0000042",
    bankName: "ICICI Bank",
    paymentTerms: "Progressive Billed",
    contactPerson: "Er. Subrat Rout",
    email: "contracts@geotechinfra.com",
    phone: "+91 94371 88392",
    location: "Koraput, Odisha",
    status: "Empaneled",
    complianceScore: 95,
    ytdSpend: 62.0,
    activeContracts: 2
  },
  {
    id: "VND-2026-005",
    name: "Kreston & Co Statutory Auditors & Tax Advisory",
    tradeName: "Kreston Advisory",
    category: "Professional Services",
    gstin: "21AAGCK3910F1ZU",
    pan: "AAGCK3910F",
    isMsme: true,
    msmeRegNo: "UDYAM-OD-19-0010921",
    bankAccount: "00192003819201",
    ifsc: "KKBK0000481",
    bankName: "Kotak Mahindra Bank",
    paymentTerms: "Quarterly Retainer",
    contactPerson: "CA Manoj Agrawal",
    email: "manoj@krestonadvisory.in",
    phone: "+91 99370 41829",
    location: "Bhubaneswar, Odisha",
    status: "Empaneled",
    complianceScore: 100,
    ytdSpend: 18.0,
    activeContracts: 2
  },
  {
    id: "VND-2026-006",
    name: "Sunbeam Energy & Solar Offgrid Systems",
    tradeName: "Sunbeam Solar",
    category: "Civil Works",
    gstin: "21AABCS2918P1Z6",
    pan: "AABCS2918P",
    isMsme: true,
    msmeRegNo: "UDYAM-OD-12-0048192",
    bankAccount: "49102910491820",
    ifsc: "PUNB0029100",
    bankName: "Punjab National Bank",
    paymentTerms: "30% Advance, 70% GRN",
    contactPerson: "Santosh Behera",
    email: "info@sunbeamsolar.in",
    phone: "+91 98530 29184",
    location: "Sambalpur, Odisha",
    status: "Under Verification",
    complianceScore: 88,
    ytdSpend: 0,
    activeContracts: 0
  }
];

export function VendorManagementView() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // New Vendor Form State
  const [newName, setNewName] = useState("");
  const [newTradeName, setNewTradeName] = useState("");
  const [newCategory, setNewCategory] = useState<Vendor["category"]>("IT & Hardware");
  const [newGstin, setNewGstin] = useState("");
  const [newPan, setNewPan] = useState("");
  const [newIsMsme, setNewIsMsme] = useState(true);
  const [newMsmeNo, setNewMsmeNo] = useState("");
  const [newBank, setNewBank] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchCategory = categoryFilter === "all" || v.category === categoryFilter;
      const matchStatus = statusFilter === "all" || v.status === statusFilter;
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.tradeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchStatus && matchSearch;
    });
  }, [vendors, categoryFilter, statusFilter, searchQuery]);

  const totalSpend = useMemo(() => {
    return vendors.reduce((acc, curr) => acc + curr.ytdSpend, 0);
  }, [vendors]);

  const msmePercentage = useMemo(() => {
    const msmeCount = vendors.filter((v) => v.isMsme).length;
    return Math.round((msmeCount / vendors.length) * 100);
  }, [vendors]);

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newGstin.trim()) return;

    const newVendor: Vendor = {
      id: `VND-2026-${String(vendors.length + 1).padStart(3, "0")}`,
      name: newName.trim(),
      tradeName: newTradeName.trim() || newName.trim(),
      category: newCategory,
      gstin: newGstin.toUpperCase().trim(),
      pan: newPan.toUpperCase().trim() || newGstin.slice(2, 12).toUpperCase(),
      isMsme: newIsMsme,
      msmeRegNo: newIsMsme ? newMsmeNo.trim() || "UDYAM-OD-PENDING" : undefined,
      bankAccount: newAccount.trim(),
      ifsc: newIfsc.toUpperCase().trim(),
      bankName: newBank.trim(),
      paymentTerms: "Net 30 Days",
      contactPerson: newContact.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      location: newLocation.trim() || "Bhubaneswar, Odisha",
      status: "Empaneled",
      complianceScore: 100,
      ytdSpend: 0,
      activeContracts: 1
    };

    setVendors([newVendor, ...vendors]);
    setShowAddModal(false);
    // reset form
    setNewName("");
    setNewTradeName("");
    setNewGstin("");
    setNewPan("");
    setNewMsmeNo("");
    setNewBank("");
    setNewAccount("");
    setNewIfsc("");
    setNewContact("");
    setNewEmail("");
    setNewPhone("");
    setNewLocation("");
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Users size={13} /> Vendor & Supplier Governance
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Empaneled Vendor Master Directory
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Standardized procurement vendor repository, verified GSTIN/PAN compliance, MSME prioritization, and contract performance tracking.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50"
            >
              <Plus size={15} /> Empanel New Vendor
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Users size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              Verified
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">{vendors.length}</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Empaneled Vendors</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Active suppliers in the master registry</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <BadgeCheck size={18} />
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold text-teal-600">
              {msmePercentage}% of Total
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {vendors.filter((v) => v.isMsme).length} Vendors
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">MSME / Udyam Compliant</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Meets public procurement quota guidelines</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              High Tier
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">98.4%</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Compliance & Filing Rate</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">TDS 26AS matching & GST-3B verified</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <FileText size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              FY 2026-27
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(totalSpend, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">YTD Procurement Disbursed</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Across all project procurement orders</p>
        </article>
      </section>

      {/* Directory & Filter Table */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Building2 size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Active Vendor Master List</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                {filteredVendors.length} of {vendors.length} vendors matched
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, GSTIN, person..."
                className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Categories</option>
              <option value="IT & Hardware">IT & Hardware</option>
              <option value="Field Logistics">Field Logistics</option>
              <option value="Training & Labs">Training & Labs</option>
              <option value="Civil Works">Civil Works</option>
              <option value="Professional Services">Professional Services</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Status</option>
              <option value="Empaneled">Empaneled</option>
              <option value="Under Verification">Under Verification</option>
            </select>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 transition-all hover:border-emerald-500/30 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-600">
                      {vendor.category}
                    </span>
                    <h4 className="mt-2 truncate text-sm font-bold text-[var(--text)]">{vendor.name}</h4>
                    <p className="text-[10px] text-[var(--text-subtle)]">{vendor.id} · {vendor.tradeName}</p>
                  </div>
                  {vendor.isMsme && (
                    <span className="shrink-0 rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[8px] font-bold text-teal-600">
                      MSME
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[var(--module-bg)] p-3 text-[10px]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">GSTIN</span>
                    <p className="font-mono font-medium text-[var(--text)]">{vendor.gstin}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Payment Terms</span>
                    <p className="font-medium text-[var(--text)]">{vendor.paymentTerms}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Bank A/C</span>
                    <p className="font-mono font-medium text-[var(--text)]">•••• {vendor.bankAccount.slice(-4)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Compliance</span>
                    <p className="font-bold text-emerald-600">{vendor.complianceScore}%</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-[10px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-[var(--text-subtle)]" />
                    <span>{vendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-[var(--text-subtle)]" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-[var(--text-subtle)]" />
                    <span>{vendor.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div>
                  <span className="text-[9px] text-[var(--text-subtle)]">YTD Disbursed</span>
                  <p className="text-xs font-bold text-[var(--text)]">{formatCurrency(vendor.ytdSpend, true)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVendor(vendor)}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]"
                >
                  View Details <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Vendor Overlay */}
      {showAddModal && (
        <Overlay
          open
          onClose={() => setShowAddModal(false)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Vendor Registration"
          title="Empanel New Vendor"
          description="Register verified vendors with statutory GST, PAN and bank credentials."
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-[var(--text-subtle)]">Direct statutory verification enabled</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="focus-ring h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-vendor-form"
                  className="focus-ring h-10 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Register & Empanel
                </button>
              </div>
            </div>
          }
        >
          <form id="add-vendor-form" onSubmit={handleAddVendor} className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Legal Entity Name <b className="text-red-500">*</b>
                </label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Utkal Tech Systems Pvt Ltd"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Trade / Brand Name</label>
                <input
                  value={newTradeName}
                  onChange={(e) => setNewTradeName(e.target.value)}
                  placeholder="e.g. Utkal Tech"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                >
                  <option value="IT & Hardware">IT & Hardware</option>
                  <option value="Field Logistics">Field Logistics</option>
                  <option value="Training & Labs">Training & Labs</option>
                  <option value="Civil Works">Civil Works</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  GSTIN (15 Digits) <b className="text-red-500">*</b>
                </label>
                <input
                  required
                  maxLength={15}
                  value={newGstin}
                  onChange={(e) => setNewGstin(e.target.value)}
                  placeholder="e.g. 21AAACU1289M1Z5"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs uppercase font-mono text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">PAN</label>
                <input
                  maxLength={10}
                  value={newPan}
                  onChange={(e) => setNewPan(e.target.value)}
                  placeholder="e.g. AAACU1289M"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs uppercase font-mono text-[var(--text)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">MSME / Udyam Number</label>
                <input
                  value={newMsmeNo}
                  onChange={(e) => setNewMsmeNo(e.target.value)}
                  placeholder="e.g. UDYAM-OD-19-0019284"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Bank Name</label>
                <input
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Account Number</label>
                <input
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  placeholder="e.g. 50200039218"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs font-mono text-[var(--text)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">IFSC Code</label>
                <input
                  maxLength={11}
                  value={newIfsc}
                  onChange={(e) => setNewIfsc(e.target.value)}
                  placeholder="e.g. HDFC0000284"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs uppercase font-mono text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Contact Person</label>
                <input
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="e.g. Soumya Mishra"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. soumya@utkaltech.in"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Phone</label>
                <input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +91 94370 12345"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>
          </form>
        </Overlay>
      )}

      {/* View Vendor Details Overlay */}
      {selectedVendor && (
        <Overlay
          open
          onClose={() => setSelectedVendor(null)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Vendor Dossier"
          title={selectedVendor.name}
          description={`${selectedVendor.id} · ${selectedVendor.tradeName}`}
          footer={
            <button
              type="button"
              onClick={() => setSelectedVendor(null)}
              className="focus-ring h-10 rounded-xl bg-[var(--brand-primary)] px-5 text-xs font-semibold text-white ml-auto"
            >
              Close Dossier
            </button>
          }
        >
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Status</span>
                <p className="mt-1 text-sm font-bold text-emerald-600">{selectedVendor.status}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Compliance Score</span>
                <p className="mt-1 text-sm font-bold text-[var(--text)]">{selectedVendor.complianceScore}%</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">YTD Spend</span>
                <p className="mt-1 text-sm font-bold text-[var(--text)]">{formatCurrency(selectedVendor.ytdSpend, true)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--text)]">Statutory & Tax Credentials</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-subtle)]">GSTIN:</span>
                  <p className="font-mono font-medium text-[var(--text)]">{selectedVendor.gstin}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-subtle)]">PAN:</span>
                  <p className="font-mono font-medium text-[var(--text)]">{selectedVendor.pan}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-subtle)]">MSME Registration:</span>
                  <p className="font-medium text-[var(--text)]">{selectedVendor.msmeRegNo ?? "Non-MSME"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-subtle)]">Payment Terms:</span>
                  <p className="font-medium text-[var(--text)]">{selectedVendor.paymentTerms}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--text)]">Banking & Remittance Channel</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[var(--text-subtle)]">Bank:</span>
                  <p className="font-medium text-[var(--text)]">{selectedVendor.bankName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--text-subtle)]">IFSC:</span>
                  <p className="font-mono font-medium text-[var(--text)]">{selectedVendor.ifsc}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[var(--text-subtle)]">Verified Account Number:</span>
                  <p className="font-mono font-medium text-[var(--text)]">{selectedVendor.bankAccount}</p>
                </div>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
