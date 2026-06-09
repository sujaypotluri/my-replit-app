import { Bell, Search, Menu } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: health } = useHealthCheck({ query: { enabled: true, queryKey: ['/api/healthz'] } });

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-6 gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden shrink-0 p-2 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search operations, clients, licenses..."
            className="pl-9 bg-muted/30 border-muted-border focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-full h-9 text-sm"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* System status — hidden on xs */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 border border-border/50 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            {health?.status === 'ok' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
            )}
          </span>
          <span className={health?.status === 'ok' ? "text-primary" : "text-destructive"}>
            SYS {health?.status === 'ok' ? 'NOMINAL' : 'ERROR'}
          </span>
        </div>

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border border-background" />
        </button>

        <div className="hidden sm:block w-px h-6 bg-border/50" />

        <Avatar className="h-8 w-8 ring-1 ring-border cursor-pointer hover:ring-primary/50 transition-all">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">OP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
