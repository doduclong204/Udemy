import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ChevronRight,
  ShoppingCart,
  Copy,
  ExternalLink,
  Clock,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { PaymentMethod, OrderResponse } from '@/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

interface LocationState {
  order: OrderResponse;
  paymentMethod: PaymentMethod;
}

// ─── VNPAY ────────────────────────────────────────────────────────────────────
function VNPayPanel({ order }: { order: OrderResponse }) {
  const handleRedirect = () => {
    // TODO: window.location.href = order.paymentUrl;
    toast({ title: 'Chức năng đang phát triển', description: 'Backend chưa tích hợp VNPAY gateway.' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: '#EEEDFE', border: '1.5px solid #AFA9EC' }}>
        <div className="w-20 h-20 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm">
          <span className="text-3xl font-black" style={{ color: '#534AB7' }}>VN</span>
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: '#3C3489' }}>Thanh toán qua VNPAY</h3>
          <p className="text-sm mt-1" style={{ color: '#534AB7' }}>Hỗ trợ ATM nội địa, Visa/Mastercard, QR Pay</p>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin đơn hàng</p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Mã đơn hàng</span>
          <span className="font-mono font-bold">{order.orderCode}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Số tiền</span>
          <span className="font-bold text-primary text-base">{formatCurrency(order.finalAmount)}</span>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
        style={{ background: '#534AB7' }}
        onClick={handleRedirect}
      >
        Chuyển đến cổng VNPAY <ExternalLink size={16} />
      </Button>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <Clock size={13} /> Phiên thanh toán hết hạn sau <strong>15 phút</strong>
      </p>
    </div>
  );
}

// ─── MOMO ─────────────────────────────────────────────────────────────────────
function MoMoPanel({ order }: { order: OrderResponse }) {
  const handleRedirect = () => {
    // TODO: window.location.href = order.paymentUrl;
    toast({ title: 'Chức năng đang phát triển', description: 'Backend chưa tích hợp MoMo gateway.' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: '#FBEAF0', border: '1.5px solid #ED93B1' }}>
        <div className="w-20 h-20 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm">
          <span className="text-3xl font-black" style={{ color: '#993556' }}>M</span>
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: '#72243E' }}>Thanh toán qua MoMo</h3>
          <p className="text-sm mt-1" style={{ color: '#993556' }}>Quét mã QR hoặc mở ứng dụng MoMo</p>
        </div>
      </div>

      {/* QR placeholder */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-48 h-48 rounded-2xl flex items-center justify-center"
          style={{ border: '2px dashed #ED93B1', background: '#FBEAF022' }}
        >
          <p className="text-xs text-muted-foreground text-center px-6 leading-relaxed">
            QR Code sẽ hiển thị khi backend tích hợp MoMo gateway
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Mở MoMo → Quét mã → Xác nhận thanh toán</p>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mã đơn hàng</span>
          <span className="font-mono font-bold">{order.orderCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Số tiền</span>
          <span className="font-bold text-primary">{formatCurrency(order.finalAmount)}</span>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
        style={{ background: '#993556' }}
        onClick={handleRedirect}
      >
        Mở ứng dụng MoMo <ExternalLink size={16} />
      </Button>
    </div>
  );
}

