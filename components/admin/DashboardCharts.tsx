'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ChartData {
  visitors: { name: string; count: number }[];
  products: { name: string; views: number }[];
}

export default function DashboardCharts({ data }: { data: ChartData }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
        <div className="bg-bg-secondary rounded-lg animate-pulse border border-border" />
        <div className="bg-bg-secondary rounded-lg animate-pulse border border-border" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Visitor Trend AreaChart */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white tracking-wide uppercase">
            Visitor Activity (Past 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.visitors} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525B" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111111', borderColor: '#1F1F1F', borderRadius: '8px' }}
                labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                itemStyle={{ color: '#2563EB' }}
              />
              <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitor)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products BarChart */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white tracking-wide uppercase">
            Product View Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.products} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
              <XAxis dataKey="name" stroke="#52525B" fontSize={11} tickLine={false} />
              <YAxis stroke="#52525B" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111111', borderColor: '#1F1F1F', borderRadius: '8px' }}
                labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }}
                itemStyle={{ color: '#3B82F6' }}
              />
              <Bar dataKey="views" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
