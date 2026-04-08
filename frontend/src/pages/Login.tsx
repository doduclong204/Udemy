import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginAsync,
  loginGoogleAsync,
  loginFacebookAsync,
} from "@/redux/slices/authSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginAsync({ username, password }));
    if (loginAsync.fulfilled.match(result)) {
      toast({
        title: "Chào mừng trở lại!",
        description: "Bạn đã đăng nhập thành công.",
      });
      navigate(redirectTo);
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description:
          (result.payload as string) ||
          error ||
          "Tên đăng nhập hoặc mật khẩu không đúng.",
        variant: "destructive",
      });
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      const result = await dispatch(
        loginGoogleAsync({ token: tokenResponse.access_token }),
      );
      if (loginGoogleAsync.fulfilled.match(result)) {
        toast({ title: "Đăng nhập Google thành công!" });
        navigate(redirectTo);
      } else {
        toast({
          title: "Đăng nhập Google thất bại",
          description: result.payload as string,
          variant: "destructive",
        });
      }
    },
    onError: () =>
      toast({ title: "Đăng nhập Google thất bại", variant: "destructive" }),
  });

  const handleFacebookLogin = () => {
    if (!window.FB) {
      toast({
        title: "Facebook SDK chưa sẵn sàng, vui lòng thử lại",
        variant: "destructive",
      });
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          dispatch(
            loginFacebookAsync({ token: response.authResponse.accessToken }),
          ).then((result) => {
            if (loginFacebookAsync.fulfilled.match(result)) {
              toast({ title: "Đăng nhập Facebook thành công!" });
              navigate(redirectTo);
            } else {
              toast({
                title: "Đăng nhập Facebook thất bại",
                description: result.payload as string,
                variant: "destructive",
              });
            }
          });
        }
      },
      { scope: "email,public_profile" },
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Đăng nhập tài khoản</h1>
            <p className="text-muted-foreground">
              Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
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

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="btn-google"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <Button
                type="button"
                onClick={handleFacebookLogin}
                disabled={loading}
                className="w-full text-white border-0 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(24,119,242,0.45)] hover:brightness-110 active:translate-y-0"
                style={{ backgroundColor: "#1877F2" }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Chưa có tài khoản?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
