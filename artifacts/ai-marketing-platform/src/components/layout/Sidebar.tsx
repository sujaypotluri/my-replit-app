import { Link, useLocation } from "wouter";
import { LayoutDashboard, BarChart3, Key, Users, Briefcase, Activity, MonitorPlay, Settings, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Licenses', href: '/licenses', icon: Key },
  { name: 'Seats', href: '/seats', icon: MonitorPlay },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Clients', href: '/clients', icon: Briefcase },
  { name: 'Audit Log', href: '/audit', icon: Activity },
  { name: 'Client Portal', href: '/portal', icon: ShieldAlert },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground z-20">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border/50">
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_12px_rgba(0,255,240,0.15)]">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <span className="font-heading font-bold text-lg tracking-tight">Nexus AI</span>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href || location.startsWith(`${item.href}/`);
          return (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,255,240,0.08)]" 
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            )}>
              <item.icon className={cn("w-4 h-4", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,240,0.5)]" : "")} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  );
}