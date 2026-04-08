import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  showNumber?: boolean;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Rating({ rating, showNumber = true, reviewCount, size = 'md' }: RatingProps) {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Calculate fill percentage for each star (Udemy 2025 style)
  const getStarFill = (starIndex: number): number => {
    const difference = rating - starIndex;
    if (difference >= 1) return 100;
    if (difference <= 0) return 0;
    return difference * 100;
  };

  return (
    <div className="flex items-center gap-1">
      {showNumber && (
        <span className={`font-bold text-udemy-orange ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((starIndex) => {
          const fillPercent = getStarFill(starIndex);
          
          return (
            <div key={starIndex} className="relative">
              {/* Empty star (background) */}
              <Star 
                className={`${starSizes[size]} text-udemy-orange`} 
                fill="transparent"
                strokeWidth={1.5}
              />
              {/* Filled star (overlay with clip) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star 
                  className={`${starSizes[size]} text-udemy-orange`} 
                  fill="#E59819"
                  strokeWidth={0}
                />
              </div>
            </div>
          );
        })}
      </div>
      {reviewCount !== undefined && (
        <span className={`text-muted-foreground ${textSizes[size]} ml-0.5`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
