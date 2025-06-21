
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService, type AdminCreateData } from "@/services/AdminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  UserPlus, 
  Edit, 
  ToggleLeft, 
  ToggleRight, 
  Search,
  Eye,
  Copy
} from "lucide-react";

const AdminManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  // Fetch admins
  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: AdminService.getAllAdmins,
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: AdminService.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Admin created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        variant: "destructive",
      });
    },
  });

  // Toggle admin status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? AdminService.deactivateAdmin(id) : AdminService.activateAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: "Success",
        description: "Admin status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin status",
        variant: "destructive",
      });
    },
  });

  const handleCreateAdmin = (formData: FormData) => {
    const adminData: AdminCreateData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: formData.get('phone') as string,
      nin: formData.get('nin') as string,
      subdomain: formData.get('subdomain') as string,
      website_name: formData.get('website_name') as string,
      primary_color: formData.get('primary_color') as string || '#1a56db',
      account_name: formData.get('account_name') as string,
      account_number: formData.get('account_number') as string,
      bank_name: formData.get('bank_name') as string,
      bank_code: formData.get('bank_code') as string, // Added bank_code
    };

    createAdminMutation.mutate(adminData);
  };

  const copyReferralLink = (referralCode: string) => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const filteredAdmins = admins?.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.subdomain?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
      {/* Show new admin link if just created */}
      {newAdminLink && (
        <div className="bg-green-50 border border-green-200 rounded p-4 flex items-center justify-between gap-4">
          <div>
            <span className="font-semibold">Admin Login Link:</span>
            <a href={`/admin/${newAdminLink}`} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-brand-800">
              {window.location.origin}/admin/{newAdminLink}
            </a>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/admin/${newAdminLink}`);
              toast({ title: "Copied!", description: "Admin login link copied to clipboard" });
            }}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy Link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNewAdminLink(null)}
            className="text-gray-500"
          >
            Dismiss
          </Button>
        </div>
      )}
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-800 hover:bg-brand-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new admin to the GrowthSmallBeez platform. A temporary password will be provided.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateAdmin(new FormData(e.target as HTMLFormElement));
            }}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Temporary Password *</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password"
                      placeholder="Create a temporary password"
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Admin will need to change this on first login
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nin">NIN *</Label>
                    <Input id="nin" name="nin" pattern="[0-9]{11}" required />
                  </div>
                  <div>
                    <Label htmlFor="subdomain">Subdomain *</Label>
                    <Input id="subdomain" name="subdomain" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_name">Website Name *</Label>
                    <Input id="website_name" name="website_name" required />
                  </div>
                  <div>
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <Input id="primary_color" name="primary_color" type="color" defaultValue="#1a56db" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="account_name">Account Name</Label>
                    <Input id="account_name" name="account_name" />
                  </div>
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input id="account_number" name="account_number" />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input id="bank_name" name="bank_name" />
                  </div>
                   <div>
                    <Label htmlFor="bank_code">Bank Code</Label>
                    <Input id="bank_code" name="bank_code" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createAdminMutation.isPending}
                  className="bg-brand-800 hover:bg-brand-700"
                >
                  {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Admins ({filteredAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subdomain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {admin.subdomain && (
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">
                            /admin/{admin.subdomain}
                          </Badge>
                          <div className="flex items-center gap-1 mt-1">
                            <a
                              href={`/admin/${admin.subdomain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline text-brand-800"
                            >
                              Admin Login Link
                            </a>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1"
                              title="Copy admin login link"
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/admin/${admin.subdomain}`);
                                toast({ title: "Copied!", description: "Admin login link copied to clipboard" });
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.is_active ? "default" : "secondary"}>
                        {admin.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.referral_code && (
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
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.created_at && new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAdmin(admin)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatusMutation.mutate({
                            id: admin.id,
                            isActive: admin.is_active
                          })}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {admin.is_active ? (
                            <ToggleLeft className="h-4 w-4 text-red-600" />
                          ) : (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Details Dialog */}
      {selectedAdmin && (
        <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAdmin.name}</DialogTitle>
              <DialogDescription>Admin Details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
  <div className="grid grid-cols-2 gap-4 text-sm">
    <div>
      <strong>Email:</strong> {selectedAdmin.email}
    </div>
    <div>
      <strong>Phone:</strong> {selectedAdmin.phone || 'N/A'}
    </div>
    <div>
      <strong>NIN:</strong> {selectedAdmin.nin || 'N/A'}
    </div>
    <div>
      <strong>Website:</strong> {selectedAdmin.website_name || 'N/A'}
    </div>
    <div>
      <strong>Account Name:</strong> {selectedAdmin.account_name || 'N/A'}
    </div>
    <div>
      <strong>Account Number:</strong> {selectedAdmin.account_number || 'N/A'}
    </div>
    <div>
      <strong>Bank:</strong> {selectedAdmin.bank_name || 'N/A'}
    </div>
    <div>
      <strong>Bank Code:</strong> {selectedAdmin.bank_code || 'N/A'}
    </div>
    <div>
      <strong>Paystack Subaccount:</strong> {selectedAdmin.paystack_subaccount_code || 'N/A'}
    </div>
    <div>
      <strong>Referral Discount:</strong> ₦{selectedAdmin.referral_discount || 0}
    </div>
    <div className="col-span-2 mt-2">
      {selectedAdmin.subdomain && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Admin Login Link:</span>
          <a
            href={`https://${selectedAdmin.subdomain}.growthsmallbeez.com/auth`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-brand-800"
          >
            https://{selectedAdmin.subdomain}.growthsmallbeez.com/auth
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`https://${selectedAdmin.subdomain}.growthsmallbeez.com/auth`);
              toast({ title: "Copied!", description: "Admin login link copied to clipboard" });
            }}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy Link
          </Button>
        </div>
      )}
    </div>
  </div>
</div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminManagement;
