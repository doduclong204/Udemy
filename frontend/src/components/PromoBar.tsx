import { X } from 'lucide-react';
import { useState } from 'react';

export function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-udemy-navy text-background py-3 relative animate-pulse-slow">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm md:text-base font-medium">
          <span className="text-udemy-yellow">Khuyến mãi Năm Mới!</span> Khóa học chỉ từ{' '}
          <span className="font-bold">199.000đ</span>. Còn 2 ngày!{' '}
          <button className="underline font-semibold hover:text-udemy-yellow transition-colors">
            Mua ngay
          </button>
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/20 rounded transition-colors"
          aria-label="Đóng khuyến mãi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
