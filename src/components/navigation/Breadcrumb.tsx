import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  className = '',
  onItemClick
}) => {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/', icon: Home }, ...items]
    : items;

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 flex-shrink-0">
                  {separator}
                </span>
              )}
              
              <div className="flex items-center space-x-1">
                {Icon && (
                  <Icon className={`w-4 h-4 ${
                    isLast || item.current 
                      ? 'text-blue-600' 
                      : 'text-gray-500'
                  }`} />
                )}
                
                {item.href && !isLast && !item.current ? (
                  <button
                    onClick={() => onItemClick?.(item, index)}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 hover:underline"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className={`${
                    isLast || item.current 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};