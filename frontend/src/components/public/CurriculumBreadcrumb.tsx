/**
 * CurriculumBreadcrumb - Navigation Context Display
 * 
 * Shows current location in curriculum hierarchy:
 * Curriculum > [Pathway] > [Module] > [Unit]
 */
import { Link, useParams } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const pathwayNames: Record<string, { name: string; element: string }> = {
  land: { name: 'Land', element: 'tmícw' },
  mind: { name: 'Mind', element: 'sképqin' },
  heart: { name: 'Heart', element: 'púsmen' },
  spirit: { name: 'Spirit', element: 'súmec' },
};

interface CurriculumBreadcrumbProps {
  moduleName?: string;
  unitName?: string;
  className?: string;
}

export function CurriculumBreadcrumb({ 
  moduleName, 
  unitName,
  className = '' 
}: CurriculumBreadcrumbProps) {
  const { pathwayId, moduleId } = useParams<{ pathwayId?: string; moduleId?: string }>();
  
  const items: BreadcrumbItem[] = [
    { label: 'Curriculum', href: '/curriculum' },
  ];

  // Add pathway if present
  if (pathwayId && pathwayNames[pathwayId]) {
    items.push({
      label: `${pathwayNames[pathwayId].element} — ${pathwayNames[pathwayId].name}`,
      href: `/curriculum?filter=${pathwayId}`,
    });
  }

  // Add module if present
  if (moduleName) {
    items.push({
      label: moduleName,
      href: moduleId ? `/curriculum/${pathwayId}/${moduleId}` : undefined,
    });
  }

  // Add unit if present
  if (unitName) {
    items.push({ label: unitName });
  }

  return (
    <nav 
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <svg className="w-4 h-4 text-shs-forest-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          
          {item.href ? (
            <Link 
              to={item.href}
              className="text-shs-forest-600 hover:text-shs-forest-800 hover:underline transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default CurriculumBreadcrumb;
