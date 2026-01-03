import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CourseCarousel } from '@/components/CourseCarousel';
import { courses } from '@/data/mockData';
import { Rating } from '@/components/Rating';
import { Trash2, Tag, ShoppingBag } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value * 25000);
};

export default function Cart() {
  const { items, removeFromCart, totalPrice, totalOriginalPrice, clearCart } = useCart();
  const savings = totalOriginalPrice - totalPrice;
  const relatedCourses = courses.filter((c) => !items.find((item) => item.id === c.id)).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
        
        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-muted-foreground mb-4">{items.length} khóa học trong giỏ hàng</p>
              
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <Link to={`/course/${item.id}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-32 h-20 object-cover rounded"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/course/${item.id}`}>
                      <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.instructor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Rating rating={item.rating} reviewCount={item.reviewCount} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.duration} • {item.lectures} bài giảng • {item.level}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-muted-foreground line-through">{formatCurrency(item.originalPrice)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors p-2"
                      aria-label="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Tổng cộng:</h2>
                
                <div className="mb-4">
                  <p className="text-3xl font-bold">{formatCurrency(totalPrice)}</p>
                  <p className="text-muted-foreground line-through">{formatCurrency(totalOriginalPrice)}</p>
                  <p className="text-sm text-udemy-green font-medium flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    Tiết kiệm {formatCurrency(savings)} ({Math.round((savings / totalOriginalPrice) * 100)}% giảm)
                  </p>
                </div>
                
                <Button variant="cart" className="mb-4">
                  Thanh toán
                </Button>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border border-border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button variant="secondary" size="sm">
                      Áp dụng
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Đảm bảo hoàn tiền trong 30 ngày
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Truy cập trọn đời
                  </p>
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

        {/* Related Courses */}
        <div className="mt-12">
          <CourseCarousel
            title="Có thể bạn cũng thích"
            courses={relatedCourses}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
