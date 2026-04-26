import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Rating } from '@/components/Rating';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Filter, X, Loader2, Star, BarChart2, Tag, DollarSign,
  ChevronDown, ArrowUpDown, TrendingUp, ArrowUpNarrowWide, ArrowDownNarrowWide,
} from 'lucide-react';
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

const SORT_OPTIONS = [
  { value: 'createdAt,desc',     label: 'Mới nhất',      icon: ArrowUpDown },
  { value: 'totalStudents,desc', label: 'Phổ biến nhất', icon: TrendingUp },
    { value: 'effectivePrice,asc',          label: 'Giá tăng dần',  icon: ArrowUpNarrowWide },
    { value: 'effectivePrice,desc',         label: 'Giá giảm dần',  icon: ArrowDownNarrowWide },
];

const PAGE_SIZE = 12;

export default function Search() {
  const [searchParams] = useSearchParams();
  const query         = searchParams.get('q')        || '';
  const categoryParam = searchParams.get('category') || '';

  // ── Filter state ────────────────────────────────────────────────────────
  const [selectedRating,     setSelectedRating]     = useState<number | null>(null);
  const [selectedLevels,     setSelectedLevels]     = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [priceFilter,  setPriceFilter]  = useState<'all' | 'paid' | 'free'>('all');
  const [sortBy,       setSortBy]       = useState<string>('createdAt,desc');
  const [showFilters,  setShowFilters]  = useState(true);
  const [sortOpen,     setSortOpen]     = useState(false);

  // ── Data state ──────────────────────────────────────────────────────────
  const [courses,    setCourses]    = useState<CourseSummaryResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  // ── Close sort dropdown on outside click ────────────────────────────────
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-sort-dropdown]')) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  // ── Load categories once ────────────────────────────────────────────────
  useEffect(() => {
    categoryService.getCategories({ pageSize: 30 })
      .then((res) => setCategories(res.result))
      .catch(() => {});
  }, []);

  // ── Reset filters khi query hoặc category thay đổi ──────────────────────
  const prevQueryRef    = useRef(query);
  const prevCategoryRef = useRef(categoryParam);

  useEffect(() => {
    const queryChanged    = query         !== prevQueryRef.current;
    const categoryChanged = categoryParam !== prevCategoryRef.current;

    if (queryChanged || categoryChanged) {
      prevQueryRef.current    = query;
      prevCategoryRef.current = categoryParam;

      setSelectedRating(null);
      setSelectedLevels([]);
      setSelectedCategories(categoryParam ? [categoryParam] : []);
      setPriceFilter('all');
      setSortBy('createdAt,desc');
      setPage(1);
    }
  }, [query, categoryParam]);

  // ── Fetch courses ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async (pageToFetch: number) => {
    setLoading(true);
    try {
      const categoryFilter = selectedCategories.length > 0
        ? selectedCategories[0]
        : undefined;

      const res = await searchService.searchCourses({
        page:      pageToFetch,
        pageSize:  PAGE_SIZE,
        search:    query || undefined,
        category:  categoryFilter,
        levels:    selectedLevels,
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
  }, [query, selectedRating, selectedLevels, selectedCategories, priceFilter, sortBy]);

  // ── Re-fetch khi filter hoặc page thay đổi ──────────────────────────────
  // Dùng JSON.stringify để tránh so sánh array reference sai
  const filterKey = JSON.stringify({
    query,
    selectedRating,
    selectedLevels:     [...selectedLevels].sort(),
    selectedCategories: [...selectedCategories].sort(),
    priceFilter,
    sortBy,
  });

  const prevFilterKey = useRef(filterKey);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchCourses(1);
      return;
    }

    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setPage(1);
      fetchCourses(1);
    } else {
      fetchCourses(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page]);

  // ── Helpers ──────────────────────────────────────────────────────────────
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
    selectedLevels.filter((l) => l !== 'ALL').length > 0 ||
    priceFilter !== 'all' ||
    selectedCategories.some((c) => c !== categoryParam);

  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy) ?? SORT_OPTIONS[0];

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
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* ── Đánh giá ── */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  Đánh giá
                </h4>
                <div className="space-y-1">
                  {RATING_OPTIONS.map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                        selectedRating === rating
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'hover:bg-secondary'
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
                <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
                  Trình độ
                </h4>
                <div className="space-y-2">
                  {LEVELS.map((lvl) => (
                    <label key={lvl.value} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={selectedLevels.includes(lvl.value)}
                        onCheckedChange={() => toggleLevel(lvl.value)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {lvl.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── Danh mục ── */}
              {categories.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-purple-500" />
                    Danh mục
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedCategories.includes(cat.name)}
                          onCheckedChange={() => toggleCategory(cat.name)}
                        />
                        <span className="text-sm group-hover:text-primary transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Giá ── */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Giá
                </h4>
                <div className="space-y-2">
                  {([
                    { value: 'all',  label: 'Tất cả' },
                    { value: 'free', label: 'Miễn phí' },
                    { value: 'paid', label: 'Trả phí' },
                  ] as const).map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="price"
                        checked={priceFilter === value}
                        onChange={() => setPriceFilter(value)}
                        className="accent-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {label}
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

              {/* ── Custom Dropdown Sort ── */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <div className="relative" data-sort-dropdown>
                  <button
                    onClick={() => setSortOpen((v) => !v)}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-sm font-medium
                      border rounded-xl bg-background transition-all
                      hover:border-primary hover:text-primary
                      ${sortOpen ? 'border-primary text-primary shadow-sm ring-2 ring-primary/10' : 'border-border'}
                    `}
                  >
                    <currentSort.icon className="w-4 h-4" />
                    <span>{currentSort.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                      {SORT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                            className={`
                              flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors
                              ${active
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'hover:bg-secondary text-foreground'
                              }
                            `}
                          >
                            <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                            {opt.label}
                            {active && (
                              <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
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

                {selectedLevels.filter((l) => l !== 'ALL').map((lvl) => {
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
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Trước
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === i
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-secondary'
                        }`}
                      >
                        {i}
                      </button>
                    ))}

                    <Button
                      variant="outline" size="sm"
                      disabled={page >= totalPages}
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