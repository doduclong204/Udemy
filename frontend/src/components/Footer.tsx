import { Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";

export function Footer() {
  const { settings } = useSettings();

  const fbLink =
    settings?.facebookLink &&
    settings.facebookLink.trim() !== "" &&
    settings.facebookLink !== "#"
      ? settings.facebookLink
      : "https://www.facebook.com/learnhub";

  const ytLink =
    settings?.youtubeLink &&
    settings.youtubeLink.trim() !== "" &&
    settings.youtubeLink !== "#"
      ? settings.youtubeLink
      : "https://www.youtube.com/@learnhub";

  return (
    <footer className="bg-udemy-navy text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-white text-lg mb-4">
              {settings?.siteName || "LearnHub"}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>Giới thiệu về LearnHub</li>
              <li>Liên hệ với chúng tôi</li>
              <li>Cơ hội nghề nghiệp</li>
              <li>Đối tác doanh nghiệp</li>
              <li>Quan hệ nhà đầu tư</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-lg mb-4">Học viên</h4>
            <ul className="space-y-3 text-sm">
              <li>Hướng dẫn học tập</li>
              <li>Mẹo học hiệu quả</li>
              <li>Chứng chỉ hoàn thành</li>
              <li>Câu hỏi thường gặp</li>
              <li>Câu chuyện thành công</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-lg mb-4">Cộng đồng</h4>
            <ul className="space-y-3 text-sm">
              <li>Blog LearnHub</li>
              <li>Trung tâm hỗ trợ</li>
              <li>Chương trình Affiliate</li>
              <li>Điều khoản sử dụng</li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-lg mb-4">
              Theo dõi chúng tôi
            </h4>
            <div className="flex gap-3 mb-6">
              <a
                href={fbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a
                href={ytLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
              <a
                href="tel:0969654190"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Gọi điện"
              >
                <Phone className="w-5 h-5 text-white" />
              </a>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{settings?.contactPhone || "1900 1234"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>{settings?.contactEmail || "support@learnhub.vn"}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>
                  {settings?.contactAddress ||
                    "Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-700 pt-8 gap-4">
          <Link to="/" className="flex items-center gap-2">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={`${settings.siteName || "LearnHub"} logo`}
                className="h-28 w-auto object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {settings?.siteName || "LearnHub"}
              </span>
            )}
          </Link>

          <p className="text-sm text-gray-400 text-center md:text-right">
            {settings?.footerText ||
              `© ${new Date().getFullYear()} LearnHub Việt Nam. Bảo lưu mọi quyền.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
