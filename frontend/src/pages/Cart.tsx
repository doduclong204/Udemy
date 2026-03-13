import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Rating } from '@/components/Rating';
import { Trash2, Tag, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, totalOriginalPrice, totalSalePrice, totalDiscount, discountPercentage, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const handlePlaceOrder = () => {
    navigate('/order/checkout', {
      state: {
        items,
        couponCode: couponCode.trim() || undefined,
        totalSalePrice,
        totalOriginalPrice,
        totalDiscount,
        discountPercentage,
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
              <div className="sticky top-20 bg-card border border-border rounded-lg p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold mb-2">Tổng cộng</h2>
                  <p className="text-3xl font-bold">{formatCurrency(totalSalePrice)}</p>
                  {totalDiscount > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground line-through mt-1">{formatCurrency(totalOriginalPrice)}</p>
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1 mt-1">
                        <Tag className="w-4 h-4" />
                        Tiết kiệm {formatCurrency(totalDiscount)} ({discountPercentage}% giảm)
                      </p>
                    </>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-2">Mã giảm giá</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button variant="secondary" size="sm">Áp dụng</Button>
                  </div>
                </div>

                <Button variant="cart" className="w-full" onClick={handlePlaceOrder}>
                  Đặt hàng
                </Button>

                <div className="border-t border-border pt-3 text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Đảm bảo hoàn tiền trong 30 ngày</p>
                  <p className="text-xs text-muted-foreground">Truy cập trọn đời</p>
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