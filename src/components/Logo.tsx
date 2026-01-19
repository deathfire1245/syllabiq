import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import logoImage from '@/app/logo.png';

export function Logo({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const imageSize = {
    sm: 32,
    md: 36,
    lg: 40,
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2 text-foreground hover:text-primary transition-colors", className)}>
      <Image src={logoImage} alt="SyllabiQ Logo" width={imageSize[size]} height={imageSize[size]} />
      <span className={cn('font-headline font-bold', sizeClasses[size])}>SyllabiQ</span>
    </Link>
  );
}
