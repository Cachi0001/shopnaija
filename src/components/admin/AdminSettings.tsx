
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminService } from "@/services/AdminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Copy, Check } from "lucide-react";

const AdminSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    website_name: "",
    logo_url: "",
    primary_color: "#1a56db",
    account_name: "",
    account_number: "",
    bank_name: "",
    phone: "",
    location: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        website_name: user.website_name || "",
        logo_url: user.logo_url || "",
        primary_color: user.primary_color || "#1a56db",
        account_name: user.account_name || "",
        account_number: user.account_number || "",
        bank_name: user.bank_name || "",
        phone: user.phone || "",
        location: user.location || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await AdminService.updateAdmin(user!.id, formData);
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (user?.referral_code) {
      await navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyReferralLink = async () => {
    const referralLink = `https://growthsmallbeez.com/signup?ref=${user?.referral_code}`;
    await navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Store Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="website_name">Website Name</Label>
                <Input
                  id="website_name"
                  value={formData.website_name}
                  onChange={(e) => setFormData({...formData, website_name: e.target.value})}
                  placeholder="Your store name"
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                    placeholder="#1a56db"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  placeholder="Account holder name"
                />
              </div>
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  placeholder="First Bank of Nigeria"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Payment Info"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Your Referral Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={user?.referral_code || ""}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyReferralCode}
                  className="px-3"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label>Referral Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={`https://growthsmallbeez.com/signup?ref=${user?.referral_code || ""}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyReferralLink}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Share your referral code with new admin signups</li>
                <li>• You'll receive ₦5,000 discount for each successful referral</li>
                <li>• Maximum discount: ₦25,000</li>
                <li>• Current discount: ₦{user?.referral_discount || 0}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
