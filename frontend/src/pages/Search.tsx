import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Rating } from '@/components/Rating';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, Loader2, Star, BarChart2, Tag, DollarSign } from 'lucide-react';
import searchService from '@/services/searchService';
import categoryService from '@/services/categoryService';
import type { CourseSummaryResponse, Category } from '@/types';

const RATING_OPTIONS = [4.5, 4.0, 3.5, 3.0];

const LEVELS = [
  { label: 'Tất cả trình độ', value: 'ALL' },
  { label: 'Người mới',       value: 'BASIC' },
  { label: 'Trung cấp',       value: 'INTERMEDIATE' },
  { label: 'Nâng cao',        value: 'ADVANCED' },
];

export default function Search() {
  const [searchParams] = useSearchParams();
  const query         = searchParams.get('q')        || '';
  const categoryParam = searchParams.get('category') || '';

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedRating,     setSelectedRating]     = useState<number | null>(null);
  const [selectedLevels,     setSelectedLevels]     = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [priceFilter,  setPriceFilter]  = useState<'all' | 'paid' | 'free'>('all');
  const [sortBy,       setSortBy]       = useState<string>('createdAt,desc');
  const [showFilters,  setShowFilters]  = useState(true);

  // ── Data state ────────────────────────────────────────────────────────────
  const [courses,    setCourses]    = useState<CourseSummaryResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  const PAGE_SIZE = 12;

  // ── Load categories once ──────────────────────────────────────────────────
  useEffect(() => {
    categoryService.getCategories({ pageSize: 100 })
      .then((res) => setCategories(res.result))
      .catch(() => {});
  }, []);

  // Sync category từ URL param khi thay đổi
  useEffect(() => {
    if (categoryParam) setSelectedCategories([categoryParam]);
  }, [categoryParam]);

  // ── Fetch courses ─────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 0 : page;
    if (resetPage) setPage(0);

    try {
      // Dùng category đầu tiên nếu có (spring-filter không hỗ trợ OR dễ dàng)
      const categoryFilter = selectedCategories.length > 0
        ? selectedCategories[0]
        : (categoryParam || undefined);

      const levelFilter = selectedLevels.length === 1 && selectedLevels[0] !== 'ALL'
        ? selectedLevels[0]
        : undefined;

      const res = await searchService.searchCourses({
        page:      currentPage,
        pageSize:  PAGE_SIZE,
        search:    query || undefined,
        category:  categoryFilter,
        level:     levelFilter,
        minRating: selectedRating ?? undefined,
        priceType: priceFilter,
        sort:      sortBy,
      });

      setCourses(res.result);
      setTotal(res.meta.total);
      setTotalPages(res.meta.pages);
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, categoryParam, selectedRating, selectedLevels, selectedCategories, priceFilter, sortBy, page]);

  // Re-fetch khi filter thay đổi → reset page 0
  useEffect(() => {
    fetchCourses(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryParam, selectedRating, selectedLevels, selectedCategories, priceFilter, sortBy]);

  // Re-fetch khi chuyển trang
  useEffect(() => {
    fetchCourses(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleLevel = (value: string) =>
    setSelectedLevels((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]
    );

  const toggleCategory = (name: string) =>
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );

  const clearFilters = () => {
    setSelectedRating(null);
    setSelectedLevels([]);
    setSelectedCategories(categoryParam ? [categoryParam] : []);
    setPriceFilter('all');
  };

  const hasActiveFilters =
    selectedRating !== null ||
    selectedLevels.length > 0 ||
    (selectedCategories.length > 0 && !categoryParam) ||
    (selectedCategories.length > 0 && selectedCategories[0] !== categoryParam) ||
    priceFilter !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {query
              ? `Kết quả tìm kiếm "${query}"`
              : categoryParam
              ? `Khóa học ${categoryParam}`
              : 'Tất cả khóa học'}
          </h1>
          <p className="text-muted-foreground">{total} kết quả</p>
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </h3>
              </div>

              {/* ── Đánh giá ── */}
              <div>
                <h4 className="font-semibold mb-3">Đánh giá</h4>
                <div className="space-y-1">
                  {RATING_OPTIONS.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                        selectedRating === rating ? 'bg-udemy-purple-light' : 'hover:bg-secondary'
                      }`}
                    >
                      <Rating rating={rating} showNumber={false} size="sm" />
                      <span className="text-sm">{rating} trở lên</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Trình độ ── */}
              <div>
                <h4 className="font-semibold mb-3">Trình độ</h4>
                <div className="space-y-2">
                  {LEVELS.map((lvl) => (
                    <label key={lvl.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedLevels.includes(lvl.value)}
                        onCheckedChange={() => toggleLevel(lvl.value)}
                      />
                      <span className="text-sm">{lvl.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Danh mục ── */}
              {categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Danh mục</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedCategories.includes(cat.name)}
                          onCheckedChange={() => toggleCategory(cat.name)}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Giá ── */}
              <div>
                <h4 className="font-semibold mb-3">Giá</h4>
                <div className="space-y-2">
                  {(['all', 'paid', 'free'] as const).map((price) => (
                    <label key={price} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceFilter === price}
                        onChange={() => setPriceFilter(price)}
                        className="accent-primary"
                      />
                      <span className="text-sm">
                        {price === 'all' ? 'Tất cả' : price === 'paid' ? 'Trả phí' : 'Miễn phí'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="createdAt,desc">Mới nhất</option>
                  <option value="totalStudents,desc">Phổ biến nhất</option>
                  <option value="price,asc">Giá tăng dần</option>
                  <option value="price,desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {selectedRating !== null && (
                  <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-sm font-medium">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {selectedRating}+ sao
                    <button
                      onClick={() => setSelectedRating(null)}
                      className="ml-0.5 w-4 h-4 rounded-full bg-yellow-200 hover:bg-yellow-300 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {selectedLevels.map((lvl) => {
                  const label = LEVELS.find((l) => l.value === lvl)?.label ?? lvl;
                  return (
                    <span key={lvl} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                      <BarChart2 className="w-3.5 h-3.5" />
                      {label}
                      <button
                        onClick={() => toggleLevel(lvl)}
                        className="ml-0.5 w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
                {selectedCategories
                  .filter((c) => c !== categoryParam)
                  .map((cat) => (
                    <span key={cat} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-sm font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      {cat}
                      <button
                        onClick={() => toggleCategory(cat)}
                        className="ml-0.5 w-4 h-4 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                {priceFilter !== 'all' && (
                  <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    {priceFilter === 'paid' ? 'Trả phí' : 'Miễn phí'}
                    <button
                      onClick={() => setPriceFilter('all')}
                      className="ml-0.5 w-4 h-4 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {/* Nút xóa tất cả — nằm cuối hàng chips */}
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary rounded-full text-sm transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Course grid */}
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : courses.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <Button
                      variant="outline" size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Trước
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === i
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-secondary'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <Button
                      variant="outline" size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <p className="text-xl font-semibold mb-2">Không tìm thấy khóa học</p>
                <p className="text-muted-foreground mb-4">
                  Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}