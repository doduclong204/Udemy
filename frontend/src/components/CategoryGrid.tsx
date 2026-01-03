import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';

export function CategoryGrid() {
  return (
    <section className="py-12">
      <h2 className="section-title">Danh mục phổ biến</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.slice(0, 12).map((category) => (
          <Link
            key={category.id}
            to={`/search?category=${category.name}`}
            className="category-card text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {category.courseCount.toLocaleString()} khóa học
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
