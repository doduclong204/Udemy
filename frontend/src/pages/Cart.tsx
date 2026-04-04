import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Rating } from '@/components/Rating';
import { Trash2, Tag, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import couponService from '@/services/couponService';
import { toast } from 'sonner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, totalOriginalPrice, totalSalePrice, totalDiscount, discountPercentage, loading } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const finalPrice = totalSalePrice - couponDiscount;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const discount = await couponService.calculateDiscount(code, totalSalePrice);
      setCouponDiscount(discount);
      setAppliedCode(code);
      toast.success(`Áp dụng mã "${code}" thành công! Giảm ${formatCurrency(discount)}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn';
      toast.error(msg);
      setCouponDiscount(0);
      setAppliedCode('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCode('');
    setCouponDiscount(0);
    setCouponCode('');
  };

  const handlePlaceOrder = async () => {
    const code = couponCode.trim().toUpperCase();

    let finalCouponDiscount = couponDiscount;
    let finalAppliedCode = appliedCode;

    if (code && !appliedCode) {
      setCouponLoading(true);
      try {
        const discount = await couponService.calculateDiscount(code, totalSalePrice);
        finalCouponDiscount = discount;
        finalAppliedCode = code;
        setCouponDiscount(discount);
        setAppliedCode(code);
        toast.success(`Đã áp dụng mã "${code}"!`);
      } catch {
        toast.error('Mã giảm giá không hợp lệ, tiếp tục đặt hàng không có mã.');
      } finally {
        setCouponLoading(false);
      }
    }

    navigate('/order/checkout', {
      state: {
        items,
        couponCode: finalAppliedCode || undefined,
        totalSalePrice: totalSalePrice - finalCouponDiscount,
        totalOriginalPrice,
        totalDiscount,
        discountPercentage,
        couponDiscount: finalCouponDiscount,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Đang tải giỏ hàng...</div>
        ) : items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-muted-foreground">{items.length} khóa học trong giỏ hàng</p>
              {items.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow">
                  <Link to={`/course/${item.courseId}`} className="flex-shrink-0">
                    <img src={item.courseImage} alt={item.courseName} className="w-32 h-20 object-cover rounded" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/course/${item.courseId}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">{item.courseName}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Rating rating={item.rating} reviewCount={item.totalReviews} size="sm" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(item.salePrice)}</p>
                      {item.originalPrice > item.salePrice && (
                        <p className="text-sm text-muted-foreground line-through">{formatCurrency(item.originalPrice)}</p>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.courseId)} className="text-destructive hover:text-destructive/80 transition-colors p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Coupon input */}
                <div className="p-4 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-primary" /> Mã giảm giá
                  </p>
                  {appliedCode ? (
                    <div className="flex items-center justify-between px-3 py-2.5 bg-green-50 border border-green-300 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-semibold text-green-700">{appliedCode}</span>
                        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded font-medium">
                          -{formatCurrency(couponDiscount)}
                        </span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="shrink-0 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        {couponLoading ? '...' : 'Áp dụng'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="p-4 space-y-2.5 border-b border-border">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(totalOriginalPrice)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá khóa học</span>
                      <span className="text-green-600 font-medium">-{formatCurrency(totalDiscount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mã <span className="font-semibold text-foreground">{appliedCode}</span></span>
                      <span className="text-green-600 font-medium">-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                </div>

                {/* Total + CTA */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">Tổng cộng</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(finalPrice)}</p>
                      {totalDiscount + couponDiscount > 0 && (
                        <p className="text-xs text-green-600 font-medium">
                          Tiết kiệm {formatCurrency(totalDiscount + couponDiscount)}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button variant="cart" className="w-full h-11 text-base font-semibold" onClick={handlePlaceOrder} disabled={couponLoading}>
                    {couponLoading ? 'Đang xử lý...' : 'Đặt hàng'}
                  </Button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <p className="text-xs text-muted-foreground text-center">🔒 Hoàn tiền 30 ngày · Truy cập trọn đời</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Tiếp tục mua sắm để tìm khóa học! Khi bạn thêm khóa học vào giỏ hàng, chúng sẽ xuất hiện ở đây.
            </p>
            <Button asChild size="lg">
              <Link to="/">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}