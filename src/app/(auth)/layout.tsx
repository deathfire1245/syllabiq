import { Logo } from "@/components/Logo";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <Image
        src="https://picsum.photos/seed/auth-bg/1920/1080"
        alt="Abstract background"
        fill
        className="object-cover z-0"
        data-ai-hint="abstract background"
      />
      <div className="absolute inset-0 bg-background/50 z-10" />
      <div className="relative z-20 flex flex-col items-center justify-center w-full">
        <div className="mb-8">
          <Logo size="lg" className="text-white" />
        </div>
        {children}
      </div>
    </div>
  );
}
