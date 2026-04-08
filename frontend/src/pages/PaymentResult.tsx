import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, BookOpen, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchEnrolledCount } from '@/redux/slices/enrollmentSlice';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const dispatch = useDispatch<AppDispatch>();

  const success = searchParams.get('success') === 'true';
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    if (success) {
      clearCart();
      dispatch(fetchEnrolledCount()); // cập nhật badge khóa học ngay lập tức
      setTimeout(() => navigate('/dashboard'), 5000);
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        {success ? (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thanh toán thành công!</h1>
              <p className="text-muted-foreground mt-2">
                Đơn hàng <span className="font-mono font-bold">{orderCode}</span> đã được xác nhận.
              </p>
              <p className="text-sm text-muted-foreground mt-1">Khóa học đã được mở khóa trong tài khoản của bạn.</p>
            </div>

            <div className="rounded-xl p-4 text-sm text-muted-foreground" style={{ background: '#EAF3DE', border: '1.5px solid #97C459' }}>
              Bạn sẽ được chuyển đến trang học trong <strong>5 giây</strong>...
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/dashboard')}>
                <BookOpen size={16} /> Vào học ngay
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle size={40} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thanh toán thất bại</h1>
              <p className="text-muted-foreground mt-2">
                Đơn hàng <span className="font-mono font-bold">{orderCode}</span> chưa được thanh toán.
              </p>
              <p className="text-sm text-muted-foreground mt-1">Vui lòng thử lại hoặc chọn phương thức khác.</p>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/cart')}>
                <ShoppingCart size={16} /> Quay lại giỏ hàng
              </Button>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" asChild>
                <Link to="/dashboard">
                  Xem đơn hàng của tôi <ArrowRight size={15} />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}