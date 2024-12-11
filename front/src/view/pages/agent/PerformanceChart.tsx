'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { date: '2023-01-01', score: 85 },
  { date: '2023-02-01', score: 88 },
  { date: '2023-03-01', score: 90 },
  { date: '2023-04-01', score: 92 },
  { date: '2023-05-01', score: 89 },
  { date: '2023-06-01', score: 91 },
  { date: '2023-07-01', score: 93 },
]

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="score" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

