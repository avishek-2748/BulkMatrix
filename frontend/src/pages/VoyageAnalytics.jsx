import { useState, useEffect } from "react";
import { getMyCharterContracts } from "../services/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Ship, Package, TrendingUp, Activity,
  CheckCircle, Anchor, ArrowRight, BarChart2
} from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  PENDING: "#D97706",
  ACCEPTED: "#16A34A",
  ACTIVE: "#0B82C9",
  REJECTED: "#DC2626",
};

const STATUS_LABELS = {
  PENDING: "Awaiting Owner",
  ACCEPTED: "Owner Accepted",
  ACTIVE: "On Voyage",
  REJECTED: "Declined",
};

const PIE_COLORS = ["#0B82C9", "#FF7426", "#16A34A", "#7C3AED", "#D97706", "#DC2626"];

const KPICard = ({ title, value, subtitle, icon: Icon, color, bg, trend }) => (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #D9E6EF",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(18, 47, 85, 0.04)",
      transition: "all 0.22s ease",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 8px 24px rgba(18, 47, 85, 0.08)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "0 4px 20px rgba(18, 47, 85, 0.04)";
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#5F7894", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{title}</p>
        <p style={{ fontSize: "34px", fontWeight: 800, color: "#122F55", lineHeight: 1, marginBottom: "8px", letterSpacing: "-0.02em" }}>{value}</p>
        <p style={{ fontSize: "12.5px", color: "#5F7894" }}>{subtitle}</p>
      </div>
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
    </div>
    {trend !== undefined && (
      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F0F7FC", fontSize: "12px", color: trend >= 0 ? "#16A34A" : "#DC2626", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
        <TrendingUp size={13} />
        {trend >= 0 ? "+" : ""}{trend}% vs last month
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#122F55", color: "#fff", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}>
        <p style={{ marginBottom: "4px", color: "#7EC8F4" }}>{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: "#fff" }}>{entry.name}: <strong>{entry.value?.toLocaleString()}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

const VoyageAnalytics = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCharterContracts()
      .then(data => { setContracts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalVoyages = contracts.length;
  const confirmedVoyages = contracts.filter(c => c.status === "ACCEPTED" || c.status === "ACTIVE").length;
  const totalCargo = contracts.reduce((sum, c) => sum + (c.volume || 0), 0);
  const rejectedCount = contracts.filter(c => c.status === "REJECTED").length;
  const successRate = totalVoyages > 0 ? Math.round((confirmedVoyages / totalVoyages) * 100) : 0;

  const statusFunnel = Object.entries(
    contracts.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {})
  ).map(([status, count]) => ({ name: STATUS_LABELS[status] || status, count, status }));

  const commodityMap = contracts.reduce((acc, c) => {
    const key = c.cargoType || "Other";
    acc[key] = (acc[key] || 0) + (c.volume || 0);
    return acc;
  }, {});
  const commodityData = Object.entries(commodityMap).map(([name, value]) => ({ name, value }));

  const portMap = contracts.reduce((acc, c) => {
    const key = c.originPort || "Unknown";
    acc[key] = (acc[key] || 0) + (c.volume || 0);
    return acc;
  }, {});
  const portData = Object.entries(portMap)
    .map(([port, tonnes]) => ({ port: port.length > 12 ? port.slice(0, 12) + "..." : port, tonnes }))
    .sort((a, b) => b.tonnes - a.tonnes)
    .slice(0, 8);

  const now = new Date();
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const refDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = refDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const slice = contracts.filter(c => {
      if (!c.createdAt) return false;
      const d = new Date(c.createdAt);
      return d.getMonth() === refDate.getMonth() && d.getFullYear() === refDate.getFullYear();
    });
    return { label, tonnes: slice.reduce((s, c) => s + (c.volume || 0), 0), contracts: slice.length };
  });

  const sk = { background: "linear-gradient(90deg,#EAF3F8 25%,#D9EEF6 50%,#EAF3F8 75%)", borderRadius: "10px" };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "56px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "27px", fontWeight: 800, color: "#122F55", letterSpacing: "-0.02em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
            <BarChart2 size={26} color="#0B82C9" /> Voyage Analytics
          </h1>
          <p style={{ fontSize: "14px", color: "#5F7894" }}>Cargo volume trends, contract funnel, and route distribution across all your voyages</p>
        </div>
        <Link to="/contracts" style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#0B82C9", color: "#FFFFFF", padding: "10px 20px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(11,130,201,0.25)" }}>
          View All Bookings <ArrowRight size={16} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px", marginBottom: "28px" }}>
        {loading ? [1,2,3,4].map(i => <div key={i} style={{ ...sk, height: "140px" }} />) : (
          <>
            <KPICard title="Total Voyages" value={totalVoyages} subtitle="All charter requests" icon={Ship} color="#0B82C9" bg="#EAF6FC" />
            <KPICard title="Confirmed & Active" value={confirmedVoyages} subtitle="Accepted or on voyage" icon={CheckCircle} color="#16A34A" bg="#DCFCE7" trend={confirmedVoyages > 0 ? 12 : 0} />
            <KPICard title="Total Cargo Volume" value={`${(totalCargo / 1000).toFixed(1)}kt`} subtitle="Across all voyages" icon={Package} color="#FF7426" bg="#FFF1E8" />
            <KPICard title="Booking Success Rate" value={`${successRate}%`} subtitle={`${rejectedCount} declined`} icon={Activity} color="#7C3AED" bg="#EDE9FE" />
          </>
        )}
      </div>

      {/* Row 1: Monthly Trend + Status Funnel */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #D9E6EF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(18,47,85,0.04)" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#7890A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Monthly Trend</p>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#122F55", marginBottom: "20px" }}>Cargo Volume (Tonnes) vs Contracts</h3>
          {loading ? <div style={{ ...sk, height: "220px" }} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gTonnes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B82C9" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#0B82C9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gContracts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7426" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#FF7426" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EAF3F8" strokeDasharray="4 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7890A8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#7890A8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tonnes" name="Tonnes" stroke="#0B82C9" strokeWidth={2.5} fill="url(#gTonnes)" dot={{ r: 4, fill: "#0B82C9" }} />
                <Area type="monotone" dataKey="contracts" name="Contracts" stroke="#FF7426" strokeWidth={2.5} fill="url(#gContracts)" dot={{ r: 4, fill: "#FF7426" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #D9E6EF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(18,47,85,0.04)" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#7890A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Contract Funnel</p>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#122F55", marginBottom: "20px" }}>Status Breakdown</h3>
          {loading ? <div style={{ ...sk, height: "220px" }} /> : statusFunnel.length === 0 ? (
            <div style={{ height: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#7890A8" }}>
              <Ship size={36} color="#D9E6EF" />
              <p style={{ fontSize: "13px", marginTop: "12px" }}>No contracts yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {statusFunnel.map(item => {
                const color = STATUS_COLORS[item.status] || "#7890A8";
                const pct = totalVoyages > 0 ? Math.round((item.count / totalVoyages) * 100) : 0;
                return (
                  <div key={item.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#122F55" }}>{item.name}</span>
                      <span style={{ fontSize: "13px", fontWeight: 800, color }}>{item.count} <span style={{ color: "#7890A8", fontWeight: 600 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ background: "#EAF3F8", borderRadius: "99px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "99px", transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Origin Port Bar + Commodity Pie */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #D9E6EF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(18,47,85,0.04)" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#7890A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Route Intelligence</p>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#122F55", marginBottom: "20px" }}>Cargo Volume by Origin Port</h3>
          {loading ? <div style={{ ...sk, height: "240px" }} /> : portData.length === 0 ? (
            <div style={{ height: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#7890A8" }}>
              <Anchor size={36} color="#D9E6EF" />
              <p style={{ fontSize: "13px", marginTop: "12px" }}>No route data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={portData} barCategoryGap="30%">
                <CartesianGrid stroke="#EAF3F8" strokeDasharray="4 3" vertical={false} />
                <XAxis dataKey="port" tick={{ fontSize: 11, fill: "#7890A8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#7890A8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tonnes" name="Tonnes" radius={[6, 6, 0, 0]}>
                  {portData.map((_, i) => <Cell key={i} fill={i === 0 ? "#0B82C9" : i === 1 ? "#168FD0" : "#41A8DC"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #D9E6EF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(18,47,85,0.04)" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#7890A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Cargo Mix</p>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#122F55", marginBottom: "20px" }}>Commodity Distribution</h3>
          {loading ? <div style={{ ...sk, height: "200px" }} /> : commodityData.length === 0 ? (
            <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#7890A8" }}>
              <Package size={36} color="#D9E6EF" />
              <p style={{ fontSize: "13px", marginTop: "12px" }}>No commodity data</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={commodityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {commodityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v?.toLocaleString()}t`, "Volume"]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                {commodityData.map((item, i) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#122F55" }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: "12px", color: "#5F7894", fontWeight: 700 }}>{item.value?.toLocaleString()}t</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Contracts Table */}
      <div style={{ background: "#FFFFFF", border: "1px solid #D9E6EF", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(18,47,85,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#7890A8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Transaction Log</p>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#122F55", margin: 0 }}>Recent Charter Contracts</h3>
          </div>
          <Link to="/contracts" style={{ fontSize: "13px", color: "#0B82C9", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? <div style={{ ...sk, height: "200px" }} /> : contracts.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#7890A8" }}>
            <Ship size={40} color="#D9E6EF" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 600 }}>No contracts yet. Start a charter plan to see voyages here.</p>
            <Link to="/planner" style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px", background: "#0B82C9", color: "#fff", padding: "8px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
              Open Charter Planner <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #EAF3F8" }}>
                  {["Contract ID", "Cargo / Volume", "Route", "Owner", "Laycan", "Status"].map(col => (
                    <th key={col} style={{ textAlign: "left", padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "#7890A8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.slice(0, 10).map((c, i) => (
                  <tr key={c._id} style={{ borderBottom: "1px solid #F0F7FC", background: i % 2 === 0 ? "#FFFFFF" : "#FAFCFE", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#EAF6FC"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#FFFFFF" : "#FAFCFE"}>
                    <td style={{ padding: "13px 14px", fontSize: "13px", fontWeight: 700, color: "#122F55" }}>#{c._id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#122F55" }}>{c.cargoType}</span><br />
                      <span style={{ fontSize: "11.5px", color: "#7890A8" }}>{c.volume?.toLocaleString()} MT</span>
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: "13px", color: "#122F55" }}>
                      <span style={{ fontWeight: 700 }}>{c.originPort}</span>
                      <span style={{ color: "#7890A8" }}> to {c.destinationPort}</span>
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: "13px", color: "#5F7894", fontWeight: 600 }}>{c.vesselOwnerId?.company || c.vesselOwnerId?.name || "-"}</td>
                    <td style={{ padding: "13px 14px", fontSize: "12px", color: "#5F7894" }}>
                      {c.arrivalWindowStart ? new Date(c.arrivalWindowStart).toLocaleDateString("en-US", { day: "2-digit", month: "short" }) : "Immediate"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: (STATUS_COLORS[c.status] || "#7890A8") + "20", color: STATUS_COLORS[c.status] || "#7890A8", border: `1px solid ${STATUS_COLORS[c.status] || "#7890A8"}40` }}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoyageAnalytics;
