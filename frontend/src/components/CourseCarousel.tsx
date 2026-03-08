import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CourseSummaryResponse } from "@/types";
import { CourseCard } from "./CourseCard";

interface CourseCarouselProps {
  title: string;
  subtitle?: string;
  courses: CourseSummaryResponse[];
}

export function CourseCarousel({ title, subtitle, courses }: CourseCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8">
      <div className="mb-4">
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground -mt-4 mb-4">{subtitle}</p>
        )}
      </div>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-background border border-border rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div ref={scrollRef} className="carousel-container">
          {courses.map((course) => (
            <div key={course._id} className="carousel-item">
              <CourseCard course={course} />
            </div>
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