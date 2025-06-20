
import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/services/AdminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Users, DollarSign, Copy, Gift } from "lucide-react";

const ReferralTracking = () => {
  const { toast } = useToast();

  // Fetch admins for referral data
  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: AdminService.getAllAdmins,
  });

  const copyReferralLink = (referralCode: string) => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  // Calculate referral stats
  const adminsWithReferrals = admins?.filter(admin => admin.referral_code) || [];
  const totalReferralDiscount = admins?.reduce((sum, admin) => sum + (admin.referral_discount || 0), 0) || 0;
  const adminsWithDiscounts = admins?.filter(admin => (admin.referral_discount || 0) > 0) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Referrers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminsWithReferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Admins with referral codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referral Discounts
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalReferralDiscount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Successful Referrals
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminsWithDiscounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Admins who used referral codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Referral Codes & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Own Discount</TableHead>
                  <TableHead>Referred By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins?.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.referral_code ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {admin.referral_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyReferralLink(admin.referral_code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="secondary">No code</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {admin.referral_discount ? (
                          <Badge variant="outline" className="text-green-600">
                            ₦{admin.referral_discount.toLocaleString()}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">₦0</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {admin.referred_by ? (
                        <Badge variant="outline">
                          Has referrer
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Direct signup</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.referral_code && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyReferralLink(admin.referral_code)}
                        >
                          Share Link
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Referral Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Referrals Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">For Referrers:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each admin gets a unique referral code</li>
                <li>• Share referral link with potential new admins</li>
                <li>• Earn rewards when someone signs up using your code</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">For New Admins:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use a referral code during signup</li>
                <li>• Get ₦5,000 discount (up to ₦25,000 total)</li>
                <li>• Discount applies to platform fees</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralTracking;
