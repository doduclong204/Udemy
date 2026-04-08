import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import categoryService from "@/services/categoryService";
import type { Category } from "@/types";

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryService
      .getCategories({ pageSize: 12 })
      .then((res) =>
        setCategories(
          [...res.result].sort((a, b) => b.totalCourses - a.totalCourses)
        )
      )
      .catch(() => {});
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-12">
      <h2 className="section-title">Danh mục phổ biến</h2>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-background border border-border rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-hidden py-3 px-1"
        >
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/search?category=${category.name}`}
              className="category-card text-center group/card flex-shrink-0 w-[calc((100%)/6-14px)]"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/8 flex items-center justify-center
                              group-hover/card:bg-primary/15 group-hover/card:scale-110 transition-all duration-300">
                <span className="text-3xl leading-none">{category.icon}</span>
              </div>

              <h3 className="font-semibold text-sm text-foreground mb-2 leading-tight">
                {category.name}
              </h3>

              <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full transition-colors ${
                category.totalCourses > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {category.totalCourses.toLocaleString()} khóa học
              </span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-background border border-border rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}