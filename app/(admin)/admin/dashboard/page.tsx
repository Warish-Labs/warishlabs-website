import React from 'react';
import prisma from '@/lib/prisma';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Briefcase, FolderTree, Mail, MailWarning, UserCheck, Terminal, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';


export default async function AdminDashboardPage() {
  // 1. Fetch KPI Metrics
  const [productCount, categoryCount, subscriberCount, unreadMessagesCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.newsletterSubscriber.count({ where: { active: true } }),
    prisma.contactMessage.count({ where: { status: 'unread' } }),
  ]);

  // 2. Fetch Recent Activities (Logs)
  const recentLogs = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { admin: true },
  });

  // 3. Fetch/Aggregate 7 Days Visitor Trend (Page Views)
  const visitorTrend = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dayLabel = days[date.getDay()];
    
    // Start/End of this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const count = await prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    visitorTrend.push({
      name: dayLabel,
      // If 0, put a small mock value (e.g. 5, 12, 8) in development to show a beautiful chart
      count: count || (process.env.NODE_ENV === 'development' ? Math.floor(Math.sin(i) * 5) + 10 : 0),
    });
  }

  // 4. Fetch/Aggregate Top Viewed Products
  const products = await prisma.product.findMany({ take: 5 });
  const productPerformance = [];
  
  for (const p of products) {
    const count = await prisma.analyticsEvent.count({
      where: {
        eventName: 'product_view',
        eventData: {
          path: ['slug'],
          equals: p.slug,
        },
      },
    });
    productPerformance.push({
      name: p.name.split(' ')[0], // Compact name for chart
      views: count || (process.env.NODE_ENV === 'development' ? Math.floor(Math.random() * 50) + 10 : 0),
    });
  }

  // Provide mock product metrics if database has no products seeded yet
  if (productPerformance.length === 0 && process.env.NODE_ENV === 'development') {
    productPerformance.push(
      { name: 'CloudHost', views: 84 },
      { name: 'Scheduler', views: 56 },
      { name: 'Canvas3D', views: 32 }
    );
  }

  const kpis = [
    { label: 'Products Active', value: productCount, icon: Briefcase, color: 'text-blue-500', link: '/admin/products' },
    { label: 'Categories', value: categoryCount, icon: FolderTree, color: 'text-cyan-500', link: '/admin/categories' },
    { label: 'Active Subscribers', value: subscriberCount, icon: UserCheck, color: 'text-emerald-500', link: '/admin/newsletter' },
    { label: 'Unread Messages', value: unreadMessagesCount, icon: Mail, color: 'text-amber-500', link: '/admin/messages' },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Console Overview
          </h1>
          <p className="text-text-secondary text-sm">
            Operational status and content distribution dashboard.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="glass-panel border-border shadow-card hover:border-accent/20 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                      {kpi.label}
                    </p>
                    <p className="text-3xl font-extrabold text-white">
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-bg-card border border-border ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={kpi.link}
                    className="text-xs text-text-secondary hover:text-accent flex items-center gap-1 transition-colors"
                  >
                    Manage records <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Visualization Section */}
      <DashboardCharts data={{ visitors: visitorTrend, products: productPerformance }} />

      {/* Bottom Section - Logs & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="glass-panel border-border shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white tracking-wide uppercase">
              Recent Console Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <div className="text-center py-6 text-text-tertiary text-sm flex flex-col items-center gap-2">
                  <Terminal className="w-8 h-8 opacity-40" />
                  <p>No operational actions logged yet.</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 border-b border-border-subtle pb-3 last:border-none last:pb-0">
                    <div className="w-8 h-8 rounded bg-bg-card border border-border flex items-center justify-center text-xs font-semibold text-accent shrink-0">
                      {log.admin.name ? log.admin.name.substring(0, 2).toUpperCase() : 'AD'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white">
                        {log.action}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {log.details}
                      </p>
                      <p className="text-[10px] text-text-tertiary">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="glass-panel border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white tracking-wide uppercase">
              Console Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <Link
              href="/admin/products"
              className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border hover:border-accent/20 transition-all text-xs font-semibold text-white"
            >
              <span>Add New Product</span>
              <ArrowUpRight className="w-4 h-4 text-text-tertiary" />
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border hover:border-accent/20 transition-all text-xs font-semibold text-white"
            >
              <span>Compose Blog Post</span>
              <ArrowUpRight className="w-4 h-4 text-text-tertiary" />
            </Link>
            <Link
              href="/admin/homepage"
              className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border hover:border-accent/20 transition-all text-xs font-semibold text-white"
            >
              <span>Modify Hero Section</span>
              <ArrowUpRight className="w-4 h-4 text-text-tertiary" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border hover:border-accent/20 transition-all text-xs font-semibold text-white"
            >
              <span>Console Configurations</span>
              <ArrowUpRight className="w-4 h-4 text-text-tertiary" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
