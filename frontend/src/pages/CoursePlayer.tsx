import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  SkipBack,
  SkipForward,
  CheckCircle,
  FileText,
  MessageSquare,
  BookOpen,
  Clock,
  Menu,
  X,
  Star,
  Loader2,
  Trash2,
  Edit2,
  PlayCircle,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import VideoPlayer from "./VideoPlayer";
import courseService from "@/services/courseService";
import enrollmentService from "@/services/enrollmentService";
import noteService from "@/services/noteService";
import qaService from "@/services/qaService";
import reviewService from "@/services/reviewService";
import processService from "@/services/processService";
import type {
  CourseDetailResponse,
  LectureResponse,
  LectureNoteResponse,
  QAResponse,
  ReviewResponse,
} from "@/types";

const getMediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${url}`;
};

export default function CoursePlayer() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [completedLectures, setCompletedLectures] = useState<Set<string>>(
    new Set(),
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLecture, setCurrentLecture] = useState({
    section: 0,
    lecture: 0,
  });

  const [notes, setNotes] = useState<LectureNoteResponse[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<LectureNoteResponse | null>(
    null,
  );
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);

  const [questions, setQuestions] = useState<QAResponse[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, QAResponse[]>>({});
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaSending, setQaSending] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState("");

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSending, setReviewSending] = useState(false);
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    courseService
      .getCourseById(slug)
      .then(async (c) => {
        setCourse(c);
        try {
          const enrollments = await enrollmentService.getMyEnrollments();
          const found = enrollments.result.find((e) => e.courseId === c._id);
          if (found) {
            setEnrollmentId(found._id);
            try {
              const progressList = await processService.getProgress(found._id);
              const completedIds = new Set(
                progressList.filter((p) => p.completed).map((p) => p.lectureId),
              );
              setCompletedLectures(completedIds);
            } catch (_e) { /* ignore */ }
          }
        } catch (_e) { /* ignore */ }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const sections = course?.sections || [];
  const totalLectures = sections.reduce((sum, s) => sum + s.lectures.length, 0);
  const progress =
    totalLectures > 0
      ? Math.round((completedLectures.size / totalLectures) * 100)
      : 0;
  const currentSection = sections[currentLecture.section];
  const currentLectureData = currentSection?.lectures[currentLecture.lecture];

  useEffect(() => {
    if (!currentLectureData?._id) return;
    setNotesLoading(true);
    setNoteContent("");
    setEditingNote(null);
    noteService
      .getNotesByLecture(currentLectureData._id)
      .then(setNotes)
      .catch(() => {})
      .finally(() => setNotesLoading(false));
  }, [currentLectureData?._id]);

  // ── Fetch questions + answers song song ──
  useEffect(() => {
    if (!course?._id) return;
    setQaLoading(true);
    qaService
      .getQuestions(course._id, currentLectureData?._id)
      .then(async (res) => {
        setQuestions(res.result);
        // Fetch answers cho tất cả questions song song
        const entries = await Promise.all(
          res.result.map(async (q) => {
            try {
              const ans = await qaService.getAnswers(q._id);
              return [q._id, ans.result] as [string, QAResponse[]];
            } catch {
              return [q._id, []] as [string, QAResponse[]];
            }
          }),
        );
        setAnswersMap(Object.fromEntries(entries));
      })
      .catch(() => {})
      .finally(() => setQaLoading(false));
  }, [course?._id, currentLectureData?._id]);

  useEffect(() => {
    if (!course?._id) return;
    setReviewsLoading(true);
    reviewService
      .getReviewsByCourse(course._id)
      .then((res) => setReviews(res.result))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [course?._id]);

  const handleNextLecture = () => {
    const section = sections[currentLecture.section];
    if (currentLecture.lecture < section.lectures.length - 1) {
      setCurrentLecture({
        ...currentLecture,
        lecture: currentLecture.lecture + 1,
      });
    } else if (currentLecture.section < sections.length - 1) {
      setCurrentLecture({ section: currentLecture.section + 1, lecture: 0 });
    }
  };

  const handlePrevLecture = () => {
    if (currentLecture.lecture > 0) {
      setCurrentLecture({
        ...currentLecture,
        lecture: currentLecture.lecture - 1,
      });
    } else if (currentLecture.section > 0) {
      const prevSection = sections[currentLecture.section - 1];
      setCurrentLecture({
        section: currentLecture.section - 1,
        lecture: prevSection.lectures.length - 1,
      });
    }
  };

  const handleMarkComplete = async () => {
    if (!enrollmentId || !currentLectureData?._id) return;
    try {
      await processService.updateProgress(enrollmentId, {
        lectureId: currentLectureData._id,
        completed: true,
      });
      setCompletedLectures(
        (prev) => new Set([...prev, currentLectureData._id]),
      );
      toast.success("Đã đánh dấu hoàn thành!");
    } catch {
      toast.error("Không thể cập nhật tiến độ");
    }
  };

  const handleSaveNote = async () => {
    if (!currentLectureData?._id || !noteContent.trim()) return;
    setNotesSaving(true);
    try {
      if (editingNote) {
        const updated = await noteService.update(editingNote._id, {
          content: noteContent,
          timeInSeconds: 0,
        });
        setNotes((prev) =>
          prev.map((n) => (n._id === updated._id ? updated : n)),
        );
        setEditingNote(null);
        toast.success("Đã cập nhật ghi chú!");
      } else {
        const created = await noteService.create({
          content: noteContent,
          timeInSeconds: 0,
          lectureId: currentLectureData._id,
        });
        setNotes((prev) => [...prev, created]);
        toast.success("Đã lưu ghi chú!");
      }
      setNoteContent("");
    } catch {
      toast.error("Không thể lưu ghi chú");
    } finally {
      setNotesSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.delete(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Đã xóa ghi chú!");
    } catch {
      toast.error("Không thể xóa ghi chú");
    }
  };

  const handleSendQuestion = async () => {
    if (!course?._id || !questionContent.trim()) return;
    setQaSending(true);
    try {
      const created = await qaService.createQuestion({
        title: questionTitle,
        content: questionContent,
        courseId: course._id,
        lectureId: currentLectureData?._id,
      });
      setQuestions((prev) => [created, ...prev]);
      // Khởi tạo answers rỗng cho question mới
      setAnswersMap((prev) => ({ ...prev, [created._id]: [] }));
      setQuestionTitle("");
      setQuestionContent("");
      toast.success("Đã gửi câu hỏi!");
    } catch {
      toast.error("Không thể gửi câu hỏi");
    } finally {
      setQaSending(false);
    }
  };

  const handleSendAnswer = async (questionId: string) => {
    if (!answerContent.trim()) return;
    try {
      await qaService.createAnswer({ content: answerContent, questionId });
      setAnsweringId(null);
      setAnswerContent("");

      // Refresh answers của question này
      const ans = await qaService.getAnswers(questionId);
      setAnswersMap((prev) => ({ ...prev, [questionId]: ans.result }));

      // Refresh questions để cập nhật badge "Đã trả lời"
      if (course?._id) {
        const res = await qaService.getQuestions(
          course._id,
          currentLectureData?._id,
        );
        setQuestions(res.result);
      }

      toast.success("Đã gửi trả lời!");
    } catch {
      toast.error("Không thể gửi trả lời");
    }
  };

  const handleSubmitReview = async () => {
    if (!course?._id || reviewRating === 0 || !reviewText.trim()) return;
    setReviewSending(true);
    try {
      const created = await reviewService.createReview({
        rating: reviewRating,
        comment: reviewText,
        courseId: course._id,
      });
      setMyReview(created);
      setReviews((prev) => [created, ...prev]);
      toast.success("Đã gửi đánh giá!");
    } catch {
      toast.error("Không thể gửi đánh giá. Bạn có thể đã đánh giá rồi.");
    } finally {
      setReviewSending(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
          <p className="text-sm text-slate-500 font-medium">
            Đang tải khóa học...
          </p>
        </div>
      </div>
    );
  if (!course) return <Navigate to="/dashboard" replace />;

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-5 gap-4 flex-shrink-0 shadow-sm z-50">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-50 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-sm font-medium">Quay lại</span>
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-slate-800 truncate text-sm sm:text-base leading-tight">
            {course.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
            {currentSection?.title} · Bài {currentLecture.lecture + 1}
          </p>
        </div>

        {/* Progress pill */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <div className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {progress}%
          </span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-slate-600" />
          ) : (
            <Menu className="w-5 h-5 text-slate-600" />
          )}
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        <main
          className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${isSidebarOpen ? "lg:mr-[340px]" : ""}`}
        >
          {/* ── VIDEO PLAYER ── */}
          <div
            className="relative bg-black w-full"
            style={{ aspectRatio: "16/9" }}
          >
            {currentLectureData?.videoUrl ? (
              <VideoPlayer
                key={currentLectureData._id}
                src={getMediaUrl(currentLectureData.videoUrl)}
                poster={getMediaUrl(course.thumbnail || course.banner)}
                subtitleUrl={
                  (currentLectureData as LectureResponse & { subtitleUrl?: string }).subtitleUrl
                    ? getMediaUrl((currentLectureData as LectureResponse & { subtitleUrl?: string }).subtitleUrl!)
                    : undefined
                }
                subtitleLabel="Tiếng Việt"
                onEnded={handleNextLecture}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={getMediaUrl(course.thumbnail || course.banner)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                  <PlayCircle className="w-16 h-16 text-white/30" />
                  <p className="text-white/70 text-sm font-medium">
                    Bài học này chưa có video
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={handlePrevLecture}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      <SkipBack className="w-4 h-4" /> Bài trước
                    </button>
                    <button
                      onClick={handleNextLecture}
                      className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
                    >
                      Bài tiếp <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── LECTURE TITLE BAR ── */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                {currentLectureData?.title || course.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                {currentSection?.title}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <button
                onClick={handlePrevLecture}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-500"
                title="Bài trước"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextLecture}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-500"
                title="Bài tiếp"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── TABS ── */}
          <div className="flex-1 bg-slate-50">
            <Tabs defaultValue="overview" className="flex flex-col h-full">
              {/* Tab nav */}
              <div className="bg-white border-b border-slate-200 sticky top-0 z-10 flex-shrink-0">
                <TabsList className="h-auto bg-transparent p-0 w-full grid grid-cols-4">
                  {[
                    { value: "overview", icon: BookOpen, label: "Tổng quan" },
                    { value: "notes", icon: FileText, label: "Ghi chú" },
                    { value: "qa", icon: MessageSquare, label: "Hỏi đáp" },
                    { value: "reviews", icon: Star, label: "Đánh giá" },
                  ].map(({ value, icon: Icon, label }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="relative h-12 w-full rounded-none bg-transparent border-0 text-slate-500 text-sm font-medium
                        data-[state=active]:text-violet-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent
                        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
                        after:bg-violet-600 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform
                        flex items-center justify-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* ── OVERVIEW TAB ── */}
              <TabsContent
                value="overview"
                className="p-5 sm:p-6 space-y-4 mt-0"
              >
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-semibold text-slate-700 text-sm mb-2">
                    Mô tả khóa học
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {course.smallDescription}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleNextLecture}
                    className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-5 h-10 text-sm font-medium flex items-center gap-2 shadow-sm"
                  >
                    Bài tiếp theo <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMarkComplete}
                    disabled={
                      !enrollmentId ||
                      completedLectures.has(currentLectureData?._id ?? "")
                    }
                    className={`rounded-lg px-5 h-10 text-sm font-medium flex items-center gap-2 transition-all ${
                      completedLectures.has(currentLectureData?._id ?? "")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : "border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${completedLectures.has(currentLectureData?._id ?? "") ? "text-emerald-500" : ""}`}
                    />
                    {completedLectures.has(currentLectureData?._id ?? "")
                      ? "Đã hoàn thành"
                      : "Đánh dấu hoàn thành"}
                  </Button>
                </div>
              </TabsContent>

              {/* ── NOTES TAB ── */}
              <TabsContent value="notes" className="p-5 sm:p-6 space-y-4 mt-0">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-700 text-sm">
                      {editingNote
                        ? "✏️ Chỉnh sửa ghi chú"
                        : "📝 Thêm ghi chú mới"}
                    </h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <Textarea
                      placeholder="Nhập ghi chú của bạn tại đây..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={4}
                      className="resize-none border-slate-200 focus-visible:ring-violet-400 rounded-lg text-sm bg-slate-50 placeholder:text-slate-400"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveNote}
                        disabled={!noteContent.trim() || notesSaving}
                        className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4 text-sm rounded-lg"
                      >
                        {notesSaving && (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        )}
                        {editingNote ? "Cập nhật" : "Lưu ghi chú"}
                      </Button>
                      {editingNote && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingNote(null);
                            setNoteContent("");
                          }}
                          className="h-9 px-4 text-sm rounded-lg border-slate-200 text-slate-600"
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {notesLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
                      {notes.length} ghi chú
                    </p>
                    {notes.map((note) => (
                      <div
                        key={note._id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm group hover:border-slate-300 transition-colors"
                      >
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-400">
                            {new Date(note.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingNote(note);
                                setNoteContent(note.content);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 hover:text-violet-600 text-slate-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      Chưa có ghi chú nào
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Ghi chú sẽ được lưu theo từng bài học
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ── QA TAB ── */}
              <TabsContent value="qa" className="p-5 sm:p-6 space-y-4 mt-0">
                {/* Form đặt câu hỏi */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-700 text-sm">
                      💬 Đặt câu hỏi
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Giảng viên và học viên sẽ hỗ trợ bạn
                    </p>
                  </div>
                  <div className="p-5 space-y-3">
                    <input
                      type="text"
                      placeholder="Tiêu đề câu hỏi..."
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder:text-slate-400 transition"
                    />
                    <Textarea
                      placeholder="Mô tả chi tiết câu hỏi của bạn..."
                      value={questionContent}
                      onChange={(e) => setQuestionContent(e.target.value)}
                      rows={3}
                      className="border-slate-200 bg-slate-50 focus-visible:ring-violet-400 rounded-lg text-sm placeholder:text-slate-400"
                    />
                    <Button
                      onClick={handleSendQuestion}
                      disabled={!questionContent.trim() || qaSending}
                      className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4 text-sm rounded-lg"
                    >
                      {qaSending && (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      )}
                      Gửi câu hỏi
                    </Button>
                  </div>
                </div>

                {/* Danh sách câu hỏi + answers */}
                {qaLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  </div>
                ) : questions.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
                      {questions.length} câu hỏi
                    </p>
                    {questions.map((q) => (
                      <div
                        key={q._id}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                      >
                        {/* ── Câu hỏi ── */}
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <img
                              src={
                                getMediaUrl(q.user.avatar) ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                              }
                              alt={q.user.name}
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-sm text-slate-700">
                                  {q.user.name}
                                </p>
                                {q.answered && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3" /> Đã được
                                    trả lời
                                  </span>
                                )}
                              </div>
                              {q.title && (
                                <p className="font-medium text-sm text-slate-800">
                                  {q.title}
                                </p>
                              )}
                              <p className="text-sm text-slate-500 leading-relaxed mt-1">
                                {q.content}
                              </p>

                              {/* Nút trả lời */}
                              <button
                                onClick={() =>
                                  setAnsweringId(
                                    answeringId === q._id ? null : q._id,
                                  )
                                }
                                className="mt-2.5 text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Trả
                                lời
                              </button>

                              {/* Form nhập trả lời */}
                              {answeringId === q._id && (
                                <div className="mt-3 space-y-2 pl-3 border-l-2 border-violet-100">
                                  <Textarea
                                    placeholder="Nhập câu trả lời..."
                                    value={answerContent}
                                    onChange={(e) =>
                                      setAnswerContent(e.target.value)
                                    }
                                    rows={2}
                                    className="border-slate-200 bg-slate-50 text-sm rounded-lg focus-visible:ring-violet-400"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSendAnswer(q._id)}
                                      disabled={!answerContent.trim()}
                                      className="bg-violet-600 hover:bg-violet-700 text-white h-8 px-3 text-xs rounded-lg"
                                    >
                                      Gửi
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setAnsweringId(null)}
                                      className="h-8 px-3 text-xs rounded-lg border-slate-200"
                                    >
                                      Hủy
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ── Danh sách câu trả lời ── */}
                        {answersMap[q._id]?.length > 0 && (
                          <div className="border-t border-slate-100 bg-slate-50/60 pl-16 pr-5 py-4 space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {answersMap[q._id].length} câu trả lời
                            </p>
                            {answersMap[q._id].map((ans) => (
                              <div
                                key={ans._id}
                                className={`flex items-start gap-3 rounded-xl p-3.5 border ${
                                  ans.instructorAnswer
                                    ? "bg-violet-50 border-violet-100"
                                    : "bg-white border-slate-100"
                                }`}
                              >
                                <img
                                  src={
                                    getMediaUrl(ans.user.avatar) ||
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                                  }
                                  alt={ans.user.name}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-xs text-slate-700">
                                      {ans.user.name}
                                    </p>
                                    {ans.instructorAnswer && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                                        👨‍🏫 Giảng viên
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {ans.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      Chưa có câu hỏi nào
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Hãy là người đầu tiên đặt câu hỏi!
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* ── REVIEWS TAB ── */}
              <TabsContent
                value="reviews"
                className="p-5 sm:p-6 space-y-4 mt-0"
              >
                {!myReview && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-semibold text-slate-700 text-sm">
                        ⭐ Đánh giá của bạn
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Chia sẻ trải nghiệm với mọi người
                      </p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${star <= (hoverRating || reviewRating) ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                            />
                          </button>
                        ))}
                        {(hoverRating || reviewRating) > 0 && (
                          <span className="text-sm font-medium text-slate-500 ml-2">
                            {
                              [
                                "",
                                "Tệ",
                                "Không tốt",
                                "Bình thường",
                                "Tốt",
                                "Xuất sắc",
                              ][hoverRating || reviewRating]
                            }
                          </span>
                        )}
                      </div>
                      <Textarea
                        placeholder="Chia sẻ chi tiết trải nghiệm học tập của bạn..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        className="border-slate-200 bg-slate-50 focus-visible:ring-violet-400 rounded-lg text-sm placeholder:text-slate-400"
                      />
                      <Button
                        onClick={handleSubmitReview}
                        disabled={
                          reviewRating === 0 ||
                          !reviewText.trim() ||
                          reviewSending
                        }
                        className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4 text-sm rounded-lg"
                      >
                        {reviewSending && (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        )}
                        Gửi đánh giá
                      </Button>
                    </div>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
                      {reviews.length} đánh giá
                    </p>
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              getMediaUrl(review.user.avatar) ||
                              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                            }
                            alt={review.user.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <p className="font-semibold text-sm text-slate-700">
                                {review.user.name}
                              </p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                              {review.comment}
                            </p>
                            {review.adminReply && (
                              <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                                <p className="text-xs font-semibold text-violet-600 mb-1">
                                  Phản hồi từ giảng viên
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {review.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Star className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      Chưa có đánh giá nào
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Hãy là người đầu tiên đánh giá!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* ── SIDEBAR ── */}
        <aside
          className={`fixed top-16 right-0 bottom-0 w-[340px] bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 z-40 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Sidebar header */}
          <div className="px-5 py-4 border-b border-slate-200 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-800 text-sm">
                Nội dung khóa học
              </h2>
              <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-2 py-0.5 rounded-full">
                {completedLectures.size}/{totalLectures}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {progress}% hoàn thành
            </p>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto">
            <Accordion
              type="multiple"
              defaultValue={["section-0"]}
              className="w-full"
            >
              {sections.map((section, sectionIndex) => (
                <AccordionItem
                  key={section._id}
                  value={`section-${sectionIndex}`}
                  className="border-b border-slate-100"
                >
                  <AccordionTrigger className="px-5 py-3.5 hover:no-underline hover:bg-slate-50 transition-colors [&>svg]:text-slate-400">
                    <div className="text-left flex-1 min-w-0 pr-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Phần {sectionIndex + 1}
                      </p>
                      <p className="font-semibold text-sm text-slate-700 truncate">
                        {section.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {section.lectures.length} bài giảng
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    {section.lectures.map((lecture, lectureIndex) => {
                      const isActive =
                        currentLecture.section === sectionIndex &&
                        currentLecture.lecture === lectureIndex;
                      const isDone = completedLectures.has(lecture._id);
                      return (
                        <button
                          key={lecture._id}
                          onClick={() =>
                            setCurrentLecture({
                              section: sectionIndex,
                              lecture: lectureIndex,
                            })
                          }
                          className={`w-full flex items-start gap-3 px-5 py-3 text-left transition-all border-l-2 ${
                            isActive
                              ? "bg-violet-50 border-l-violet-500"
                              : "hover:bg-slate-50 border-l-transparent hover:border-l-slate-200"
                          }`}
                        >
                          {/* Status icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {isDone ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              </div>
                            ) : isActive ? (
                              <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm leading-snug truncate ${
                                isActive
                                  ? "font-semibold text-violet-700"
                                  : isDone
                                    ? "text-slate-400"
                                    : "text-slate-700"
                              }`}
                            >
                              {lecture.title}
                            </p>
                            {lecture.duration && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <span className="text-xs text-slate-400">
                                  {formatDuration(lecture.duration)}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </aside>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}