import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, X, Video, FileText } from 'lucide-react';
import { adminCourses } from '@/data/adminMockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type LectureType = 'VIDEO' | 'ARTICLE';

interface Lecture {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  type: LectureType;
  videoFile?: File | null;
  videoFileName?: string;
  articleContent?: string;
}

interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

export default function AdminCourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const existingCourse = isEditing ? adminCourses.find(c => c.id === id) : null;

  const [formData, setFormData] = useState({
    title: existingCourse?.title || '',
    subtitle: existingCourse?.subtitle || '',
    description: existingCourse?.description || '',
    category: existingCourse?.category || '',
    level: existingCourse?.level || '',
    price: existingCourse?.price?.toString() || '',
    discountPrice: existingCourse?.discountPrice?.toString() || '',
    isFeatured: existingCourse?.isFeatured || false,
    isBestseller: existingCourse?.isBestseller || false,
  });

  const [learningPoints, setLearningPoints] = useState<string[]>(
    ['', '', '', '']
  );

  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Phần 1: Giới thiệu',
      lectures: [
        { id: '1-1', title: 'Bài 1: Tổng quan khóa học', duration: '10:00', isPreview: true, type: 'VIDEO' },
        { id: '1-2', title: 'Bài 2: Chuẩn bị môi trường', duration: '15:00', isPreview: false, type: 'VIDEO' },
      ],
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEditing ? 'Cập nhật khoá học thành công!' : 'Tạo khoá học thành công!');
    navigate('/admin/courses');
  };

  const addLearningPoint = () => {
    setLearningPoints([...learningPoints, '']);
  };

  const removeLearningPoint = (index: number) => {
    setLearningPoints(learningPoints.filter((_, i) => i !== index));
  };

  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...learningPoints];
    updated[index] = value;
    setLearningPoints(updated);
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: `Phần ${sections.length + 1}: Tiêu đề mới`,
      lectures: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, title } : s));
  };

  const addLecture = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          lectures: [
            ...s.lectures,
            {
              id: `${sectionId}-${Date.now()}`,
              title: `Bài ${s.lectures.length + 1}: Tiêu đề bài giảng`,
              duration: '00:00',
              isPreview: false,
              type: 'VIDEO' as LectureType,
              videoFile: null,
              videoFileName: '',
              articleContent: '',
            },
          ],
        };
      }
      return s;
    }));
  };

  const toggleLectureType = (sectionId: string, lectureId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          lectures: s.lectures.map(l => 
            l.id === lectureId ? { 
              ...l, 
              type: l.type === 'VIDEO' ? 'ARTICLE' as LectureType : 'VIDEO' as LectureType,
              // Reset content when switching type
              videoFile: null,
              videoFileName: '',
              articleContent: '',
              duration: l.type === 'VIDEO' ? '' : '00:00'
            } : l
          ),
        };
      }
      return s;
    }));
  };

  const updateArticleContent = (sectionId: string, lectureId: string, content: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          lectures: s.lectures.map(l => 
            l.id === lectureId ? { ...l, articleContent: content } : l
          ),
        };
      }
      return s;
    }));
  };

  const handleVideoUpload = (sectionId: string, lectureId: string, file: File) => {
    // Tính duration từ video file
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setSections(sections.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            lectures: s.lectures.map(l => 
              l.id === lectureId ? { 
                ...l, 
                videoFile: file, 
                videoFileName: file.name,
                duration: durationStr 
              } : l
            ),
          };
        }
        return s;
      }));
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = (sectionId: string, lectureId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          lectures: s.lectures.map(l => 
            l.id === lectureId ? { 
              ...l, 
              videoFile: null, 
              videoFileName: '',
              duration: '00:00' 
            } : l
          ),
        };
      }
      return s;
    }));
  };

  const removeLecture = (sectionId: string, lectureId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          lectures: s.lectures.filter(l => l.id !== lectureId),
        };
      }
      return s;
    }));
  };

  const updateLecture = (sectionId: string, lectureId: string, field: string, value: any) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          lectures: s.lectures.map(l => 
            l.id === lectureId ? { ...l, [field]: value } : l
          ),
        };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/courses')}
          className="text-admin-muted-foreground hover:text-admin-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">
            {isEditing ? 'Chỉnh sửa khoá học' : 'Thêm khoá học mới'}
          </h1>
          <p className="text-admin-muted-foreground">
            {isEditing ? 'Cập nhật thông tin khoá học' : 'Tạo khoá học mới cho nền tảng'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-admin-foreground">Thông tin cơ bản</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-admin-foreground">Tiêu đề khoá học</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Complete Web Development Bootcamp 2025"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
                required
              />
            </div>

            <div>
              <Label className="text-admin-foreground">Phụ đề</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Mô tả ngắn gọn về khoá học"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>

            <div>
              <Label className="text-admin-foreground">Mô tả chi tiết</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả đầy đủ về nội dung và lợi ích của khoá học..."
                rows={5}
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-admin-foreground">Danh mục</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border z-50">
                    <SelectItem value="Lập trình">Lập trình</SelectItem>
                    <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                    <SelectItem value="Thiết kế">Thiết kế</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="CNTT & Phần mềm">CNTT & Phần mềm</SelectItem>
                    <SelectItem value="Phát triển bản thân">Phát triển bản thân</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-admin-foreground">Trình độ</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border z-50">
                    <SelectItem value="Beginner">Cơ bản</SelectItem>
                    <SelectItem value="Intermediate">Trung cấp</SelectItem>
                    <SelectItem value="Advanced">Nâng cao</SelectItem>
                    <SelectItem value="All Levels">Tất cả trình độ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-admin-foreground">Hình ảnh</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-admin-foreground">Thumbnail (16:9)</Label>
              <div className="mt-1.5 border-2 border-dashed border-admin-border rounded-lg p-8 text-center hover:border-admin-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-admin-muted-foreground mb-2" />
                <p className="text-sm text-admin-muted-foreground">Kéo thả hoặc click để tải lên</p>
                <p className="text-xs text-admin-muted-foreground mt-1">PNG, JPG (Khuyến nghị: 480x270)</p>
              </div>
            </div>

            <div>
              <Label className="text-admin-foreground">Banner (16:9)</Label>
              <div className="mt-1.5 border-2 border-dashed border-admin-border rounded-lg p-8 text-center hover:border-admin-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-admin-muted-foreground mb-2" />
                <p className="text-sm text-admin-muted-foreground">Kéo thả hoặc click để tải lên</p>
                <p className="text-xs text-admin-muted-foreground mt-1">PNG, JPG (Khuyến nghị: 1920x1080)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-admin-foreground">Giá bán</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-admin-foreground">Giá gốc (VNĐ)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="VD: 1499000"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
                required
              />
            </div>

            <div>
              <Label className="text-admin-foreground">Giá khuyến mãi (VNĐ)</Label>
              <Input
                type="number"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                placeholder="VD: 399000"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
              <Label className="text-admin-foreground">Khoá học nổi bật</Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isBestseller}
                onCheckedChange={(checked) => setFormData({ ...formData, isBestseller: checked })}
              />
              <Label className="text-admin-foreground">Bestseller</Label>
            </div>
          </div>
        </div>

        {/* What you'll learn */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-admin-foreground">Bạn sẽ học được gì?</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLearningPoint}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm
            </Button>
          </div>
          
          <div className="space-y-3">
            {learningPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={point}
                  onChange={(e) => updateLearningPoint(index, e.target.value)}
                  placeholder={`Điểm học được ${index + 1}`}
                  className="bg-admin-accent border-admin-border text-admin-foreground"
                />
                {learningPoints.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLearningPoint(index)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-admin-foreground">Nội dung khoá học</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSection}
              className="border-admin-border text-admin-foreground hover:bg-admin-accent"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm phần
            </Button>
          </div>
          
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border border-admin-border rounded-lg overflow-hidden">
                {/* Section Header */}
                <div className="bg-admin-accent p-4 flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-admin-muted-foreground cursor-grab" />
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    className="flex-1 bg-transparent border-0 p-0 text-admin-foreground font-medium focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addLecture(section.id)}
                    className="text-admin-primary hover:bg-admin-primary/10"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Bài giảng
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(section.id)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Lectures */}
                {section.lectures.length > 0 && (
                  <div className="p-4 space-y-3">
                    {section.lectures.map((lecture) => (
                      <div key={lecture.id} className="flex flex-col gap-3 p-3 bg-admin-accent/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-admin-muted-foreground cursor-grab" />
                          <Input
                            value={lecture.title}
                            onChange={(e) => updateLecture(section.id, lecture.id, 'title', e.target.value)}
                            className="flex-1 bg-transparent border-admin-border text-admin-foreground text-sm"
                            placeholder="Tiêu đề bài giảng"
                          />
                          
                          {/* Toggle Lecture Type Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleLectureType(section.id, lecture.id)}
                            className={`flex items-center gap-1.5 px-2 h-8 border-admin-border ${
                              lecture.type === 'ARTICLE' 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {lecture.type === 'VIDEO' ? (
                              <>
                                <Video className="w-3.5 h-3.5" />
                                <span className="text-xs">Video</span>
                              </>
                            ) : (
                              <>
                                <FileText className="w-3.5 h-3.5" />
                                <span className="text-xs">Article</span>
                              </>
                            )}
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={lecture.isPreview}
                              onCheckedChange={(checked) => updateLecture(section.id, lecture.id, 'isPreview', checked)}
                            />
                            <span className="text-xs text-admin-muted-foreground">Preview</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLecture(section.id, lecture.id)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Content Area - Video or Article */}
                        <div className="ml-7">
                          {lecture.type === 'VIDEO' ? (
                            // Video Upload Area
                            <div className="flex items-center gap-3">
                              {lecture.videoFileName ? (
                                <div className="flex items-center gap-2 flex-1 bg-admin-accent px-3 py-2 rounded-lg border border-admin-border">
                                  <Video className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-admin-foreground truncate flex-1">{lecture.videoFileName}</span>
                                  <span className="text-xs text-admin-muted-foreground bg-admin-card px-2 py-1 rounded">{lecture.duration}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeVideo(section.id, lecture.id)}
                                    className="h-6 w-6 text-red-400 hover:bg-red-500/10"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex-1 border-2 border-dashed border-admin-border rounded-lg p-3 text-center hover:border-purple-400 transition-colors cursor-pointer">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleVideoUpload(section.id, lecture.id, file);
                                      }
                                    }}
                                  />
                                  <div className="flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4 text-admin-muted-foreground" />
                                    <span className="text-sm text-admin-muted-foreground">Tải lên video bài giảng</span>
                                  </div>
                                </label>
                              )}
                            </div>
                          ) : (
                            // Article Content Area
                            <div className="flex flex-col gap-2">
                              <Textarea
                                value={lecture.articleContent || ''}
                                onChange={(e) => updateArticleContent(section.id, lecture.id, e.target.value)}
                                placeholder="Nhập nội dung bài viết..."
                                rows={4}
                                className="bg-admin-accent border-admin-border text-admin-foreground text-sm resize-none"
                              />
                              <p className="text-xs text-admin-muted-foreground">
                                Hỗ trợ Markdown. Bài viết sẽ hiển thị cho học viên.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/courses')}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >
            Huỷ bỏ
          </Button>
          <Button
            type="submit"
            className="bg-admin-primary hover:bg-admin-primary/90"
          >
            {isEditing ? 'Cập nhật khoá học' : 'Tạo khoá học'}
          </Button>
        </div>
      </form>
    </div>
  );
}
