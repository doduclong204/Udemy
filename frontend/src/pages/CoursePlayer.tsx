import { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { courses } from '@/data/mockData';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  CheckCircle,
  Circle,
  FileText,
  MessageSquare,
  BookOpen,
  Clock,
  Menu,
  X,
  Star,
} from 'lucide-react';

export default function CoursePlayer() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLecture, setCurrentLecture] = useState({ section: 0, lecture: 0 });
  const [notes, setNotes] = useState('');
  const [question, setQuestion] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const course = courses.find((c) => c.id === slug);

  if (!course) {
    return <Navigate to="/dashboard" replace />;
  }

  // Mock curriculum data
  const curriculum = [
    {
      title: 'Giới thiệu khóa học',
      lectures: [
        { title: 'Chào mừng đến với khóa học', duration: '5:30', completed: true, preview: true },
        { title: 'Cách học hiệu quả nhất', duration: '8:15', completed: true, preview: false },
        { title: 'Tổng quan nội dung', duration: '12:00', completed: false, preview: false },
      ],
    },
    {
      title: 'Kiến thức nền tảng',
      lectures: [
        { title: 'Các khái niệm cơ bản', duration: '15:20', completed: false, preview: false },
        { title: 'Cài đặt môi trường', duration: '10:45', completed: false, preview: false },
        { title: 'Bài tập thực hành 1', duration: '20:00', completed: false, preview: false },
      ],
    },
    {
      title: 'Nội dung chính',
      lectures: [
        { title: 'Bài học chuyên sâu 1', duration: '25:00', completed: false, preview: false },
        { title: 'Bài học chuyên sâu 2', duration: '30:15', completed: false, preview: false },
        { title: 'Dự án thực tế', duration: '45:00', completed: false, preview: false },
        { title: 'Tổng kết và đánh giá', duration: '10:00', completed: false, preview: false },
      ],
    },
  ];

  const totalLectures = curriculum.reduce((sum, section) => sum + section.lectures.length, 0);
  const completedLectures = curriculum.reduce(
    (sum, section) => sum + section.lectures.filter((l) => l.completed).length,
    0
  );
  const progress = Math.round((completedLectures / totalLectures) * 100);

  const currentLectureData = curriculum[currentLecture.section]?.lectures[currentLecture.lecture];

  const handleNextLecture = () => {
    const section = curriculum[currentLecture.section];
    if (currentLecture.lecture < section.lectures.length - 1) {
      setCurrentLecture({ ...currentLecture, lecture: currentLecture.lecture + 1 });
    } else if (currentLecture.section < curriculum.length - 1) {
      setCurrentLecture({ section: currentLecture.section + 1, lecture: 0 });
    }
  };

  const handlePrevLecture = () => {
    if (currentLecture.lecture > 0) {
      setCurrentLecture({ ...currentLecture, lecture: currentLecture.lecture - 1 });
    } else if (currentLecture.section > 0) {
      const prevSection = curriculum[currentLecture.section - 1];
      setCurrentLecture({
        section: currentLecture.section - 1,
        lecture: prevSection.lectures.length - 1,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 bg-foreground text-background flex items-center px-4 gap-4 flex-shrink-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Quay lại</span>
        </Link>
        <div className="h-6 w-px bg-background/20" />
        <h1 className="flex-1 font-medium truncate text-sm sm:text-base">{course.title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:inline">Tiến độ: {progress}%</span>
          <Progress value={progress} className="w-24 h-2" />
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-background/10 rounded-lg lg:hidden"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className={`flex-1 flex flex-col ${isSidebarOpen ? 'lg:mr-80' : ''}`}>
          {/* Video Player */}
          <div className="relative bg-black aspect-video w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary-foreground" />
                  ) : (
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4 text-white">
                <button onClick={handlePrevLecture} className="hover:opacity-80">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:opacity-80"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button onClick={handleNextLecture} className="hover:opacity-80">
                  <SkipForward className="w-5 h-5" />
                </button>
                <div className="flex-1 h-1 bg-white/30 rounded-full">
                  <div className="w-1/3 h-full bg-primary rounded-full" />
                </div>
                <span className="text-sm">2:15 / {currentLectureData?.duration || '5:30'}</span>
                <button className="hover:opacity-80">
                  <Volume2 className="w-5 h-5" />
                </button>
                <button className="hover:opacity-80">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="overview" className="p-4 sm:p-6">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Tổng quan</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Ghi chú</span>
                </TabsTrigger>
                <TabsTrigger value="qa" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Hỏi đáp</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="hidden sm:inline">Đánh giá</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {currentLectureData?.title || 'Chào mừng đến với khóa học'}
                  </h2>
                  <p className="text-muted-foreground">
                    Bài giảng này thuộc phần "{curriculum[currentLecture.section]?.title}"
                  </p>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Mô tả bài học</h3>
                  <p className="text-muted-foreground">
                    Trong bài học này, bạn sẽ được tìm hiểu về các khái niệm quan trọng và 
                    cách áp dụng chúng vào thực tế. Hãy chú ý theo dõi và ghi chú lại những 
                    điểm quan trọng để có thể ôn tập sau này.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={handleNextLecture} className="flex-1 sm:flex-none">
                    Bài tiếp theo
                  </Button>
                  <Button variant="outline">Đánh dấu hoàn thành</Button>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold mb-2">Ghi chú của bạn</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ghi chú sẽ được lưu tự động và gắn với bài học hiện tại
                  </p>
                </div>
                <Textarea
                  placeholder="Nhập ghi chú của bạn tại đây..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <Button>Lưu ghi chú</Button>
              </TabsContent>

              <TabsContent value="qa" className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold mb-2">Hỏi đáp</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Đặt câu hỏi cho giảng viên hoặc xem các câu hỏi từ học viên khác
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg space-y-3">
                  <Textarea
                    placeholder="Nhập câu hỏi của bạn..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                  />
                  <Button disabled={!question.trim()}>Gửi câu hỏi</Button>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="font-semibold">Câu hỏi gần đây</h3>
                  {[1, 2].map((i) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">HV</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Học viên {i}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Làm thế nào để áp dụng kiến thức này vào dự án thực tế?
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">2 ngày trước</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold mb-2">Đánh giá khóa học</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Chia sẻ trải nghiệm học tập của bạn để giúp cải thiện khóa học
                  </p>
                </div>

                {/* Rating Stars */}
                <div className="bg-secondary p-6 rounded-lg space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-3">Chọn số sao đánh giá</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || reviewRating)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {reviewRating > 0 && (
                      <p className="text-sm mt-2 font-medium">
                        {reviewRating === 5
                          ? 'Tuyệt vời!'
                          : reviewRating === 4
                          ? 'Rất tốt'
                          : reviewRating === 3
                          ? 'Bình thường'
                          : reviewRating === 2
                          ? 'Tạm được'
                          : 'Cần cải thiện'}
                      </p>
                    )}
                  </div>

                  <Textarea
                    placeholder="Chia sẻ chi tiết về trải nghiệm học tập của bạn. Khóa học có phù hợp với bạn không? Giảng viên giảng dạy như thế nào?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                  />
                  <Button disabled={reviewRating === 0 || !reviewText.trim()}>
                    Gửi đánh giá
                  </Button>
                </div>

                {/* Existing Reviews */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Đánh giá từ học viên khác</h3>
                  
                  {/* Review 1 */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">TN</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">Trần Ngọc</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= 5 ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80">
                          Khóa học rất hay và chi tiết. Giảng viên giảng dạy dễ hiểu, có nhiều ví dụ thực tế. 
                          Rất recommend cho những bạn mới bắt đầu!
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">1 tuần trước</p>
                      </div>
                    </div>
                  </div>

                  {/* Review 2 */}
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">LM</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">Lê Minh</p>
                          <div className="flex">
                            {[1, 2, 3, 4].map((star) => (
                              <Star
                                key={star}
                                className="w-3 h-3 text-yellow-500 fill-yellow-500"
                              />
                            ))}
                            <Star className="w-3 h-3 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="text-sm text-foreground/80">
                          Nội dung tốt, tuy nhiên có một số phần hơi nhanh. Nhìn chung là khóa học đáng học.
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">2 tuần trước</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Sidebar - Course Content */}
        <aside
          className={`fixed lg:fixed top-14 right-0 bottom-0 w-80 bg-card border-l border-border overflow-y-auto transition-transform z-40 ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="font-bold">Nội dung khóa học</h2>
            <p className="text-sm text-muted-foreground">
              {completedLectures}/{totalLectures} bài học đã hoàn thành
            </p>
          </div>

          <Accordion type="multiple" defaultValue={['section-0']} className="w-full">
            {curriculum.map((section, sectionIndex) => (
              <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary">
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      Phần {sectionIndex + 1}: {section.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {section.lectures.filter((l) => l.completed).length}/{section.lectures.length} bài học
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const isActive =
                      currentLecture.section === sectionIndex &&
                      currentLecture.lecture === lectureIndex;
                    return (
                      <button
                        key={lectureIndex}
                        onClick={() =>
                          setCurrentLecture({ section: sectionIndex, lecture: lectureIndex })
                        }
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors ${
                          isActive ? 'bg-primary/10' : ''
                        }`}
                      >
                        {lecture.completed ? (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              isActive ? 'font-medium text-primary' : ''
                            } truncate`}
                          >
                            {lecture.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{lecture.duration}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </aside>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
