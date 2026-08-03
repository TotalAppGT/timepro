"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export function MonthlyChart({ data }: { data: { label: string; completadas: number; creadas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gCompletadas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gCreadas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
        <Tooltip />
        <Area type="monotone" dataKey="creadas" name="Creadas" stroke="#0ea5e9" fill="url(#gCreadas)" strokeWidth={2} />
        <Area type="monotone" dataKey="completadas" name="Completadas" stroke="#0d9488" fill="url(#gCompletadas)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "#0ea5e9",
  EN_PROGRESO: "#f59e0b",
  COMPLETADO: "#10b981",
  CANCELADO: "#f43f5e",
};

export function StatusPie({ data }: { data: { name: string; value: number; status: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}>
          {data.map((entry, i) => (
            <Cell key={i} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
