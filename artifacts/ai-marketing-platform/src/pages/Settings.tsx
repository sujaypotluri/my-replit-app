import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Shield, Bell, Zap } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight drop-shadow-[0_0_15px_rgba(0,255,240,0.1)]">Platform Configuration</h1>
          <p className="text-muted-foreground">Global settings, thresholds, and system behavior.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-[0_0_15px_rgba(0,255,240,0.3)]">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <Card className="bg-card/50 backdrop-blur border-border/50 border-l-2 border-l-primary cursor-pointer hover:bg-muted/20 transition-colors">
            <CardContent className="p-4 flex gap-3 items-center">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium text-sm">System Parameters</h3>
                <p className="text-xs text-muted-foreground">Thresholds & Automation</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-transparent border-transparent cursor-pointer hover:bg-muted/20 transition-colors">
            <CardContent className="p-4 flex gap-3 items-center opacity-70">
              <Shield className="w-5 h-5" />
              <div>
                <h3 className="font-medium text-sm">Security & Access</h3>
                <p className="text-xs text-muted-foreground">SSO, Policies</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-transparent border-transparent cursor-pointer hover:bg-muted/20 transition-colors">
            <CardContent className="p-4 flex gap-3 items-center opacity-70">
              <Bell className="w-5 h-5" />
              <div>
                <h3 className="font-medium text-sm">Notifications</h3>
                <p className="text-xs text-muted-foreground">Alerts & Routing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading text-lg tracking-tight">Seat Lifecycle Automation</CardTitle>
              <CardDescription>Configure how the system handles inactive and at-risk licenses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="inactivity-threshold" className="text-foreground">Global Inactivity Threshold (Days)</Label>
                  <p className="text-xs text-muted-foreground">Seats inactive for this many days will be flagged as "At Risk".</p>
                  <Input 
                    id="inactivity-threshold" 
                    type="number" 
                    defaultValue="14" 
                    className="w-32 bg-muted/30 border-border/50 focus-visible:ring-primary/50" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="space-y-1">
                    <Label className="text-foreground">Auto-Release Inactive Seats</Label>
                    <p className="text-xs text-muted-foreground">Automatically revoke access if inactivity continues 7 days past threshold.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="space-y-1">
                    <Label className="text-foreground">Client Overage Protection</Label>
                    <p className="text-xs text-muted-foreground">Prevent clients from assigning seats beyond their hard limit.</p>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-lg border-destructive/20">
            <CardHeader>
              <CardTitle className="font-heading text-lg tracking-tight text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Purge Orphaned Seats</Label>
                  <p className="text-xs text-muted-foreground">Force-release all seats currently in a pending state for {'>'} 30 days.</p>
                </div>
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                  Execute Purge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}