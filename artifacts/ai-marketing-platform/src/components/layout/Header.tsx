import { Bell, Search, Zap } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { data: health } = useHealthCheck({ query: { enabled: true, queryKey: ['/api/healthz'] } });

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 max-w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search operations, clients, licenses..." 
            className="pl-9 bg-muted/30 border-muted-border focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-full h-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 border border-border/50 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            {health?.status === 'ok' ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            )}
          </span>
          <span className={health?.status === 'ok' ? "text-primary" : "text-destructive"}>
            SYS {health?.status === 'ok' ? 'NOMINAL' : 'ERROR'}
          </span>
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border border-background"></span>
        </button>
        
        <div className="w-px h-6 bg-border/50 mx-2"></div>
        
        <Avatar className="h-8 w-8 ring-1 ring-border cursor-pointer hover:ring-primary/50 transition-all">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">OP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}