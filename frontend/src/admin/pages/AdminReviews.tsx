import { useEffect, useRef, useState } from 'react';
import {
  Search, Star, Eye, EyeOff, Trash2,
  MessageSquare, MoreVertical, ChevronDown,
} from 'lucide-react';
import reviewService from '@/services/reviewService';
import { ReviewResponse, ReviewStats } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// ── helpers ──────────────────────────────────────────────
const formatDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

const INPUT_CLASS = 'bg-[hsl(220,20%,22%)] border-[hsl(220,20%,28%)] text-white placeholder:text-slate-500';
const BTN_CANCEL  = 'border-[hsl(220,20%,28%)] text-white hover:bg-[hsl(220,20%,25%)]';
const DROPDOWN_BG = 'bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,28%)] rounded-lg shadow-xl z-[200]';
const ITEM_BASE   = 'w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer';
const ITEM_DEF    = 'text-slate-300 hover:bg-[hsl(220,20%,25%)]';
const ITEM_SEL    = 'bg-admin-primary/20 text-white';

// ── CustomSelect ──────────────────────────────────────────
function CustomSelect<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const selected = options.find(o => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm ${INPUT_CLASS}`}
      >
        <span>{selected?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={`absolute top-full mt-1 w-full ${DROPDOWN_BG}`}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              className={`${ITEM_BASE} ${value === opt.value ? ITEM_SEL : ITEM_DEF}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={`${cls} ${s <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────
export default function AdminReviews() {
  const [reviews, setReviews]         = useState<ReviewResponse[]>([]);
  const [totalItems, setTotalItems]   = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    avgRating: 0,
    totalCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const isMounted = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // dialogs
  const [replyOpen, setReplyOpen]         = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [selected, setSelected]           = useState<ReviewResponse | null>(null);
  const [replyText, setReplyText]         = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // ── fetch ──
  const fetchReviews = async (
    page = currentPage,
    search = searchQuery,
    rating = ratingFilter
  ) => {
    setIsLoading(true);
    try {
      const res = await reviewService.getAdminReviews({
        page,
        pageSize: itemsPerPage,
        search: search || undefined,
        rating: rating !== 'all' ? Number(rating) : undefined,
      });
      setReviews(res.result);
      setTotalItems(res.meta.total);
    } catch {
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await reviewService.getStats();
      setReviewStats(stats);
    } catch {
      console.error('Không thể tải thống kê đánh giá');
    }
  };

  useEffect(() => { fetchReviews(currentPage, searchQuery, ratingFilter); }, [currentPage]); // eslint-disable-line
  useEffect(() => { fetchStats(); }, []); // eslint-disable-line
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const t = setTimeout(() => { setCurrentPage(1); fetchReviews(1, searchQuery, ratingFilter); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, ratingFilter]); // eslint-disable-line

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviewStats.distribution[r] ?? 0,
    pct: reviewStats.totalCount > 0
      ? ((reviewStats.distribution[r] ?? 0) / reviewStats.totalCount) * 100
      : 0,
  }));

  const handleToggle = async (r: ReviewResponse) => {
    try {
      await reviewService.toggleReviewVisibility(r._id, r.reviewStatus);
      toast.success(r.reviewStatus ? 'Đã ẩn đánh giá!' : 'Đã hiện đánh giá!');
      fetchReviews(currentPage, searchQuery, ratingFilter);
      fetchStats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await reviewService.replyToReview(selected._id, replyText);
      toast.success('Đã gửi phản hồi!');
      setReplyOpen(false);
      setSelected(null);
      setReplyText('');
      fetchReviews(currentPage, searchQuery, ratingFilter);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gửi phản hồi thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await reviewService.deleteReview(selected._id);
      toast.success('Đã xoá đánh giá!');
      setDeleteOpen(false);
      setSelected(null);
      fetchReviews(currentPage, searchQuery, ratingFilter);
      fetchStats();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xoá thất bại');
    }
  };

  const openReply = (r: ReviewResponse) => {
    setSelected(r);
    setReplyText(r.adminReply ?? '');
    setReplyOpen(true);
  };
  const openDelete = (r: ReviewResponse) => { setSelected(r); setDeleteOpen(true); };

  // ── render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-admin-foreground">Quản lý Đánh giá</h1>
        <p className="text-admin-muted-foreground">Tổng cộng {totalItems} đánh giá từ học viên</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <p className="text-3xl font-bold text-admin-foreground">{reviewStats.avgRating.toFixed(1)}</p>
            <p className="text-sm text-admin-muted-foreground">Đánh giá trung bình</p>
          </div>
        </div>
        <div className="lg:col-span-2 bg-admin-card border border-admin-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-admin-foreground mb-4">Phân bố đánh giá</h3>
          <div className="space-y-2">
            {ratingCounts.map(({ rating, count, pct }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-admin-muted-foreground w-12">{rating} sao</span>
                <div className="flex-1 h-2 bg-admin-accent rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-admin-foreground w-8 text-right">{count}</span>
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
              placeholder="Tìm theo nội dung, khoá học..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 bg-admin-accent border-admin-border text-admin-foreground"
            />
          </div>
          <div className="w-full sm:w-40">
            <CustomSelect<string>
              value={ratingFilter}
              onChange={v => { setRatingFilter(v); setCurrentPage(1); }}
              options={[
                { value: 'all', label: 'Tất cả sao' },
                { value: '5', label: '5 sao' },
                { value: '4', label: '4 sao' },
                { value: '3', label: '3 sao' },
                { value: '2', label: '2 sao' },
                { value: '1', label: '1 sao' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* List */}
      {!isLoading && reviews.length === 0 ? (
        <div className="bg-admin-card border border-admin-border rounded-xl p-12 text-center">
          <Star className="w-16 h-16 text-admin-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-admin-foreground mb-2">Chưa có đánh giá nào</h2>
          <p className="text-admin-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-admin-card border border-admin-border rounded-xl p-6 animate-pulse h-28" />
              ))
            : reviews.map(r => (
                <div
                  key={r._id}
                  className={`bg-admin-card border border-admin-border rounded-xl p-6 transition-opacity ${!r.reviewStatus ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-11 h-11 shrink-0">
                      <AvatarImage src={r.user.avatar} />
                      <AvatarFallback className="bg-admin-primary text-white text-sm">
                        {r.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-admin-foreground">{r.user.name}</p>
                            {!r.reviewStatus && (
                              <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">Đã ẩn</span>
                            )}
                          </div>
                          <p className="text-sm text-admin-muted-foreground mt-0.5">{r.course.title}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Stars rating={r.rating} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4 text-admin-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openReply(r)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {r.adminReply ? 'Sửa phản hồi' : 'Phản hồi'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggle(r)}>
                                {r.reviewStatus ? (
                                  <><EyeOff className="w-4 h-4 mr-2" />Ẩn đánh giá</>
                                ) : (
                                  <><Eye className="w-4 h-4 mr-2" />Hiển thị</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDelete(r)} className="text-red-400 focus:text-red-300">
                                <Trash2 className="w-4 h-4 mr-2" />Xoá
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <p className="mt-3 text-admin-foreground text-sm leading-relaxed">{r.comment}</p>
                      <p className="mt-2 text-xs text-admin-muted-foreground">{formatDate(r.createdAt)}</p>

                      {r.adminReply && (
                        <div className="mt-4 p-4 bg-admin-accent rounded-lg border-l-4 border-admin-primary">
                          <p className="text-xs font-semibold text-admin-primary mb-1 uppercase tracking-wide">Phản hồi Admin</p>
                          <p className="text-sm text-admin-foreground">{r.adminReply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-admin-muted-foreground">
          Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} –{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >Trước</Button>
          <Button variant="outline" size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >Sau</Button>
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={v => { if (!v) { setReplyOpen(false); setSelected(null); } }}>
        <DialogContent className="admin-dialog sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selected?.adminReply ? 'Sửa phản hồi' : 'Phản hồi đánh giá'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="py-2 space-y-4">
              <div className="p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{selected.user.name}</span>
                  <Stars rating={selected.rating} />
                </div>
                <p className="text-sm text-slate-300">{selected.comment}</p>
              </div>
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Nhập nội dung phản hồi..."
                rows={4}
                className={`${INPUT_CLASS} resize-none`}
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setReplyOpen(false); setSelected(null); }} className={BTN_CANCEL} disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button
              onClick={handleReply}
              className="!bg-blue-600 hover:!bg-blue-500 text-white"
              disabled={!replyText.trim() || isSubmitting}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="admin-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xác nhận xoá đánh giá</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bạn có chắc muốn xoá đánh giá của <span className="text-white font-medium">{selected?.user.name}</span>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={BTN_CANCEL}>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}