import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import orderService from '@/services/orderService';
import {
  ShoppingCart,
  ChevronRight,
  CreditCard,
  Landmark,
  Wallet,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import type { PaymentMethod, CartItemResponse } from '@/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

interface LocationState {
  items: CartItemResponse[];
  couponCode?: string;
  totalSalePrice: number;
  totalOriginalPrice: number;
  totalDiscount: number;
  discountPercentage: number;
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  desc: string;
  color: string;
  border: string;
  bg: string;
  bgLight: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'VNPAY',
    label: 'VNPAY',
    desc: 'Thanh toán qua cổng VNPAY — ATM, Visa, Mastercard, QR Pay',
    color: '#534AB7',
    border: '#AFA9EC',
    bg: '#EEEDFE',
    bgLight: '#EEEDFE55',
    icon: <CreditCard size={22} style={{ color: '#534AB7' }} />,
  },
  {
    value: 'MOMO',
    label: 'Ví MoMo',
    desc: 'Quét QR hoặc chuyển đến ứng dụng MoMo',
    color: '#993556',
    border: '#ED93B1',
    bg: '#FBEAF0',
    bgLight: '#FBEAF055',
    icon: <Wallet size={22} style={{ color: '#993556' }} />,
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Chuyển khoản ngân hàng',
    desc: 'Chuyển khoản thủ công — xác nhận trong 1–2 giờ làm việc',
    color: '#185FA5',
    border: '#85B7EB',
    bg: '#E6F1FB',
    bgLight: '#E6F1FB55',
    icon: <Landmark size={22} style={{ color: '#185FA5' }} />,
  },
  {
    value: 'PAYPAL',
    label: 'PayPal',
    desc: 'Thanh toán quốc tế an toàn qua PayPal',
    color: '#0C447C',
    border: '#85B7EB',
    bg: '#E6F1FB',
    bgLight: '#E6F1FB55',
    icon: <CreditCard size={22} style={{ color: '#0C447C' }} />,
  },
];

export default function OrderCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const state = location.state as LocationState | null;
  const [selected, setSelected] = useState<PaymentMethod>('VNPAY');
  const [isLoading, setIsLoading] = useState(false);

  if (!state) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy thông tin đơn hàng.</p>
          <Button asChild><Link to="/cart">Quay lại giỏ hàng</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const { items, couponCode, totalSalePrice, totalOriginalPrice, totalDiscount, discountPercentage } = state;
  const activeMeta = PAYMENT_METHODS.find((m) => m.value === selected)!;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const order = await orderService.checkout({
        courseIds: items.map((i) => i.courseId),
        paymentMethod: selected,
        couponCode,
      });
      navigate('/order/payment', { state: { order, paymentMethod: selected } });
    } catch (error: any) {
      toast({
        title: 'Đặt hàng thất bại',
        description: error?.response?.data?.message || 'Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
          <Link to="/cart" className="hover:text-primary flex items-center gap-1 transition-colors">
            <ShoppingCart size={14} /> Giỏ hàng
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-foreground">Thanh toán</span>
          <ChevronRight size={14} />
          <span>Hoàn tất</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">Chọn phương thức thanh toán</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment methods — left 3 cols */}
          <div className="lg:col-span-3 space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selected === method.value;
              return (
                <button
                  key={method.value}
                  onClick={() => setSelected(method.value)}
                  className="w-full text-left transition-all rounded-xl p-4 flex items-start gap-4 group"
                  style={{
                    border: isSelected ? `2px solid ${method.color}` : '1.5px solid hsl(var(--border))',
                    background: isSelected ? method.bgLight : 'var(--card)',
                  }}
                >
                  {/* Icon box */}
                  <div
                    className="rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ width: 44, height: 44, background: method.bg }}
                  >
                    {method.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: isSelected ? method.color : undefined }}>
                      {method.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{method.desc}</p>
                  </div>

                  {/* Radio */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{ borderColor: isSelected ? method.color : 'hsl(var(--border))' }}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full transition-all" style={{ background: method.color }} />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Security note */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/40 mt-2">
              <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mọi giao dịch được mã hóa và bảo mật. Thông tin thanh toán của bạn không được lưu trữ trên hệ thống.
              </p>
            </div>
          </div>

          {/* Order summary — right 2 cols */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-bold text-base">Tóm tắt đơn hàng</h2>

              {/* Course list */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img src={item.courseImage} alt={item.courseName} className="w-14 h-10 object-cover rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2 leading-relaxed">{item.courseName}</p>
                      <p className="text-xs text-primary font-semibold mt-0.5">{formatCurrency(item.salePrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(totalOriginalPrice)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><Tag size={12} /> Giảm giá ({discountPercentage})</span>
                    <span>- {formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                {couponCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Mã: {couponCode}</span>
                    <span>Đang áp dụng</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(totalSalePrice)}</span>
              </div>

              {/* Selected method badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: activeMeta.bg, color: activeMeta.color }}
              >
                {activeMeta.icon && (
                  <span style={{ transform: 'scale(0.7)', display: 'flex' }}>{activeMeta.icon}</span>
                )}
                {activeMeta.label}
              </div>

              <Button variant="cart" className="w-full" onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Bằng cách xác nhận, bạn đồng ý với{' '}
                <Link to="/terms" className="text-primary hover:underline">Điều khoản dịch vụ</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}