import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginFacebookAsync } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";
import { toast } from "@/hooks/use-toast";

export default function FacebookCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");

    if (!accessToken) {
      toast({
        title: "Đăng nhập Facebook thất bại",
        description: "Không nhận được token từ Facebook.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const redirectTo = sessionStorage.getItem("fb_redirect_after_login") || "/";
    sessionStorage.removeItem("fb_redirect_after_login");

    dispatch(loginFacebookAsync({ token: accessToken })).then((result) => {
      if (loginFacebookAsync.fulfilled.match(result)) {
        toast({ title: "Đăng nhập Facebook thành công!" });
        navigate(redirectTo);
      } else {
        toast({
          title: "Đăng nhập Facebook thất bại",
          description: result.payload as string,
          variant: "destructive",
        });
        navigate("/login");
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Đang xử lý đăng nhập Facebook...</p>
    </div>
  );
}