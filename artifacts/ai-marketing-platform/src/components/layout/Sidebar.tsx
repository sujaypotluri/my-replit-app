import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, BarChart3, Key, Users, Briefcase,
  Activity, MonitorPlay, Settings, ShieldAlert, ChevronsLeft, ChevronsRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Dashboard",     href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics",     href: "/analytics",  icon: BarChart3 },
  { name: "Licenses",      href: "/licenses",   icon: Key },
  { name: "Seats",         href: "/seats",      icon: MonitorPlay },
  { name: "Users",         href: "/users",      icon: Users },
  { name: "Clients",       href: "/clients",    icon: Briefcase },
  { name: "Audit Log",     href: "/audit",      icon: Activity },
  { name: "Client Portal", href: "/portal",     icon: ShieldAlert },
  { name: "Settings",      href: "/settings",   icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  // Desktop collapsed state — persisted in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; }
    catch { return false; }
  });

  const toggle = () => setCollapsed((c) => {
    const next = !c;
    try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
    return next;
  });

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen) onMobileClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const isCollapsed = !isMobile && collapsed;

  const navItems = navigation.map((item) => {
    const isActive = location === item.href || location.startsWith(`${item.href}/`);

    const link = (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-200 text-sm font-medium",
          isCollapsed ? "justify-center" : "",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,255,240,0.08)]"
            : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        )}
      >
        <item.icon
          className={cn(
            "w-4 h-4 shrink-0",
            isActive ? "text-primary drop-shadow-[0_0_8px_rgba(0,255,240,0.5)]" : ""
          )}
        />
        <span
          className={cn(
            "whitespace-nowrap transition-all duration-200 overflow-hidden",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}
        >
          {item.name}
        </span>
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.name}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return link;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "h-14 md:h-16 flex items-center border-b border-sidebar-border/50 shrink-0 overflow-hidden",
          isCollapsed ? "justify-center px-0" : "gap-3 px-6"
        )}
      >
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_12px_rgba(0,255,240,0.15)] shrink-0">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <span
          className={cn(
            "font-heading font-bold text-lg tracking-tight whitespace-nowrap transition-all duration-200 flex-1",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}
        >
          Nexus AI
        </span>
        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems}
      </nav>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <div className="pb-4 px-2 shrink-0">
          <button
            onClick={toggle}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-200",
              isCollapsed ? "justify-center" : ""
            )}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">Collapse</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // ── Mobile: slide-over drawer ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground",
            "transform transition-transform duration-200 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </TooltipProvider>
    );
  }

  // ── Desktop: inline sidebar ────────────────────────────────────────────────
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground z-20",
          "transition-all duration-200 ease-in-out",
          isCollapsed ? "w-[60px]" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>
    </TooltipProvider>
  );
}
