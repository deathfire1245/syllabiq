"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const ADMIN_CODE = "we2025";

export default function LockedPage() {
  const [code, setCode] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleAccess = async () => {
    if (code !== ADMIN_CODE) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The access code is incorrect.",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in as an admin to access this portal.",
      });
      router.push('/login');
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
        router.push("/admin");
      } else {
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

  if (isUserLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Skeleton className="w-full max-w-md h-[400px]" />
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
          <CardDescription>Enter the secret code to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleAccess(); }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code">Access Code</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="access-code"
                  type="password"
                  placeholder="••••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Unlock Portal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
