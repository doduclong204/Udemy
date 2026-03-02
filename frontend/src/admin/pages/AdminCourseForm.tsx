import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, X, Video, FileText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { createAdminCourseAsync, updateAdminCourseAsync } from '@/redux/slices/courseSlice';
import categoryService from '@/services/categoryService';
import courseService from '@/services/courseService';
import { Category, CreateCourseRequest, UpdateCourseRequest } from '@/types';
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

const DEFAULT_SECTIONS: Section[] = [
  {
    id: '1',
    title: 'Phần 1: Giới thiệu',
    lectures: [
      { id: '1-1', title: 'Bài 1: Tổng quan khóa học', duration: '10:00', isPreview: true, type: 'VIDEO' },
      { id: '1-2', title: 'Bài 2: Chuẩn bị môi trường', duration: '15:00', isPreview: false, type: 'VIDEO' },
    ],
  },
];

// Chuyển seconds → "mm:ss"
const secondsToMMSS = (secs?: number): string => {
  if (!secs) return '00:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const PLACEHOLDER_THUMBNAIL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-size='14' font-family='sans-serif'%3EThumbnail%3C/text%3E%3C/svg%3E`;
const PLACEHOLDER_BANNER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400' viewBox='0 0 1200 400'%3E%3Crect width='1200' height='400' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236B7280' font-size='18' font-family='sans-serif'%3EBanner%3C/text%3E%3C/svg%3E`;

export default function AdminCourseForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: '',   // _id của category
    level: '',      // BASIC | INTERMEDIATE | ADVANCED
    price: '',
    discountPrice: '',
    isFeatured: false,
    isBestseller: false,
  });

  const [learningPoints, setLearningPoints] = useState<string[]>(['', '', '', '']);
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories({ page: 1, pageSize: 100 });
        setCategories(res.result);
      } catch (err: any) {
        console.error('Failed to load categories', err);
        if (err.response?.status === 403) {
          toast.error('Bạn không có quyền truy cập tài nguyên này');
        }
      }
    };
    loadCategories();
  }, []);

  // Load course data khi edit - fetch từ API thay vì mock data
  useEffect(() => {
    if (!isEditing || !id) return;

    const loadCourse = async () => {
      setLoadingCourse(true);
      try {
        const course = await courseService.getCourseById(id) as any;
        if (!course) return;

        setFormData({
          title: course.title || '',
          subtitle: course.smallDescription || course.subtitle || '',
          description: course.description || '',
          category: course.categoryId || course.category || '',
          level: course.level || '',
          price: course.price?.toString() || '',
          discountPrice: course.discountPrice?.toString() || '',
          isFeatured: course.outstanding || course.isFeatured || false,
          isBestseller: course.isBestseller || false,
        });

        // Map sections từ API nếu có
        if (course.sections && course.sections.length > 0) {
          setSections(
            course.sections.map((s: any) => ({
              id: s._id || s.id || Date.now().toString(),
              title: s.title,
              lectures: (s.lectures || []).map((l: any) => ({
                id: l._id || l.id || Date.now().toString(),
                title: l.title,
                duration: secondsToMMSS(l.duration),
                isPreview: l.isFree || false,
                type: (l.type as LectureType) || 'VIDEO',
                videoFileName: l.videoUrl || '',
                articleContent: l.content || '',
              })),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load course', err);
        toast.error('Không thể tải thông tin khóa học');
      } finally {
        setLoadingCourse(false);
      }
    };

    loadCourse();
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const coursePayload = isEditing
      ? {
          id: id!,
          title: formData.title,
          smallDescription: formData.subtitle,
          description: formData.description,
          price: parseInt(formData.price) || 0,
          discountPrice: formData.discountPrice ? parseInt(formData.discountPrice) : undefined,
          level: formData.level as any,
          categoryId: formData.category,
          outstanding: formData.isFeatured,
          sections: sections.map(s => ({
            title: s.title,
            lectures: s.lectures.map(l => ({
              title: l.title,
              type: l.type,
              videoUrl: l.videoFileName,
              content: l.articleContent,
              duration: l.type === 'VIDEO'
                ? parseInt(l.duration.split(':')[0]) * 60 + parseInt(l.duration.split(':')[1] || '0')
                : undefined,
              isFree: l.isPreview,
            })),
          })),
        } as UpdateCourseRequest & { id: string }
      : {
          title: formData.title,
          smallDescription: formData.subtitle,
          description: formData.description,
          thumbnail: PLACEHOLDER_THUMBNAIL,
          banner: PLACEHOLDER_BANNER,
          price: parseInt(formData.price) || 0,
          discountPrice: formData.discountPrice ? parseInt(formData.discountPrice) : undefined,
          level: formData.level as any,
          categoryId: formData.category,
          sections: sections.map(s => ({
            title: s.title,
            lectures: s.lectures.map(l => ({
              title: l.title,
              type: l.type,
              videoUrl: l.videoFileName,
              content: l.articleContent,
              duration: l.type === 'VIDEO'
                ? parseInt(l.duration.split(':')[0]) * 60 + parseInt(l.duration.split(':')[1] || '0')
                : undefined,
              isFree: l.isPreview,
            })),
          })),
        } as CreateCourseRequest;

    try {
      if (isEditing) {
        await dispatch(updateAdminCourseAsync(coursePayload as any)).unwrap();
        toast.success('Cập nhật khoá học thành công!');
      } else {
        await dispatch(createAdminCourseAsync(coursePayload as any)).unwrap();
        toast.success('Tạo khoá học thành công!');
      }
      navigate('/admin/courses');
    } catch (error: any) {
      toast.error(isEditing ? 'Cập nhật thất bại!' : 'Tạo khóa học thất bại!');
      console.error('Course submit error', error);
    }
  };

  const addLearningPoint = () => setLearningPoints([...learningPoints, '']);

  const removeLearningPoint = (index: number) => {
    setLearningPoints(learningPoints.filter((_, i) => i !== index));
  };

  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...learningPoints];
    updated[index] = value;
    setLearningPoints(updated);
  };

  const addSection = () => {
    setSections([...sections, {
      id: Date.now().toString(),
      title: `Phần ${sections.length + 1}: Tiêu đề mới`,
      lectures: [],
    }]);
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
          lectures: [...s.lectures, {
            id: `${sectionId}-${Date.now()}`,
            title: `Bài ${s.lectures.length + 1}: Tiêu đề bài giảng`,
            duration: '00:00',
            isPreview: false,
            type: 'VIDEO' as LectureType,
            videoFile: null,
            videoFileName: '',
            articleContent: '',
          }],
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
              videoFile: null,
              videoFileName: '',
              articleContent: '',
              duration: l.type === 'VIDEO' ? '' : '00:00',
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
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setSections(prev => prev.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            lectures: s.lectures.map(l =>
              l.id === lectureId ? { ...l, videoFile: file, videoFileName: file.name, duration: durationStr } : l
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
            l.id === lectureId ? { ...l, videoFile: null, videoFileName: '', duration: '00:00' } : l
          ),
        };
      }
      return s;
    }));
  };

  const removeLecture = (sectionId: string, lectureId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, lectures: s.lectures.filter(l => l.id !== lectureId) };
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

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-admin-muted-foreground">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

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
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
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
                    <SelectItem value="BASIC">Cơ bản</SelectItem>
                    <SelectItem value="INTERMEDIATE">Trung cấp</SelectItem>
                    <SelectItem value="ADVANCED">Nâng cao</SelectItem>
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
                              <><Video className="w-3.5 h-3.5" /><span className="text-xs">Video</span></>
                            ) : (
                              <><FileText className="w-3.5 h-3.5" /><span className="text-xs">Article</span></>
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
                        
                        <div className="ml-7">
                          {lecture.type === 'VIDEO' ? (
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
                                      if (file) handleVideoUpload(section.id, lecture.id, file);
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