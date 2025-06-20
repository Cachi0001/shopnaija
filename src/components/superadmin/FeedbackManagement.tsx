
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Star, 
  Check, 
  X, 
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

const FeedbackManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Mock data - replace with actual API call
  const mockFeedback = [
    {
      id: "1",
      customer_name: "John Doe",
      admin_name: "Store A",
      product_title: "Wireless Headphones",
      rating: 5,
      comment: "Excellent product, fast delivery!",
      is_approved: true,
      is_review: true,
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      customer_name: "Jane Smith",
      admin_name: "Store B",
      product_title: "Smartphone Case",
      rating: 4,
      comment: "Good quality but shipping was slow",
      is_approved: false,
      is_review: true,
      created_at: "2024-01-14T15:45:00Z"
    },
    {
      id: "3",
      customer_name: "Anonymous",
      admin_name: "Store C",
      product_title: null,
      rating: 2,
      comment: "Poor customer service experience",
      is_approved: false,
      is_review: false,
      created_at: "2024-01-13T09:15:00Z"
    }
  ];

  // Mock query - replace with actual implementation
  const { data: feedback = mockFeedback, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => Promise.resolve(mockFeedback),
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.product_title && item.product_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = selectedRating === null || item.rating === selectedRating;
    
    return matchesSearch && matchesRating;
  });

  const pendingFeedback = filteredFeedback.filter(item => !item.is_approved);
  const approvedFeedback = filteredFeedback.filter(item => item.is_approved);
  const productReviews = filteredFeedback.filter(item => item.is_review);
  const generalFeedback = filteredFeedback.filter(item => !item.is_review);

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
      {/* Feedback Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingFeedback.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Product Reviews
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productReviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productReviews.length > 0 
                ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
                : "0"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant={selectedRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
            >
              {rating}★
            </Button>
          ))}
          {selectedRating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRating(null)}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Product Reviews ({productReviews.length})
          </TabsTrigger>
          <TabsTrigger value="general">
            General Feedback ({generalFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <FeedbackTable 
            feedback={pendingFeedback} 
            showActions={true}
            renderStars={renderStars}
          />
        </TabsContent>

        <TabsContent value="approved">
          <FeedbackTable 
            feedback={approvedFeedback} 
            showActions={false}
            renderStars={renderStars}
          />
        </TabsContent>

        <TabsContent value="reviews">
          <FeedbackTable 
            feedback={productReviews} 
            showActions={true}
            renderStars={renderStars}
          />
        </TabsContent>

        <TabsContent value="general">
          <FeedbackTable 
            feedback={generalFeedback} 
            showActions={true}
            renderStars={renderStars}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface FeedbackTableProps {
  feedback: any[];
  showActions: boolean;
  renderStars: (rating: number) => JSX.Element;
}

const FeedbackTable = ({ feedback, showActions, renderStars }: FeedbackTableProps) => {
  return (
    <Card>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                {showActions && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedback.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.customer_name}</TableCell>
                  <TableCell>{item.admin_name}</TableCell>
                  <TableCell>
                    {item.product_title || (
                      <span className="text-muted-foreground">General feedback</span>
                    )}
                  </TableCell>
                  <TableCell>{renderStars(item.rating)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={item.comment}>
                      {item.comment}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_review ? "default" : "secondary"}>
                      {item.is_review ? "Review" : "Feedback"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_approved ? "default" : "secondary"}>
                      {item.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!item.is_approved && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackManagement;
