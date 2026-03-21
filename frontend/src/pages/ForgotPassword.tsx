import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPasswordAsync, resetPasswordAsync } from "@/redux/slices/authSlice";
import type { RootState, AppDispatch } from "@/redux/store";

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

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
    const result = await dispatch(forgotPasswordAsync({ email }));
    if (forgotPasswordAsync.fulfilled.match(result)) {
      toast({ title: "Đã gửi OTP!", description: `Mã OTP đã được gửi đến ${email}` });
      setStep(2);
    } else {
      toast({ title: "Thất bại", description: result.payload as string, variant: "destructive" });
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    const result = await dispatch(forgotPasswordAsync({ email }));
    if (forgotPasswordAsync.fulfilled.match(result)) {
      toast({ title: "Đã gửi lại OTP!" });
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast({ title: "OTP không hợp lệ", description: "Vui lòng nhập đủ 6 số.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Mật khẩu quá ngắn", description: "Mật khẩu phải có ít nhất 8 ký tự.", variant: "destructive" });
      return;
    }

    const result = await dispatch(resetPasswordAsync({ email, otp: otpString, newPassword }));
    if (resetPasswordAsync.fulfilled.match(result)) {
      toast({ title: "Đặt lại mật khẩu thành công!", description: "Bạn đã đăng nhập tự động." });
      navigate("/");
    } else {
      toast({ title: "Thất bại", description: result.payload as string, variant: "destructive" });
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
                <h1 className="text-3xl font-bold mb-2">Quên mật khẩu</h1>
                <p className="text-muted-foreground">
                  Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Nhập email của bạn"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="pl-10" required />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-8">
                Nhớ mật khẩu rồi?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link>
              </p>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Đặt lại mật khẩu</h1>
                <p className="text-muted-foreground">
                  Nhập mã OTP đã gửi đến <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg bg-background focus:border-primary focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {canResend ? (
                    <button type="button" onClick={handleResendOtp}
                      className="flex items-center gap-1 mx-auto text-primary hover:underline">
                      <RefreshCw className="w-4 h-4" /> Gửi lại OTP
                    </button>
                  ) : (
                    <span>Gửi lại sau <span className="font-semibold text-foreground">{countdown}s</span></span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="newPassword" type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </Button>

                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1 mx-auto text-sm text-muted-foreground hover:text-foreground">
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