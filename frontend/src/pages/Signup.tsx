import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { sendRegisterOtpAsync, verifyOtpAsync } from "@/redux/slices/authSlice";
import type { RootState, AppDispatch } from "@/redux/store";

export default function Signup() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  // Countdown timer
  useEffect(() => {
    if (step !== 2) return;
    setCountdown(120);
    setCanResend(false);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast({
        title: "Yêu cầu điều khoản",
        description: "Vui lòng đồng ý với điều khoản.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 8) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu phải có ít nhất 8 ký tự.",
        variant: "destructive",
      });
      return;
    }

    const result = await dispatch(
      sendRegisterOtpAsync({ email, password, name }),
    );
    if (sendRegisterOtpAsync.fulfilled.match(result)) {
      toast({
        title: "Đã gửi OTP!",
        description: `Mã OTP đã được gửi đến ${email}`,
      });
      setStep(2);
    } else {
      toast({
        title: "Thất bại",
        description: result.payload as string,
        variant: "destructive",
      });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    const result = await dispatch(
      sendRegisterOtpAsync({ email, password, name }),
    );
    if (sendRegisterOtpAsync.fulfilled.match(result)) {
      toast({
        title: "Đã gửi lại OTP!",
        description: `Mã OTP mới đã được gửi đến ${email}`,
      });
      setCountdown(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast({
        title: "OTP không hợp lệ",
        description: "Vui lòng nhập đủ 6 số.",
        variant: "destructive",
      });
      return;
    }

    const result = await dispatch(verifyOtpAsync({ email, otp: otpString }));
    if (verifyOtpAsync.fulfilled.match(result)) {
      toast({
        title: "Đăng ký thành công!",
        description: "Vui lòng đăng nhập để tiếp tục.",
      });
      navigate("/login");
    } else {
      toast({
        title: "OTP không đúng",
        description: result.payload as string,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Tạo tài khoản</h1>
                <p className="text-muted-foreground">
                  Bắt đầu hành trình học tập của bạn.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nhập họ và tên"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tạo mật khẩu (tối thiểu 8 ký tự)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) =>
                      setAgreeTerms(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal leading-tight cursor-pointer"
                  >
                    Tôi đồng ý với{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      Chính sách bảo mật
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Đang gửi OTP..." : "Tiếp tục"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-8">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Xác thực email</h1>
                <p className="text-muted-foreground">
                  Mã OTP đã được gửi đến{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg bg-background focus:border-primary focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="flex items-center gap-1 mx-auto text-primary hover:underline"
                    >
                      <RefreshCw className="w-4 h-4" /> Gửi lại OTP
                    </button>
                  ) : (
                    <span>
                      Gửi lại sau{" "}
                      <span className="font-semibold text-foreground">
                        {countdown}s
                      </span>
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Đang xác thực..." : "Xác nhận"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 mx-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
