import { useState } from 'react';
import { Search, Star, Eye, EyeOff, Trash2, MessageSquare, MoreVertical } from 'lucide-react';
import { adminReviews } from '@/data/adminMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

export default function AdminReviews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reviews, setReviews] = useState(adminReviews);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyDialog, setReplyDialog] = useState<{ open: boolean; reviewId: string | null }>({ open: false, reviewId: null });
  const [replyText, setReplyText] = useState('');
  const itemsPerPage = 10;

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleHide = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, isHidden: !r.isHidden } : r
    ));
    toast.success('Đã cập nhật trạng thái đánh giá!');
  };

  const handleDelete = (reviewId: string) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
    toast.success('Đã xoá đánh giá!');
  };

  const handleReply = () => {
    if (replyDialog.reviewId && replyText.trim()) {
      setReviews(reviews.map(r => 
        r.id === replyDialog.reviewId ? { ...r, adminReply: replyText } : r
      ));
      setReplyDialog({ open: false, reviewId: null });
      setReplyText('');
      toast.success('Đã gửi phản hồi!');
    }
  };

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Đánh giá</h1>
        <p className="text-admin-muted-foreground">Tổng cộng {reviews.length} đánh giá từ học viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-admin-card border border-admin-border rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-admin-foreground">{avgRating}</p>
              <p className="text-sm text-admin-muted-foreground">Đánh giá trung bình</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-admin-card border border-admin-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-admin-foreground mb-4">Phân bố đánh giá</h3>
          <div className="space-y-2">
            {ratingCounts.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-admin-muted-foreground w-12">{rating} sao</span>
                <div className="flex-1 h-2 bg-admin-accent rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-admin-foreground w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-admin-card border border-admin-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted-foreground" />
            <Input
              placeholder="Tìm theo tên học viên, khoá học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-admin-accent border-admin-border text-admin-foreground">
              <SelectValue placeholder="Số sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <div 
            key={review.id} 
            className={`bg-admin-card border border-admin-border rounded-xl p-6 ${review.isHidden ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={review.studentAvatar} />
                <AvatarFallback className="bg-admin-primary text-white">
                  {review.studentName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-admin-foreground">{review.studentName}</p>
                      {review.isHidden && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded">Đã ẩn</span>
                      )}
                    </div>
                    <p className="text-sm text-admin-muted-foreground">{review.courseTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem 
                          onClick={() => {
                            setReplyDialog({ open: true, reviewId: review.id });
                            setReplyText(review.adminReply || '');
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Phản hồi
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleHide(review.id)}>
                          {review.isHidden ? (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Hiển thị
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Ẩn đánh giá
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(review.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xoá
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <p className="mt-3 text-admin-foreground">{review.content}</p>
                <p className="mt-2 text-xs text-admin-muted-foreground">{formatDate(review.createdAt)}</p>

                {review.adminReply && (
                  <div className="mt-4 p-4 bg-admin-accent rounded-lg border-l-4 border-admin-primary">
                    <p className="text-sm font-medium text-admin-primary mb-1">Phản hồi từ Admin:</p>
                    <p className="text-sm text-admin-foreground">{review.adminReply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-admin-muted-foreground">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredReviews.length)} / {filteredReviews.length}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyDialog.open} onOpenChange={(open) => setReplyDialog({ ...replyDialog, open })}>
        <DialogContent className="bg-admin-card border-admin-border">
          <DialogHeader>
            <DialogTitle className="text-admin-foreground">Phản hồi đánh giá</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập nội dung phản hồi..."
              rows={4}
              className="bg-admin-accent border-admin-border text-admin-foreground"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setReplyDialog({ open: false, reviewId: null })}
                className="border-admin-border text-admin-foreground hover:bg-admin-accent"
              >
                Huỷ
              </Button>
              <Button
                onClick={handleReply}
                className="bg-admin-primary hover:bg-admin-primary/90"
                disabled={!replyText.trim()}
              >
                Gửi phản hồi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
