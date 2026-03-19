import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Upload,
  X,
  Video,
  FileText,
  Image,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  createAdminCourseAsync,
  updateAdminCourseAsync,
} from "@/redux/slices/courseSlice";
import categoryService from "@/services/categoryService";
import courseService from "@/services/courseService";
import { Category, CreateCourseRequest, UpdateCourseRequest } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type LectureType = "VIDEO" | "ARTICLE";

interface Lecture {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  type: LectureType;
  videoFile?: File | null;
  videoFileName?: string;
  videoUrl?: string;
  articleContent?: string;
}

interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
}

const DEFAULT_SECTIONS: Section[] = [
  {
    id: "1",
    title: "Phần 1: Giới thiệu",
    lectures: [
      {
        id: "1-1",
        title: "Bài 1: Tổng quan khóa học",
        duration: "10:00",
        isPreview: true,
        type: "VIDEO",
      },
      {
        id: "1-2",
        title: "Bài 2: Chuẩn bị môi trường",
        duration: "15:00",
        isPreview: false,
        type: "VIDEO",
      },
    ],
  },
];

const secondsToMMSS = (secs?: number): string => {
  if (!secs) return "00:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const BASE_URL = "http://localhost:8080/api/v1";

export default function AdminCourseForm() {
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "",
    price: "",
    discountPrice: "",
    isFeatured: false,
    isBestseller: false,
  });

  // ✅ State cho ảnh
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const [learningPoints, setLearningPoints] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories({
          page: 1,
          pageSize: 100,
        });
        setCategories(res.result);
      } catch (err: any) {
        console.error("Failed to load categories", err);
        if (err.response?.status === 403)
          toast.error("Bạn không có quyền truy cập tài nguyên này");
      }
    };
    loadCategories();
  }, []);

  // Load course khi edit
  useEffect(() => {
    if (!isEditing || !id) return;
    const loadCourse = async () => {
      setLoadingCourse(true);
      try {
        const course = (await courseService.getCourseById(id)) as any;
        if (!course) return;

        setFormData({
          title: course.title || "",
          subtitle: course.smallDescription || course.subtitle || "",
          description: course.description || "",
          category: course.categoryId || course.category || "",
          level: course.level || "",
          price: course.price?.toString() || "",
          discountPrice: course.discountPrice?.toString() || "",
          isFeatured: course.outstanding || course.isFeatured || false,
          isBestseller: course.isBestseller || false,
        });

        // Load preview ảnh từ URL cũ
        if (course.thumbnail) setThumbnailPreview(course.thumbnail);
        if (course.banner) setBannerPreview(course.banner);

        // Load learningOutcomes
        if (course.learningOutcomes) {
          try {
            const points = JSON.parse(course.learningOutcomes);
            if (Array.isArray(points) && points.length > 0) {
              setLearningPoints(points);
            }
          } catch {
            setLearningPoints([course.learningOutcomes]);
          }
        }

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
                type: (l.type as LectureType) || "VIDEO",
                videoFileName: l.videoUrl || "",
                videoUrl: l.videoUrl || "",
                articleContent: l.content || "",
              })),
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load course", err);
        toast.error("Không thể tải thông tin khóa học");
      } finally {
        setLoadingCourse(false);
      }
    };
    loadCourse();
  }, [id, isEditing]);

  // Validate file ảnh: chỉ chấp nhận PNG/JPG, tối đa 5MB
  const validateImageFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file PNG, JPG hoặc WebP");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return false;
    }
    return true;
  };
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload ảnh thất bại");
    const data = await res.json();

    const url = data.data.url;
    // Nếu server trả về URL tương đối thì ghép với BASE_URL, còn URL tuyệt đối thì dùng thẳng
    return url.startsWith("http") ? url : `${BASE_URL.replace("/api/v1", "")}${url}`;
  };

  // ✅ Hàm upload video
  const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload/video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload video thất bại");
    const data = await res.json();
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate ảnh khi tạo mới
    if (!isEditing && (!thumbnailFile || !bannerFile)) {
      toast.error("Vui lòng chọn Thumbnail và Banner");
      return;
    }

    toast.loading("Đang upload ảnh...", { id: "upload" });

    let thumbnailUrl = thumbnailPreview;
    let bannerUrl = bannerPreview;

    try {
      if (thumbnailFile) thumbnailUrl = await uploadImage(thumbnailFile);
      if (bannerFile) bannerUrl = await uploadImage(bannerFile);
    } catch (err) {
      toast.dismiss("upload");
      toast.error("Upload ảnh thất bại, vui lòng thử lại");
      return;
    }

    // Upload video mới nếu có
    const hasNewVideos = sections.some(s =>
      s.lectures.some(l => l.type === "VIDEO" && l.videoFile)
    );
    if (hasNewVideos) {
      toast.loading("Đang upload video...", { id: "upload" });
    }
    try {
      const sectionsWithVideoUrl = await Promise.all(
        sections.map(async (s) => ({
          ...s,
          lectures: await Promise.all(
            s.lectures.map(async (l) => {
              if (l.type === "VIDEO" && l.videoFile) {
                const videoUrl = await uploadVideo(l.videoFile);
                return { ...l, videoUrl };
              }
              return l;
            }),
          ),
        })),
      );
      setSections(sectionsWithVideoUrl);

      toast.dismiss("upload");

      const learningOutcomesJson = JSON.stringify(
        learningPoints.filter((p) => p.trim())
      );

      const coursePayload = isEditing
        ? ({
            id: id!,
            title: formData.title,
            smallDescription: formData.subtitle,
            description: formData.description,
            thumbnail: thumbnailUrl,
            banner: bannerUrl,
            price: parseInt(formData.price) || 0,
            discountPrice: formData.discountPrice
              ? parseInt(formData.discountPrice)
              : undefined,
            level: formData.level as any,
            categoryId: formData.category,
            outstanding: formData.isFeatured,
            learningOutcomes: learningOutcomesJson,
            sections: sectionsWithVideoUrl.map((s) => ({
              title: s.title,
              lectures: s.lectures.map((l) => ({
                title: l.title,
                type: l.type,
                videoUrl: l.videoUrl || l.videoFileName,
                content: l.articleContent,
                duration:
                  l.type === "VIDEO"
                    ? parseInt(l.duration.split(":")[0]) * 60 +
                      parseInt(l.duration.split(":")[1] || "0")
                    : undefined,
                isFree: l.isPreview,
              })),
            })),
          } as UpdateCourseRequest & { id: string })
        : ({
            title: formData.title,
            smallDescription: formData.subtitle,
            description: formData.description,
            thumbnail: thumbnailUrl,
            banner: bannerUrl,
            price: parseInt(formData.price) || 0,
            discountPrice: formData.discountPrice
              ? parseInt(formData.discountPrice)
              : undefined,
            level: formData.level as any,
            categoryId: formData.category,
            learningOutcomes: learningOutcomesJson,
            sections: sectionsWithVideoUrl.map((s) => ({
              title: s.title,
              lectures: s.lectures.map((l) => ({
                title: l.title,
                type: l.type,
                videoUrl: l.videoUrl || l.videoFileName,
                content: l.articleContent,
                duration:
                  l.type === "VIDEO"
                    ? parseInt(l.duration.split(":")[0]) * 60 +
                      parseInt(l.duration.split(":")[1] || "0")
                    : undefined,
                isFree: l.isPreview,
              })),
            })),
          } as CreateCourseRequest);

      if (isEditing) {
        await dispatch(updateAdminCourseAsync(coursePayload as any)).unwrap();
        toast.success("Cập nhật khoá học thành công!");
      } else {
        await dispatch(createAdminCourseAsync(coursePayload as any)).unwrap();
        toast.success("Tạo khoá học thành công!");
      }
      navigate("/admin/courses");
    } catch (error: any) {
      toast.dismiss("upload");
      toast.error(isEditing ? "Cập nhật thất bại!" : "Tạo khóa học thất bại!");
      console.error("Course submit error", error);
    }
  };

  const addLearningPoint = () => setLearningPoints([...learningPoints, ""]);
  const removeLearningPoint = (index: number) =>
    setLearningPoints(learningPoints.filter((_, i) => i !== index));
  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...learningPoints];
    updated[index] = value;
    setLearningPoints(updated);
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: `Phần ${sections.length + 1}: Tiêu đề mới`,
        lectures: [],
      },
    ]);
  };

  const removeSection = (sectionId: string) =>
    setSections(sections.filter((s) => s.id !== sectionId));
  const updateSectionTitle = (sectionId: string, title: string) =>
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    );

  const addLecture = (sectionId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          lectures: [
            ...s.lectures,
            {
              id: `${sectionId}-${Date.now()}`,
              title: `Bài ${s.lectures.length + 1}: Tiêu đề bài giảng`,
              duration: "00:00",
              isPreview: false,
              type: "VIDEO" as LectureType,
              videoFile: null,
              videoFileName: "",
              videoUrl: "",
              articleContent: "",
            },
          ],
        };
      }),
    );
  };

  const toggleLectureType = (sectionId: string, lectureId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          lectures: s.lectures.map((l) =>
            l.id !== lectureId
              ? l
              : {
                  ...l,
                  type:
                    l.type === "VIDEO"
                      ? ("ARTICLE" as LectureType)
                      : ("VIDEO" as LectureType),
                  videoFile: null,
                  videoFileName: "",
                  videoUrl: "",
                  articleContent: "",
                  duration: l.type === "VIDEO" ? "" : "00:00",
                },
          ),
        };
      }),
    );
  };

  const updateArticleContent = (
    sectionId: string,
    lectureId: string,
    content: string,
  ) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          lectures: s.lectures.map((l) =>
            l.id === lectureId ? { ...l, articleContent: content } : l,
          ),
        };
      }),
    );
  };

  // ✅ Chỉ lưu file vào state, CHƯA upload (upload khi submit)
  const handleVideoUpload = (
    sectionId: string,
    lectureId: string,
    file: File,
  ) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const minutes = Math.floor(video.duration / 60);
      const seconds = Math.floor(video.duration % 60);
      const durationStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            lectures: s.lectures.map((l) =>
              l.id === lectureId
                ? {
                    ...l,
                    videoFile: file,
                    videoFileName: file.name,
                    duration: durationStr,
                  }
                : l,
            ),
          };
        }),
      );
    };
    video.src = URL.createObjectURL(file);
  };

  const removeVideo = (sectionId: string, lectureId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          lectures: s.lectures.map((l) =>
            l.id === lectureId
              ? {
                  ...l,
                  videoFile: null,
                  videoFileName: "",
                  videoUrl: "",
                  duration: "00:00",
                }
              : l,
          ),
        };
      }),
    );
  };

  const removeLecture = (sectionId: string, lectureId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return { ...s, lectures: s.lectures.filter((l) => l.id !== lectureId) };
      }),
    );
  };

  const updateLecture = (
    sectionId: string,
    lectureId: string,
    field: string,
    value: any,
  ) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          lectures: s.lectures.map((l) =>
            l.id === lectureId ? { ...l, [field]: value } : l,
          ),
        };
      }),
    );
  };

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-admin-muted-foreground">
          Đang tải thông tin khóa học...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/courses")}
          className="text-admin-muted-foreground hover:text-admin-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-admin-foreground">
            {isEditing ? "Chỉnh sửa khoá học" : "Thêm khoá học mới"}
          </h1>
          <p className="text-admin-muted-foreground">
            {isEditing
              ? "Cập nhật thông tin khoá học"
              : "Tạo khoá học mới cho nền tảng"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-admin-foreground">
            Thông tin cơ bản
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-admin-foreground">Tiêu đề khoá học</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Complete Web Development Bootcamp 2025"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
                required
              />
            </div>
            <div>
              <Label className="text-admin-foreground">Phụ đề</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="Mô tả ngắn gọn về khoá học"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>
            <div>
              <Label className="text-admin-foreground">Mô tả chi tiết</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-admin-card border-admin-border z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-admin-foreground">Trình độ</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value })
                  }
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

        {/* ✅ Media - Upload thật */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-admin-foreground">
            Hình ảnh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thumbnail */}
            <div>
              <Label className="text-admin-foreground">
                Thumbnail (16:9){" "}
                {!isEditing && <span className="text-red-400">*</span>}
              </Label>
              <label className="mt-1.5 block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateImageFile(file)) {
                      setThumbnailFile(file);
                      setThumbnailPreview(URL.createObjectURL(file));
                    }
                    e.target.value = "";
                  }}
                />
                {thumbnailPreview ? (
                  <div className="relative group rounded-lg overflow-hidden border border-admin-border">
                    <img
                      src={thumbnailPreview}
                      className="w-full h-40 object-cover"
                      alt="thumbnail"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                      <Image className="w-6 h-6 text-white" />
                      <p className="text-white text-sm">Click để đổi ảnh</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-admin-border rounded-lg p-8 text-center hover:border-admin-primary transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-admin-muted-foreground mb-2" />
                    <p className="text-sm text-admin-muted-foreground">
                      Kéo thả hoặc click để tải lên
                    </p>
                    <p className="text-xs text-admin-muted-foreground mt-1">
                      PNG, JPG (Khuyến nghị: 480x270)
                    </p>
                  </div>
                )}
              </label>
              {thumbnailFile && (
                <p className="text-xs text-green-400 mt-1">
                  ✓ {thumbnailFile.name}
                </p>
              )}
            </div>

            {/* Banner */}
            <div>
              <Label className="text-admin-foreground">
                Banner (16:9){" "}
                {!isEditing && <span className="text-red-400">*</span>}
              </Label>
              <label className="mt-1.5 block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && validateImageFile(file)) {
                      setBannerFile(file);
                      setBannerPreview(URL.createObjectURL(file));
                    }
                    e.target.value = "";
                  }}
                />
                {bannerPreview ? (
                  <div className="relative group rounded-lg overflow-hidden border border-admin-border">
                    <img
                      src={bannerPreview}
                      className="w-full h-40 object-cover"
                      alt="banner"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                      <Image className="w-6 h-6 text-white" />
                      <p className="text-white text-sm">Click để đổi ảnh</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-admin-border rounded-lg p-8 text-center hover:border-admin-primary transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-admin-muted-foreground mb-2" />
                    <p className="text-sm text-admin-muted-foreground">
                      Kéo thả hoặc click để tải lên
                    </p>
                    <p className="text-xs text-admin-muted-foreground mt-1">
                      PNG, JPG (Khuyến nghị: 1920x1080)
                    </p>
                  </div>
                )}
              </label>
              {bannerFile && (
                <p className="text-xs text-green-400 mt-1">
                  ✓ {bannerFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-admin-foreground">
            Giá bán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-admin-foreground">Giá gốc (VNĐ)</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="VD: 1499000"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
                required
              />
            </div>
            <div>
              <Label className="text-admin-foreground">
                Giá khuyến mãi (VNĐ)
              </Label>
              <Input
                type="number"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: e.target.value })
                }
                placeholder="VD: 399000"
                className="mt-1.5 bg-admin-accent border-admin-border text-admin-foreground"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
              <Label className="text-admin-foreground">Khoá học nổi bật</Label>
            </div>
            {/* <div className="flex items-center gap-3">
              <Switch
                checked={formData.isBestseller}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isBestseller: checked })
                }
              />
              <Label className="text-admin-foreground">Bestseller</Label>
            </div> */}
          </div>
        </div>

        {/* What you'll learn */}
        <div className="bg-admin-card border border-admin-border rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-admin-foreground">
              Bạn sẽ học được gì?
            </h2>
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
            <h2 className="text-lg font-semibold text-admin-foreground">
              Nội dung khoá học
            </h2>
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
              <div
                key={section.id}
                className="border border-admin-border rounded-lg overflow-hidden"
              >
                <div className="bg-admin-accent p-4 flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-admin-muted-foreground cursor-grab" />
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      updateSectionTitle(section.id, e.target.value)
                    }
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
                      <div
                        key={lecture.id}
                        className="flex flex-col gap-3 p-3 bg-admin-accent/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-admin-muted-foreground cursor-grab" />
                          <Input
                            value={lecture.title}
                            onChange={(e) =>
                              updateLecture(
                                section.id,
                                lecture.id,
                                "title",
                                e.target.value,
                              )
                            }
                            className="flex-1 bg-transparent border-admin-border text-admin-foreground text-sm"
                            placeholder="Tiêu đề bài giảng"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleLectureType(section.id, lecture.id)
                            }
                            className={`flex items-center gap-1.5 px-2 h-8 border-admin-border ${
                              lecture.type === "ARTICLE"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            }`}
                          >
                            {lecture.type === "VIDEO" ? (
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
                              onCheckedChange={(checked) =>
                                updateLecture(
                                  section.id,
                                  lecture.id,
                                  "isPreview",
                                  checked,
                                )
                              }
                            />
                            <span className="text-xs text-admin-muted-foreground">
                              Preview
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeLecture(section.id, lecture.id)
                            }
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="ml-7">
                          {lecture.type === "VIDEO" ? (
                            <div className="flex items-center gap-3">
                              {lecture.videoFileName ? (
                                <div className="flex items-center gap-2 flex-1 bg-admin-accent px-3 py-2 rounded-lg border border-admin-border">
                                  <Video className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-admin-foreground truncate flex-1">
                                    {lecture.videoFileName}
                                  </span>
                                  <span className="text-xs text-admin-muted-foreground bg-admin-card px-2 py-1 rounded">
                                    {lecture.duration}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeVideo(section.id, lecture.id)
                                    }
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
                                      if (file)
                                        handleVideoUpload(
                                          section.id,
                                          lecture.id,
                                          file,
                                        );
                                    }}
                                  />
                                  <div className="flex items-center justify-center gap-2">
                                    <Upload className="w-4 h-4 text-admin-muted-foreground" />
                                    <span className="text-sm text-admin-muted-foreground">
                                      Tải lên video bài giảng
                                    </span>
                                  </div>
                                </label>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <Textarea
                                value={lecture.articleContent || ""}
                                onChange={(e) =>
                                  updateArticleContent(
                                    section.id,
                                    lecture.id,
                                    e.target.value,
                                  )
                                }
                                placeholder="Nhập nội dung bài viết..."
                                rows={4}
                                className="bg-admin-accent border-admin-border text-admin-foreground text-sm resize-none"
                              />
                              <p className="text-xs text-admin-muted-foreground">
                                Hỗ trợ Markdown. Bài viết sẽ hiển thị cho học
                                viên.
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
            onClick={() => navigate("/admin/courses")}
            className="border-admin-border text-admin-foreground hover:bg-admin-accent"
          >
            Huỷ bỏ
          </Button>
          <Button
            type="submit"
            className="bg-admin-primary hover:bg-admin-primary/90"
          >
            {isEditing ? "Cập nhật khoá học" : "Tạo khoá học"}
          </Button>
        </div>
      </form>
    </div>
  );
}