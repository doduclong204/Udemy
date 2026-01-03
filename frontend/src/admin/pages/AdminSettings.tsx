import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Upload, Globe, Mail, Phone, MapPin, Facebook, Youtube } from 'lucide-react';
import { siteSettings } from '@/data/adminMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Tên website không được để trống').max(100, 'Tối đa 100 ký tự'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
  logo: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu không hợp lệ'),
  contactEmail: z.string().email('Email không hợp lệ'),
  contactPhone: z.string().min(10, 'Số điện thoại không hợp lệ').max(15, 'Số điện thoại không hợp lệ'),
  address: z.string().max(200, 'Địa chỉ tối đa 200 ký tự').optional(),
  facebook: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  youtube: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  footerText: z.string().max(200, 'Tối đa 200 ký tự').optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: siteSettings.siteName,
      description: siteSettings.description,
      logo: siteSettings.logo,
      primaryColor: siteSettings.primaryColor,
      contactEmail: siteSettings.contactEmail,
      contactPhone: siteSettings.contactPhone,
      address: siteSettings.address,
      facebook: siteSettings.facebook || '',
      youtube: siteSettings.youtube || '',
      footerText: siteSettings.footerText || '© 2025 LearnHub Việt Nam',
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', data);
      toast.success('Đã lưu cài đặt thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-admin-foreground">Cài đặt hệ thống</h1>
        <p className="text-admin-muted-foreground">Quản lý thông tin và cấu hình website</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Identity */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-admin-foreground flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Thông tin website
            </h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="siteName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground">Tên website *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="LearnHub"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground">Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="Nền tảng học trực tuyến hàng đầu Việt Nam"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-admin-foreground">Logo</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  <div className="w-24 h-24 bg-admin-accent rounded-lg flex items-center justify-center border border-admin-border">
                    {form.watch('logo') ? (
                      <img src={form.watch('logo')} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                      <span className="text-admin-muted-foreground text-xs">Chưa có logo</span>
                    )}
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="border-admin-border text-admin-foreground hover:bg-admin-accent"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Tải lên logo mới
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground">Màu chủ đạo</FormLabel>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          className="w-32 bg-admin-accent border-admin-border text-admin-foreground font-mono"
                          placeholder="#A435F0"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-admin-foreground flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Thông tin liên hệ
            </h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email liên hệ *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="support@learnhub.vn"
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
                    <FormLabel className="text-admin-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Số điện thoại *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="1900 1234"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Địa chỉ
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-admin-foreground">Mạng xã hội</h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="https://facebook.com/learnhub"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-admin-foreground flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-admin-accent border-admin-border text-admin-foreground"
                        placeholder="https://youtube.com/learnhub"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Footer Settings */}
          <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-admin-foreground">Cài đặt Footer</h2>

            <FormField
              control={form.control}
              name="footerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-admin-foreground">Dòng bản quyền</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-admin-accent border-admin-border text-admin-foreground"
                      placeholder="© 2025 LearnHub Việt Nam"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              {form.formState.isSubmitting ? (
                'Đang lưu...'
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
