
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EnhancedAdminService } from "@/services/EnhancedAdminService";
import { AdminService } from "@/services/AdminService";
import { PaymentService } from "@/services/PaymentService";
import { 
  Users, 
  CreditCard, 
  Key, 
  CheckCircle, 
  XCircle,
  Plus,
  Phone,
  Building2,
  AlertCircle
} from "lucide-react";

const EnhancedAdminManagement = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['enhanced-admins'],
    queryFn: () => EnhancedAdminService.getAllAdminsWithPaymentStatus()
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (adminId: string) => PaymentService.updatePaymentStatus(adminId),
    onSuccess: () => {
      toast({
        title: "Payment Confirmed",
        description: "₦60,000 payment has been confirmed via WhatsApp",
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-admins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const activateMutation = useMutation({
    mutationFn: (adminId: string) => EnhancedAdminService.activateAdmin(adminId),
    onSuccess: () => {
      toast({
        title: "Admin Activated",
        description: "Admin account has been activated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-admins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Activation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: (adminId: string) => EnhancedAdminService.deactivateAdmin(adminId),
    onSuccess: () => {
      toast({
        title: "Admin Deactivated",
        description: "Admin account has been deactivated. Payments redirected to superadmin.",
      });
      queryClient.invalidateQueries({ queryKey: ['enhanced-admins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const setPasswordMutation = useMutation({
    mutationFn: (adminId: string) => PaymentService.setTempPassword(adminId),
    onSuccess: () => {
      toast({
        title: "Password Reset",
        description: "Temporary password has been sent via email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (admin: any) => {
    if (!admin.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (admin.payment_status === 'pending') {
      return <Badge variant="secondary">Payment Pending</Badge>;
    }
    if (admin.payment_status === 'paid') {
      return <Badge variant="default" className="bg-green-600">Active & Paid</Badge>;
    }
    if (admin.payment_status === 'overdue') {
      return <Badge variant="destructive">Payment Overdue</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const canActivate = (admin: any) => {
    return admin.payment_status === 'paid' && admin.account_number && admin.bank_name;
  };

  if (isLoading) {
    return <div className="p-6">Loading admin management...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Admin Management</h2>
          <p className="text-muted-foreground">
            Manage admin accounts, payments, and activation status
          </p>
        </div>
        <Button className="bg-brand-600 hover:bg-brand-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Admin
        </Button>
      </div>

      <div className="grid gap-6">
        {admins.map((admin) => (
          <Card key={admin.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-brand-600" />
                    <CardTitle className="text-lg">{admin.name}</CardTitle>
                  </div>
                  {getStatusBadge(admin)}
                </div>
                <div className="flex space-x-2">
                  {admin.payment_status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => confirmPaymentMutation.mutate(admin.id)}
                      disabled={confirmPaymentMutation.isPending}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Confirm ₦60,000
                    </Button>
                  )}
                  
                  {canActivate(admin) && !admin.is_active && (
                    <Button
                      size="sm"
                      onClick={() => activateMutation.mutate(admin.id)}
                      disabled={activateMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate
                    </Button>
                  )}
                  
                  {admin.is_active && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deactivateMutation.mutate(admin.id)}
                      disabled={deactivateMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Deactivate
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPasswordMutation.mutate(admin.id)}
                    disabled={setPasswordMutation.isPending}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Reset Password
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p>{admin.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Subdomain</p>
                  <p>{admin.subdomain || 'Not set'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Website</p>
                  <p>{admin.website_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Phone</p>
                  <p className="flex items-center">
                    <Phone className="mr-1 h-3 w-3" />
                    {admin.phone || 'Not provided'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-600 flex items-center">
                    <Building2 className="mr-1 h-4 w-4" />
                    Bank Details
                  </p>
                  <p className="text-sm">
                    {admin.bank_name ? `${admin.bank_name} - ${admin.account_number}` : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Payment Status</p>
                  <p className="text-sm capitalize">{admin.payment_status}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Password Reset Required</p>
                  <p className="text-sm flex items-center">
                    {admin.must_reset_password ? (
                      <>
                        <AlertCircle className="mr-1 h-3 w-3 text-orange-500" />
                        Yes
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                        No
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              {!canActivate(admin) && admin.payment_status === 'paid' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Missing bank details. Admin cannot be activated without account number and bank name.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {admins.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No admins found</h3>
            <p className="text-gray-500">Create your first admin to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAdminManagement;
