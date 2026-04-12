import { Link } from 'react-router-dom';
import type { CourseSummaryResponse } from '@/types';
import { Rating } from './Rating';

interface CourseCardProps {
  course: CourseSummaryResponse;
  size?: 'sm' | 'md' | 'lg';
}

export function CourseCard({ course, size = 'md' }: CourseCardProps) {
  const imageHeights = { sm: 'h-32', md: 'h-36', lg: 'h-40' };

  return (
    <Link
      to={`/course/${course._id}`}
      className="w-full h-full flex flex-col group"
    >
      <div className="course-card h-full flex flex-col">
        <div className={`${imageHeights[size]} overflow-hidden flex-shrink-0`}>
          <img
            src={course.thumbnail || '/placeholder-course.jpg'}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-bold text-foreground line-clamp-2 text-sm leading-tight mb-1 group-hover:text-primary transition-colors flex-1">
            {course.title}
          </h3>
          <div className="mt-auto">
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
            <div className="mt-2">
              {course.outstanding
                ? <span className="badge-bestseller">Nổi bật</span>
                : <span className="invisible badge-bestseller">Nổi bật</span>
              }
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}