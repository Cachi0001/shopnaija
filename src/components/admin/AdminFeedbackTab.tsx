
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminFeedbackTabProps {
  feedback: any[];
}

export const AdminFeedbackTab = ({ feedback }: AdminFeedbackTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedback && feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.customer_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, starIndex) => (
                          <svg
                            key={starIndex}
                            className={`w-4 h-4 ${starIndex < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{item.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No feedback found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
