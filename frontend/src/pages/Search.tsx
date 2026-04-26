import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  { value: 'createdAt,desc',      label: 'Mới nhất',      icon: ArrowUpDown },
  { value: 'totalStudents,desc',  label: 'Phổ biến nhất', icon: TrendingUp },
  { value: 'effectivePrice,asc',  label: 'Giá tăng dần',  icon: ArrowUpNarrowWide },
  { value: 'effectivePrice,desc', label: 'Giá giảm dần',  icon: ArrowDownNarrowWide },
];

const PAGE_SIZE = 12;

// Đọc tất cả filter từ URL — single source of truth
function useFilters(searchParams: URLSearchParams) {
  return {
    query:      searchParams.get('q')      || '',
    categories: searchParams.getAll('category'),
    rating:     searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : null,
    levels:     searchParams.getAll('level'),
    price:      (searchParams.get('price') as 'all' | 'free' | 'paid') || 'all',
    sort:       searchParams.get('sort')   || 'createdAt,desc',
    page:       parseInt(searchParams.get('p') || '1', 10),
  };
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useFilters(searchParams);

  // UI-only state — không cần vào URL
  const [showFilters, setShowFilters] = useState(true);
  const [sortOpen,    setSortOpen]    = useState(false);

  // Data state
  const [courses,    setCourses]    = useState<CourseSummaryResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  // Helper ghi filter vào URL
  // keepPage=true khi chỉ đổi trang/sort, không reset về p=1
  const setFilter = (
    updates: Record<string, string | string[] | null>,
    keepPage = false,
  ) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!keepPage) next.delete('p');
      Object.entries(updates).forEach(([key, val]) => {
        next.delete(key);
        if (Array.isArray(val))  val.forEach((v) => next.append(key, v));
        else if (val !== null)   next.set(key, val);
      });
      return next;
    }, { replace: true });
  };

  // Load categories 1 lần
  useEffect(() => {
    categoryService.getCategories({ pageSize: 30 })
      .then((res) => setCategories(res.result))
      .catch(() => {});
  }, []);

  // Đóng sort dropdown khi click ngoài
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-sort-dropdown]')) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  // Fetch duy nhất — debounce 300ms + cleanup để tránh race condition
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setLoading(true);
      searchService.searchCourses({
      page:       filters.page,
      pageSize:   PAGE_SIZE,
      search:     filters.query      || undefined,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      levels:     filters.levels,
      minRating:  filters.rating     ?? undefined,
      priceType:  filters.price,
      sort:       filters.sort,
    })
      .then((res) => {
        if (cancelled) return;
        setCourses(res.result);
        setTotal(res.meta.total);
        setTotalPages(res.meta.pages);
      })
      .catch(() => {
        if (cancelled) return;
        setCourses([]);
        setTotal(0);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    }, 300);

    return () => { cancelled = true; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Helpers
  const toggleCategory = (name: string) => {
    const next = filters.categories.includes(name)
      ? filters.categories.filter((c) => c !== name)
      : [...filters.categories, name];
    setFilter({ category: next });
  };

  const toggleLevel = (value: string) => {
    const next = filters.levels.includes(value)
      ? filters.levels.filter((l) => l !== value)
      : [...filters.levels, value];
    setFilter({ level: next });
  };

  const clearFilters = () =>
    setFilter({ rating: null, level: [], category: [], price: null });

  const hasActiveFilters =
    filters.rating !== null ||
    filters.levels.filter((l) => l !== 'ALL').length > 0 ||
    filters.price !== 'all' ||
    filters.categories.length > 0;

  const currentSort = SORT_OPTIONS.find((o) => o.value === filters.sort) ?? SORT_OPTIONS[0];

  const pageTitle = filters.query
    ? `Kết quả tìm kiếm "${filters.query}"`
    : filters.categories.length === 1
    ? `Khóa học ${filters.categories[0]}`
    : 'Tất cả khóa học';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{pageTitle}</h1>
          <p className="text-muted-foreground">{total} kết quả</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Bộ lọc
              </h3>

              {/* Đánh giá */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  Đánh giá
                </h4>
                <div className="space-y-1">
                  {RATING_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilter({ rating: filters.rating === r ? null : String(r) })}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                        filters.rating === r ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-secondary'
                      }`}
                    >
                      <Rating rating={r} showNumber={false} size="sm" />
                      <span className="text-sm">{r} trở lên</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trình độ */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-500" />
                  Trình độ
                </h4>
                <div className="space-y-2">
                  {LEVELS.map((lvl) => (
                    <label key={lvl.value} className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={filters.levels.includes(lvl.value)}
                        onCheckedChange={() => toggleLevel(lvl.value)}
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {lvl.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Danh mục */}
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
                          checked={filters.categories.includes(cat.name)}
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

              {/* Giá */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Giá
                </h4>
                <div className="space-y-2">
                  {(['all', 'free', 'paid'] as const).map((val) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="price"
                        checked={filters.price === val}
                        onChange={() => setFilter({ price: val === 'all' ? null : val })}
                        className="accent-primary"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {val === 'all' ? 'Tất cả' : val === 'free' ? 'Miễn phí' : 'Trả phí'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
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
                <div className="relative" data-sort-dropdown>
                  <button
                    onClick={() => setSortOpen((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-xl bg-background transition-all hover:border-primary hover:text-primary ${
                      sortOpen ? 'border-primary text-primary shadow-sm ring-2 ring-primary/10' : 'border-border'
                    }`}
                  >
                    <currentSort.icon className="w-4 h-4" />
                    <span>{currentSort.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                      {SORT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = filters.sort === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => { setFilter({ sort: opt.value }, true); setSortOpen(false); }}
                            className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                              active ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-secondary text-foreground'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                            {opt.label}
                            {active && <span className="ml-auto w-2 h-2 rounded-full bg-primary" />}
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
                {filters.rating !== null && (
                  <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full text-sm font-medium">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {filters.rating}+ sao
                    <button
                      onClick={() => setFilter({ rating: null })}
                      className="ml-0.5 w-4 h-4 rounded-full bg-yellow-200 hover:bg-yellow-300 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {filters.levels.filter((l) => l !== 'ALL').map((lvl) => (
                  <span key={lvl} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                    <BarChart2 className="w-3.5 h-3.5" />
                    {LEVELS.find((l) => l.value === lvl)?.label ?? lvl}
                    <button
                      onClick={() => toggleLevel(lvl)}
                      className="ml-0.5 w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}

                {filters.categories.map((cat) => (
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

                {filters.price !== 'all' && (
                  <span className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    {filters.price === 'paid' ? 'Trả phí' : 'Miễn phí'}
                    <button
                      onClick={() => setFilter({ price: null })}
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

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <Button
                      variant="outline" size="sm"
                      disabled={filters.page === 1}
                      onClick={() => setFilter({ p: String(filters.page - 1) }, true)}
                    >
                      Trước
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
                      <button
                        key={i}
                        onClick={() => setFilter({ p: String(i) }, true)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          filters.page === i
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-secondary'
                        }`}
                      >
                        {i}
                      </button>
                    ))}

                    <Button
                      variant="outline" size="sm"
                      disabled={filters.page >= totalPages}
                      onClick={() => setFilter({ p: String(filters.page + 1) }, true)}
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