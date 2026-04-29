import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  Loader2,
} from "lucide-react";
import settingService from "@/services/settingService";
import { SettingRequest } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import uploadService from "@/services/uploadService";

const schema = z.object({
  siteName: z.string().min(1, "Tên website không được để trống").max(100),
  siteDescription: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu không hợp lệ")
    .optional(),
  contactEmail: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().max(15).optional(),
  contactAddress: z.string().max(200).optional(),
  facebookLink: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  youtubeLink: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  footerText: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

const toRequest = (d: FormData): SettingRequest => ({
  siteName: d.siteName,
  siteDescription: d.siteDescription,
  logo: d.logo ?? "",
  favicon: d.favicon,
  primaryColor: d.primaryColor,
  contactEmail: d.contactEmail,
  contactPhone: d.contactPhone,
  contactAddress: d.contactAddress,
  facebookLink: d.facebookLink,
  youtubeLink: d.youtubeLink,
  footerText: d.footerText,
});

export default function AdminSettings() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      logo: "",
      favicon: "",
      primaryColor: "#A435F0",
      contactEmail: "",
      contactPhone: "",
      contactAddress: "",
      facebookLink: "",
      youtubeLink: "",
      footerText: "",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const settings = await settingService.getSettings();
        form.reset({
          siteName: settings.siteName ?? "",
          siteDescription: settings.siteDescription ?? "",
          logo: settings.logo ?? "",
          favicon: settings.favicon ?? "",
          primaryColor: settings.primaryColor ?? "#A435F0",
          contactEmail: settings.contactEmail ?? "",
          contactPhone: settings.contactPhone ?? "",
          contactAddress: settings.contactAddress ?? "",
          facebookLink: settings.facebookLink ?? "",
          youtubeLink: settings.youtubeLink ?? "",
          footerText: settings.footerText ?? "",
        });
      } catch {
        toast.error("Không thể tải cài đặt");
      }
    })();
  }, []); // eslint-disable-line

  const onSubmit = async (data: FormData) => {
    try {
      await settingService.updateSettings(toRequest(data));
      toast.success("Đã lưu cài đặt thành công!");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fullUrl = await uploadService.uploadImage(file);
      form.setValue("logo", fullUrl);
      toast.success("Upload logo thành công!");
    } catch {
      toast.error("Upload logo thất bại!");
    }
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-foreground">
          Cài đặt hệ thống
        </h1>
        <p className="text-admin-muted-foreground">
          Quản lý thông tin và cấu hình website
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Identity */}
          <Section
            icon={<Globe className="w-5 h-5" />}
            title="Thông tin website"
          >
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground">
                    Tên website <Req />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="LearnHub"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground">
                    Mô tả ngắn
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Nền tảng học trực tuyến hàng đầu Việt Nam"
                      className={`${INPUT} resize-none`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo */}
            <div>
              <Label className="text-admin-foreground">Logo</Label>
              <div className="mt-1.5 flex items-center gap-4">
                <div className="w-24 h-24 bg-admin-accent rounded-lg flex items-center justify-center border border-admin-border overflow-hidden">
                  {form.watch("logo") ? (
                    <img
                      src={form.watch("logo")}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-admin-muted-foreground text-xs text-center px-2">
                      Chưa có logo
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-admin-border text-admin-foreground hover:bg-admin-accent"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Tải lên logo
                  </Button>
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Hoặc dán URL logo..."
                            className={INPUT}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Primary Color */}
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground">
                    Màu chủ đạo
                  </FormLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={field.value ?? "#A435F0"}
                      onChange={field.onChange}
                      className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="#A435F0"
                        className={`w-32 font-mono ${INPUT}`}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {/* Contact */}
          <Section
            icon={<Mail className="w-5 h-5" />}
            title="Thông tin liên hệ"
          >
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Email liên hệ
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="support@learnhub.vn"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Số điện thoại
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="1900 1234"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Địa chỉ
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {/* Social */}
          <Section title="Mạng xã hội">
            <FormField
              control={form.control}
              name="facebookLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5" />
                    Facebook
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://facebook.com/learnhub"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtubeLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5" />
                    YouTube
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://youtube.com/learnhub"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {/* Footer */}
          <Section title="Cài đặt Footer">
            <FormField
              control={form.control}
              name="footerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground">
                    Dòng bản quyền
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="© 2025 LearnHub Việt Nam"
                      className={INPUT}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="!bg-blue-600 hover:!bg-blue-500 text-white min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const INPUT =
  "bg-admin-accent border-admin-border text-admin-foreground placeholder:text-admin-muted-foreground";
const Req = () => <span className="text-red-400 ml-0.5">*</span>;

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-5">
      <h2 className="text-base font-semibold text-admin-foreground flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}