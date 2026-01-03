import { Link } from 'react-router-dom';
import { Course } from '@/data/mockData';
import { Rating } from './Rating';

interface CourseCardProps {
  course: Course;
  size?: 'sm' | 'md' | 'lg';
}

export function CourseCard({ course, size = 'md' }: CourseCardProps) {
  const widths = {
    sm: 'w-56',
    md: 'w-64',
    lg: 'w-72',
  };

  const imageHeights = {
    sm: 'h-32',
    md: 'h-36',
    lg: 'h-40',
  };

  return (
    <Link
      to={`/course/${course.id}`}
      className={`${widths[size]} flex-shrink-0 group`}
    >
      <div className="course-card">
        <div className={`${imageHeights[size]} overflow-hidden`}>
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <h3 className="font-bold text-foreground line-clamp-2 text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <Rating rating={course.rating} reviewCount={course.reviewCount} size="sm" />
          <div className="flex items-center gap-2 mt-2">
            <span className="price-discounted text-base">${course.price}</span>
            <span className="price-original">${course.originalPrice}</span>
          </div>
          {course.badge && (
            <div className="mt-2">
              {course.badge === 'bestseller' && (
                <span className="badge-bestseller">Bán chạy</span>
              )}
              {course.badge === 'new' && <span className="badge-new">Mới</span>}
              {course.badge === 'hot' && <span className="badge-hot">Hot</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
