
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function LockedPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Automatically check role when user is loaded
  React.useEffect(() => {
    if (isUserLoading) return;

    const verifyAdmin = async () => {
      if (!user || !firestore) {
        // User not logged in, no need to proceed.
        setIsVerifying(false);
        return;
      }

      setIsVerifying(true);
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          sessionStorage.setItem("isAdminAuthenticated", "true");
          toast({
            title: "Access Granted",
            description: "Welcome to the Admin Portal.",
          });
          router.replace("/admin");
        } else {
          // If the user is logged in but not an admin, deny access.
           toast({
            variant: "destructive",
            title: "Authorization Failed",
            description: "You do not have permission to access the admin portal.",
          });
          sessionStorage.removeItem("isAdminAuthenticated");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not verify your role. Please try again.",
        });
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAdmin();

  }, [user, isUserLoading, firestore, router, toast]);

  if (isUserLoading || isVerifying) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md h-[300px] flex flex-col items-center justify-center">
                <ShieldCheck className="w-16 h-16 text-primary animate-pulse mb-4"/>
                <p className="text-lg font-semibold text-muted-foreground">Verifying administrator access...</p>
                <Skeleton className="w-3/4 h-4 mt-2" />
            </Card>
        </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="absolute top-8">
          <Logo size="lg" />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Portal Access</CardTitle>
          <CardDescription>You must be an administrator to access this area. Please log in with an admin account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Go to Login
              </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
