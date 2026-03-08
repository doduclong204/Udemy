import { Link } from 'react-router-dom';
import type { CourseSummaryResponse } from '@/types';
import { Rating } from './Rating';

interface CourseCardProps {
  course: CourseSummaryResponse;
  size?: 'sm' | 'md' | 'lg';
}

export function CourseCard({ course, size = 'md' }: CourseCardProps) {
  const widths = { sm: 'w-56', md: 'w-64', lg: 'w-72' };
  const imageHeights = { sm: 'h-32', md: 'h-36', lg: 'h-40' };

  return (
    <Link
      to={`/course/${course._id}`}
      className={`${widths[size]} flex-shrink-0 group`}
    >
      <div className="course-card">
        <div className={`${imageHeights[size]} overflow-hidden`}>
          <img
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <h3 className="font-bold text-foreground line-clamp-2 text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="price-discounted text-base">
              {Number(course.discountPrice ?? course.price).toLocaleString('vi-VN')}đ
            </span>
            {course.discountPrice && (
              <span className="price-original">
                {Number(course.price).toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
          {course.outstanding && (
            <div className="mt-2">
              <span className="badge-bestseller">Nổi bật</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}