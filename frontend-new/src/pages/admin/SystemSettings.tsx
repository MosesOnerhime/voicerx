import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store";
import { Settings, Bell, Lock, Database, Globe, Palette, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";

interface SettingsData {
  notifications: {
    emailNotifications: boolean;
    securityAlerts: boolean;
    staffUpdates: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: string;
    passwordPolicy: string;
  };
  regional: {
    timezone: string;
    dateFormat: string;
  };
  data: {
    autoBackup: boolean;
    dataRetention: string;
  };
}

const defaultSettings: SettingsData = {
  notifications: {
    emailNotifications: true,
    securityAlerts: true,
    staffUpdates: false,
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: "30",
    passwordPolicy: "strong",
  },
  regional: {
    timezone: "wat",
    dateFormat: "dmy",
  },
  data: {
    autoBackup: true,
    dataRetention: "90",
  },
};

const SystemSettings = () => {
  const { toast } = useToast();
  const { token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings || defaultSettings);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully.",
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof SettingsData["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updateSecurity = (key: keyof SettingsData["security"], value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [key]: value },
    }));
  };

  const updateRegional = (key: keyof SettingsData["regional"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      regional: { ...prev.regional, [key]: value },
    }));
  };

  const updateData = (key: keyof SettingsData["data"], value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your healthcare management system
          </p>
        </div>

        {/* Notifications Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for important events
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.emailNotifications}
                onCheckedChange={(checked) => updateNotification("emailNotifications", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security-alerts" className="font-medium">
                  Security Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified of security-related activities
                </p>
              </div>
              <Switch
                id="security-alerts"
                checked={settings.notifications.securityAlerts}
                onCheckedChange={(checked) => updateNotification("securityAlerts", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="staff-updates" className="font-medium">
                  Staff Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when staff status changes
                </p>
              </div>
              <Switch
                id="staff-updates"
                checked={settings.notifications.staffUpdates}
                onCheckedChange={(checked) => updateNotification("staffUpdates", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor" className="font-medium">
                  Two-Factor Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin users
                </p>
              </div>
              <Switch
                id="two-factor"
                checked={settings.security.twoFactorAuth}
                onCheckedChange={(checked) => updateSecurity("twoFactorAuth", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Auto-logout after inactivity
                </p>
              </div>
              <Select
                value={settings.security.sessionTimeout}
                onValueChange={(value) => updateSecurity("sessionTimeout", value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Password Policy</Label>
                <p className="text-sm text-muted-foreground">
                  Minimum password requirements
                </p>
              </div>
              <Select
                value={settings.security.passwordPolicy}
                onValueChange={(value) => updateSecurity("passwordPolicy", value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="strong">Strong</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Regional Settings</CardTitle>
            </div>
            <CardDescription>
              Configure timezone and localization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Timezone</Label>
                <p className="text-sm text-muted-foreground">
                  System timezone for scheduling
                </p>
              </div>
              <Select
                value={settings.regional.timezone}
                onValueChange={(value) => updateRegional("timezone", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wat">West Africa Time (WAT)</SelectItem>
                  <SelectItem value="est">Eastern Time (ET)</SelectItem>
                  <SelectItem value="cst">Central Time (CT)</SelectItem>
                  <SelectItem value="gmt">GMT/UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Date Format</Label>
                <p className="text-sm text-muted-foreground">
                  Display format for dates
                </p>
              </div>
              <Select
                value={settings.regional.dateFormat}
                onValueChange={(value) => updateRegional("dateFormat", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data & Storage</CardTitle>
            </div>
            <CardDescription>
              Manage data backup and storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup" className="font-medium">
                  Automatic Backups
                </Label>
                <p className="text-sm text-muted-foreground">
                  Daily automated database backups
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={settings.data.autoBackup}
                onCheckedChange={(checked) => updateData("autoBackup", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Data Retention</Label>
                <p className="text-sm text-muted-foreground">
                  How long to keep audit logs
                </p>
              </div>
              <Select
                value={settings.data.dataRetention}
                onValueChange={(value) => updateData("dataRetention", value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" className="px-8" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>
  );
};

export default SystemSettings;
