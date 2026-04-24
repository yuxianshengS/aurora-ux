import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  title: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
  style,
}) => {
  return (
    <nav
      className={['au-breadcrumb', className].filter(Boolean).join(' ')}
      style={style}
      aria-label="breadcrumb"
    >
      <ol className="au-breadcrumb__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const content = (
            <>
              {item.icon && <span className="au-breadcrumb__icon">{item.icon}</span>}
              <span>{item.title}</span>
            </>
          );
          const inner = isLast ? (
            <span className="au-breadcrumb__current" aria-current="page">
              {content}
            </span>
          ) : item.href ? (
            <a
              href={item.href}
              className="au-breadcrumb__link"
              onClick={item.onClick}
            >
              {content}
            </a>
          ) : item.onClick ? (
            <span
              role="link"
              tabIndex={0}
              className="au-breadcrumb__link"
              onClick={item.onClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  item.onClick?.(e as unknown as React.MouseEvent);
                }
              }}
            >
              {content}
            </span>
          ) : (
            <span className="au-breadcrumb__plain">{content}</span>
          );

          return (
            <li key={i} className="au-breadcrumb__item">
              {inner}
              {!isLast && <span className="au-breadcrumb__sep" aria-hidden>{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
