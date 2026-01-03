import { useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CourseCard } from '@/components/CourseCard';
import { Rating } from '@/components/Rating';
import { courses, categories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  
  const [showFilters, setShowFilters] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [priceFilter, setPriceFilter] = useState<'all' | 'paid' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'popular' | 'rating' | 'newest'>('relevance');

  const filteredCourses = useMemo(() => {
    let result = courses;

    // Search query filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }

    // Rating filter
    if (selectedRating) {
      result = result.filter((c) => c.rating >= selectedRating);
    }

    // Level filter
    if (selectedLevels.length > 0) {
      result = result.filter((c) => selectedLevels.includes(c.level));
    }

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter((c) => c.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter((c) => c.price > 0);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result = [...result].sort((a, b) => b.studentCount - a.studentCount);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result = [...result].sort((a, b) => (a.badge === 'new' ? -1 : 1));
        break;
    }

    return result;
  }, [query, selectedCategories, selectedRating, selectedLevels, priceFilter, sortBy]);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedRating(null);
    setSelectedLevels([]);
    setSelectedCategories([]);
    setPriceFilter('all');
  };

  const levels = ['Tất cả trình độ', 'Người mới', 'Trung cấp', 'Nâng cao'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {query ? `Kết quả tìm kiếm "${query}"` : categoryParam ? `Khóa học ${categoryParam}` : 'Tất cả khóa học'}
          </h1>
          <p className="text-muted-foreground">
            {filteredCourses.length} kết quả
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`w-64 flex-shrink-0 transition-all duration-300 ${
              showFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-20 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </h3>
                {(selectedRating || selectedLevels.length > 0 || selectedCategories.length > 0 || priceFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold mb-3">Đánh giá</h4>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
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

              {/* Level Filter */}
              <div>
                <h4 className="font-semibold mb-3">Trình độ</h4>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                      />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold mb-3">Danh mục</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.slice(0, 8).map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => toggleCategory(category.name)}
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
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

          {/* Results */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="relevance">Phù hợp nhất</option>
                  <option value="popular">Phổ biến nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedRating || selectedLevels.length > 0 || selectedCategories.length > 0 || priceFilter !== 'all') && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedRating && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-udemy-purple-light text-primary rounded-full text-sm">
                    {selectedRating}+ sao
                    <button onClick={() => setSelectedRating(null)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedLevels.map((level) => (
                  <span key={level} className="flex items-center gap-1 px-3 py-1 bg-udemy-purple-light text-primary rounded-full text-sm">
                    {level}
                    <button onClick={() => toggleLevel(level)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedCategories.map((category) => (
                  <span key={category} className="flex items-center gap-1 px-3 py-1 bg-udemy-purple-light text-primary rounded-full text-sm">
                    {category}
                    <button onClick={() => toggleCategory(category)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {priceFilter !== 'all' && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-udemy-purple-light text-primary rounded-full text-sm">
                    {priceFilter === 'paid' ? 'Trả phí' : 'Miễn phí'}
                    <button onClick={() => setPriceFilter('all')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Course Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-semibold mb-2">Không tìm thấy khóa học</p>
                <p className="text-muted-foreground mb-4">
                  Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn
                </p>
                <Button onClick={clearFilters}>Xóa tất cả bộ lọc</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
