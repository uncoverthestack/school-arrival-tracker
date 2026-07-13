'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

// Recharts needs the browser to measure itself, so this is split out from the
// (server-rendered) dashboard page into its own client component — the page
// just passes down the already-bucketed data.
export function ArrivalFlowChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-outline-variant)" />
        <XAxis
          dataKey="label"
          interval={2}
          tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 40]}
          ticks={[0, 10, 20, 30, 40]}
          tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-primary)"
          fill="var(--color-primary-container)"
          fillOpacity={1}
          strokeWidth={2}
          dot={{ r: 4, stroke: 'var(--color-primary)', strokeWidth: 2, fill: 'white' }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
