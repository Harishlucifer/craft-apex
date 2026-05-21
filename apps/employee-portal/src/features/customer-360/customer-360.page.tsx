import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  CreditCard,
  History,
  Loader2,
  Phone,
  Search,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import {
  Badge,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@craft-apex/ui";
import {
  useCustomer360,
  type OtherRelationshipPerson,
  type PastApplication,
} from "./customer-360.api";

/**
 * Customer 360 view. Legacy
 * `craft-frontend/src/Components/LOS/Customer360Relationship.js` is 580 LOC
 * but most of the tabs (Fixed Deposits, Credit Cards, Insurance) are
 * hard-coded mock cards. Only the API-driven sections are ported:
 *   - Profile header
 *   - Summary cards (CASA, FD value, loans, cards, insurance counts)
 *   - Loans tab (placeholder — depends on LoanDetails sub-component)
 *   - Other Relationships tab (co-applicants + entity users)
 *   - Past Applications tab
 */
export default function Customer360Page() {
  const { id } = useParams<{ id?: string }>();
  const [mobileInput, setMobileInput] = useState(id ?? "");
  const [searchMobile, setSearchMobile] = useState(id ?? "");
  const { data, isLoading, error } = useCustomer360(searchMobile || undefined);

  const profile = data?.customerProfile;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Customer 360
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {!id && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchMobile(mobileInput.trim());
          }}
          className="flex max-w-md items-center gap-2"
        >
          <Input
            value={mobileInput}
            onChange={(e) => setMobileInput(e.target.value)}
            placeholder="Enter customer mobile number"
            inputMode="numeric"
          />
          <Button type="submit" size="sm">
            <Search className="h-4 w-4" /> Look up
          </Button>
        </form>
      )}

      {!searchMobile && (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-500">
          Enter a mobile number above to load the customer 360 view.
        </div>
      )}

      {searchMobile && isLoading && (
        <div className="flex h-40 items-center justify-center text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}

      {searchMobile && error && !isLoading && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error instanceof Error
            ? error.message
            : "Failed to load customer details."}
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* Profile header */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-[#1E2A6B] px-6 py-4 text-white">
              <h2 className="text-lg font-semibold">
                {profile?.username ?? "Customer Profile"}
              </h2>
              <Badge className="bg-white/15 text-white">Preferred Customer</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
              <ProfileField label="CIF ID" value={profile?.userId ?? "—"} />
              <ProfileField label="Created" value={profile?.createdAt ?? "—"} />
              <ProfileField label="KYC Status" value={data.kycStatus ?? "—"} />
              <ProfileField
                label="Last KYC Update"
                value={data.lastKycUpdate ?? "—"}
              />
              <ProfileField
                label="Re-KYC Due"
                value={data.reKycDueDate ?? "—"}
              />
              <ProfileField
                label="KYC Risk Rating"
                value={data.kycRiskRating ?? "—"}
              />
              <ProfileField label="Mobile" value={profile?.mobile ?? "—"} />
              <ProfileField label="Email" value={profile?.email ?? "—"} />
            </dl>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <SummaryCard
              icon={<Wallet className="h-5 w-5" />}
              label="CASA Balance"
              value={data.casaBalance ?? "—"}
              tone="emerald"
            />
            <SummaryCard
              icon={<Banknote className="h-5 w-5" />}
              label="FD Value"
              value={data.fdValue ?? "—"}
              tone="sky"
            />
            <SummaryCard
              icon={<CreditCard className="h-5 w-5" />}
              label="Active Loans"
              value={
                data.loans?.length
                  ? `${data.loans.length} Loans`
                  : "0 Loans"
              }
              tone="amber"
            />
            <SummaryCard
              icon={<CreditCard className="h-5 w-5" />}
              label="Credit Cards"
              value={data.creditCards ?? "—"}
              tone="rose"
            />
            <SummaryCard
              icon={<Shield className="h-5 w-5" />}
              label="Insurance"
              value={data.insurancePolicies ?? "—"}
              tone="indigo"
            />
          </div>

          {/* Tabs (API-driven only) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Tabs defaultValue="relationships">
              <TabsList>
                <TabsTrigger value="relationships">
                  <Users className="h-3.5 w-3.5" /> Relationships
                </TabsTrigger>
                <TabsTrigger value="past-apps">
                  <History className="h-3.5 w-3.5" /> Past Applications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="relationships" className="space-y-5 pt-4">
                <RelationshipsSection
                  title="Co-Applicants / Guarantors"
                  rows={data.otherRelationships?.coapplicants ?? []}
                />
                <RelationshipsSection
                  title="Entity Users / Shareholders"
                  rows={data.otherRelationships?.entityUsers ?? []}
                />
              </TabsContent>

              <TabsContent value="past-apps" className="space-y-3 pt-4">
                <PastApplications rows={data.pastApplications ?? []} />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: "emerald" | "sky" | "amber" | "rose" | "indigo";
}

function SummaryCard({ icon, label, value, tone }: SummaryCardProps) {
  const classes: Record<SummaryCardProps["tone"], string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span className={`rounded-md p-2 ${classes[tone]}`}>{icon}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function RelationshipsSection({
  title,
  rows,
}: {
  title: string;
  rows: OtherRelationshipPerson[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm italic text-slate-500">
          No {title.toLowerCase()} found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {rows.map((row, i) => (
            <div
              key={`${row.name}-${i}`}
              className="rounded-md border border-slate-200 bg-slate-50/40 p-3"
            >
              <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <BadgeCheck className="h-3 w-3" />
                {row.applicantType ?? row.type ?? "Person"}
              </div>
              <p className="text-sm font-semibold text-slate-900">{row.name}</p>
              <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-slate-600">
                <span>
                  <Phone className="mr-1 inline h-3 w-3" />
                  {row.mobile ?? "—"}
                </span>
                <span>App: {row.applicationCode ?? "NA"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PastApplications({ rows }: { rows: PastApplication[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm italic text-slate-500">No past applications found.</p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {rows.map((app, i) => {
        const tone =
          String(app.status) === "1"
            ? "bg-amber-100 text-amber-700"
            : String(app.status) === "5"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-sky-100 text-sky-700";
        const label =
          app.loanStatus ??
          (String(app.status) === "1"
            ? "In Progress"
            : String(app.status) === "5"
              ? "Disbursed"
              : "Submitted");
        return (
          <div
            key={`${app.code}-${i}`}
            className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Application — {app.code ?? "—"}
              </span>
              <Badge className={`text-[10px] uppercase tracking-wide ${tone}`}>
                {label}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-slate-400">Loan Amount</p>
                <p className="font-semibold text-slate-800">
                  ₹ {typeof app.loanAmount === "number" ? app.loanAmount.toLocaleString() : (app.loanAmount ?? "0")}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Created</p>
                <p className="font-semibold text-slate-800">
                  {app.createdAt ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">App ID</p>
                <p className="font-semibold text-slate-800">
                  {app.applicationId ?? "—"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
