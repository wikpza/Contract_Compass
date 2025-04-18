
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex justify-between items-center mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-business-800">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && (
        action.href ? (
          <Button asChild>
            <Link to={action.href} className="flex items-center gap-1">
              {action.icon || <PlusCircle className="h-4 w-4 mr-1" />}
              {action.label}
            </Link>
          </Button>
        ) : (
          <Button onClick={action.onAction} className="flex items-center gap-1">
            {action.icon || <PlusCircle className="h-4 w-4 mr-1" />}
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
