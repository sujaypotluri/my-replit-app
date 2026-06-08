import { useGetUsers, getGetUsersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, RoleBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, MoreHorizontal, Mail, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Users() {
  const { data: users, isLoading } = useGetUsers({}, {
    query: {
      queryKey: getGetUsersQueryKey({}),
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">Directory</h1>
          <p className="text-muted-foreground">Manage user access, roles, and status across all clients.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border/50 bg-card/50 hover:bg-muted">
            <Mail className="w-4 h-4 mr-2" />
            Bulk Invite
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-[0_0_15px_rgba(0,255,240,0.3)]">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-9 bg-card/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="border-border/50 bg-card/50">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/50">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Client / Dept</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(7).fill(0).map((_, i) => (
                <TableRow key={i} className="border-border/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : users?.map((user) => (
              <TableRow key={user.id} className="border-border/50 hover:bg-muted/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                      <span className="text-xs font-bold text-muted-foreground">{user.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{user.clientName || 'Internal'}</div>
                  {user.departmentName && <div className="text-xs text-muted-foreground">{user.departmentName}</div>}
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}