// ─── BANK TRANSFER ────────────────────────────────────────────────────────────
function BankTransferPanel({ order }: { order: OrderResponse }) {
  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Đã sao chép ${label}` });
  };

  // TODO: Thay bằng thông tin ngân hàng thật từ Settings
  const bank = {
    name: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'CONG TY TNHH EDU PLATFORM',
    branch: 'Chi nhánh Hà Nội',
    amount: order.finalAmount,
    content: `THANHTOAN ${order.orderCode}`,
  };

  const rows = [
    { label: 'Ngân hàng',      value: bank.name,          copy: false },
    { label: 'Số tài khoản',   value: bank.accountNumber, copy: true  },
    { label: 'Chủ tài khoản',  value: bank.accountName,   copy: true  },
    { label: 'Chi nhánh',      value: bank.branch,        copy: false },
    { label: 'Số tiền',        value: formatCurrency(bank.amount), copy: false, highlight: true },
    { label: 'Nội dung CK',    value: bank.content,       copy: true,  highlight: true },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 space-y-4" style={{ background: '#E6F1FB', border: '1.5px solid #85B7EB' }}>
        <p className="font-bold text-sm" style={{ color: '#0C447C' }}>Thông tin chuyển khoản</p>
        <div className="space-y-3">
          {rows.map(({ label, value, copy, highlight }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm shrink-0" style={{ color: '#185FA5' }}>{label}</span>
              <div className="flex items-center gap-1.5 flex-1 justify-end">
                <span
                  className="text-sm font-mono text-right break-all"
                  style={{ color: highlight ? '#042C53' : '#0C447C', fontWeight: highlight ? 700 : 500 }}
                >
                  {value}
                </span>
                {copy && (
                  <button
                    onClick={() => copyText(value, label)}
                    className="shrink-0 p-1 rounded transition-colors hover:bg-white/60"
                    style={{ color: '#185FA5' }}
                  >
                    <Copy size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-2 border" style={{ background: '#FAEEDA', borderColor: '#EF9F27' }}>
        <p className="text-sm font-semibold" style={{ color: '#633806' }}>⚠️ Lưu ý quan trọng</p>
        <ul className="text-xs space-y-1 list-disc list-inside" style={{ color: '#854F0B' }}>
          <li>Ghi <strong>đúng nội dung</strong> chuyển khoản để hệ thống xác nhận tự động</li>
          <li>Đơn hàng được duyệt trong <strong>1–2 giờ</strong> làm việc</li>
          <li>Liên hệ hỗ trợ nếu chưa nhận khóa học sau 24 giờ</li>
        </ul>
      </div>
    </div>
  );
}

// ─── PAYPAL ───────────────────────────────────────────────────────────────────
function PayPalPanel({ order }: { order: OrderResponse }) {
  const handleRedirect = () => {
    // TODO: window.location.href = order.paymentUrl;
    toast({ title: 'Chức năng đang phát triển', description: 'Backend chưa tích hợp PayPal gateway.' });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-center space-y-4" style={{ background: '#E6F1FB', border: '1.5px solid #85B7EB' }}>
        <div className="w-20 h-20 rounded-2xl bg-white mx-auto flex items-center justify-center shadow-sm">
          <span className="text-2xl font-black" style={{ color: '#185FA5' }}>PP</span>
        </div>
        <div>
          <h3 className="font-bold text-lg" style={{ color: '#0C447C' }}>Thanh toán qua PayPal</h3>
          <p className="text-sm mt-1" style={{ color: '#185FA5' }}>Thanh toán quốc tế nhanh chóng và an toàn</p>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mã đơn hàng</span>
          <span className="font-mono font-bold">{order.orderCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Số tiền (VND)</span>
          <span className="font-bold text-primary">{formatCurrency(order.finalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tương đương (USD)</span>
          {/* TODO: Lấy tỉ giá thật từ API */}
          <span className="font-semibold text-muted-foreground">~ ${(order.finalAmount / 25000).toFixed(2)}</span>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
        style={{ background: '#185FA5' }}
        onClick={handleRedirect}
      >
        Chuyển đến PayPal <ExternalLink size={16} />
      </Button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const PANEL_MAP: Record<PaymentMethod, (order: OrderResponse) => React.ReactNode> = {
  VNPAY:         (o) => <VNPayPanel order={o} />,
  MOMO:          (o) => <MoMoPanel order={o} />,
  BANK_TRANSFER: (o) => <BankTransferPanel order={o} />,
  PAYPAL:        (o) => <PayPalPanel order={o} />,
};

export default function OrderPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  if (!state) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy thông tin thanh toán.</p>
          <Button asChild><Link to="/cart">Quay lại giỏ hàng</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const { order, paymentMethod } = state;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8 text-muted-foreground">
          <Link to="/cart" className="hover:text-primary flex items-center gap-1 transition-colors">
            <ShoppingCart size={14} /> Giỏ hàng
          </Link>
          <ChevronRight size={14} />
          <span>Thanh toán</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-foreground">Hoàn tất</span>
        </div>

        {/* Order created banner */}
        <div
          className="flex items-start gap-3 rounded-xl p-4 mb-6"
          style={{ background: '#EAF3DE', border: '1.5px solid #97C459' }}
        >
          <CheckCircle2 size={20} className="shrink-0 mt-0.5" style={{ color: '#3B6D11' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#27500A' }}>Đơn hàng đã được tạo thành công!</p>
            <p className="text-xs mt-0.5" style={{ color: '#3B6D11' }}>
              Mã đơn: <span className="font-mono font-bold">{order.orderCode}</span>
              {' '}— Hoàn tất thanh toán bên dưới để mở khóa khóa học
            </p>
          </div>
        </div>

        {/* Payment panel */}
        <div className="border border-border rounded-2xl bg-card p-6 mb-6">
          {PANEL_MAP[paymentMethod](order)}
        </div>

        {/* After payment */}
        <div className="border border-border rounded-2xl bg-card p-5 space-y-3">
          <p className="font-semibold text-sm">Sau khi thanh toán</p>
          <div className="flex items-start gap-3">
            <BookOpen size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Khóa học sẽ được mở khóa ngay lập tức trong tài khoản của bạn.</p>
          </div>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            Xem đơn hàng của tôi <ArrowRight size={15} />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}