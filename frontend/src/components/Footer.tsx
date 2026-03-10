import { Link } from 'react-router-dom';
import { Facebook, Youtube, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export function Footer() {
  const { settings } = useSettings();

  const fbLink = settings?.facebookLink || 'https://facebook.com/learnhub';
  const ytLink = settings?.youtubeLink || 'https://youtube.com/learnhub';

  return (
    <footer className="bg-udemy-navy text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          <div>
            <h4 className="font-bold text-white text-lg mb-4">
              {settings?.siteName || 'LearnHub'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">Giới thiệu về LearnHub</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ với chúng tôi</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Cơ hội nghề nghiệp</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors">Đối tác doanh nghiệp</Link></li>
              <li><Link to="/investors" className="hover:text-white transition-colors">Quan hệ nhà đầu tư</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-lg mb-4">Học viên</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/how-to-learn" className="hover:text-white transition-colors">Hướng dẫn học tập</Link></li>
              <li><Link to="/learning-tips" className="hover:text-white transition-colors">Mẹo học hiệu quả</Link></li>
              <li><Link to="/certificates" className="hover:text-white transition-colors">Chứng chỉ hoàn thành</Link></li>
              <li><Link to="/student-faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/student-success" className="hover:text-white transition-colors">Câu chuyện thành công</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-lg mb-4">Cộng đồng</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog LearnHub</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Trung tâm hỗ trợ</Link></li>
              <li><Link to="/affiliate" className="hover:text-white transition-colors">Chương trình Affiliate</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-lg mb-4">Theo dõi chúng tôi</h4>
            <div className="flex gap-3 mb-6">
              <a href={fbLink} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href={ytLink} target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube">
                <Youtube className="w-5 h-5 text-white" />
              </a>
              <a href="https://zalo.me/learnhub" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Zalo">
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-gray-300">{settings?.contactPhone || '1900 1234'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-gray-300">{settings?.contactEmail || 'support@learnhub.vn'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-gray-300">{settings?.contactAddress || 'Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM'}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-700 pt-8 gap-4">
          <Link to="/" className="text-2xl font-bold text-white">
            {settings?.siteName || 'LearnHub'}
          </Link>
          <p className="text-sm text-gray-400 text-center md:text-right">
            {settings?.footerText || '© 2025 LearnHub Việt Nam. Bảo lưu mọi quyền.'}
          </p>
        </div>
      </div>
    </footer>
  );
}