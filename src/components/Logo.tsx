import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-foreground hover:text-primary transition-colors", className)}>
      <BookOpenCheck className="text-primary h-6 w-6 sm:h-7 sm:w-7" />
      <span className={cn('font-headline font-bold', sizeClasses[size])}>SyllabiQ</span>
    </Link>
  );
}
