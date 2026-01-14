"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, BookOpen, Goal, Star, Clock, GraduationCap, Briefcase, DollarSign, Calendar, Verified } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useUser, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";

const InfoCard = ({ icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => {
    const Icon = icon;
    return (
        <Card className="bg-secondary/50">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Icon className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const { firestore } = useFirebase();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: profile, isLoading: isProfileLoading, mutate } = useDoc(userDocRef);

    if (isUserLoading || isProfileLoading) {
        return (
            <div className="space-y-8">
                <Card className="overflow-hidden">
                    <Skeleton className="h-24 w-full" />
                    <CardHeader className="flex flex-col items-center text-center -mt-16">
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <Skeleton className="h-8 w-48 mt-4" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                 <h2 className="text-2xl font-bold">Profile Not Found</h2>
                 <p className="text-muted-foreground mt-2">
                   We couldn't load your profile information.
                 </p>
            </div>
        );
    }

    if (profile.role === "student") {
        return (
            <div className="space-y-8">
                <ScrollReveal>
                    <Card className="overflow-hidden">
                        <div className="bg-card-foreground/5 h-24" />
                        <CardHeader className="flex flex-col items-center text-center -mt-16">
                            <Avatar className="w-24 h-24 mb-2 border-4 border-background">
                                <AvatarImage src={profile.profilePicture || `https://picsum.photos/seed/${profile.uid}/100`} />
                                <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{profile.name}</CardTitle>
                            <CardDescription>{profile.email}</CardDescription>
                             <UploadButton
                                endpoint="profileUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res.length > 0 && res[0].url) {
                                       mutate({ profilePicture: res[0].url });
                                        toast({
                                            title: "Profile Picture Updated",
                                            description: "Your new picture has been saved.",
                                        });
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast({
                                        variant: "destructive",
                                        title: "Upload Failed",
                                        description: error.message,
                                    });
                                }}
                                className="mt-4 ut-button:bg-primary ut-button:ut-readying:bg-primary/50"
                             />
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            <InfoCard icon={GraduationCap} title="Education">
                                <p className="text-lg font-semibold">{profile.studentProfile?.gradeLevel || "Not set"}</p>
                                <p className="text-muted-foreground">{profile.studentProfile?.schoolBoard || "Not set"}</p>
                            </InfoCard>
                             <InfoCard icon={Goal} title="Learning Goals">
                                <p className="text-sm text-muted-foreground">{profile.studentProfile?.learningGoals || "No goals set."}</p>
                            </InfoCard>
                            <InfoCard icon={BookOpen} title="Favorite Subjects">
                                <div className="flex flex-wrap gap-2">
                                    {profile.studentProfile?.preferredSubjects?.length > 0 ? profile.studentProfile.preferredSubjects.map((subject: string) => <Badge key={subject} variant="secondary">{subject}</Badge>) : <p className="text-muted-foreground text-sm">No subjects selected.</p>}
                                </div>
                            </InfoCard>
                            <InfoCard icon={Star} title="Interests">
                                <div className="flex flex-wrap gap-2">
                                    {profile.studentProfile?.interests?.length > 0 ? profile.studentProfile.interests.map((hobby: string) => <Badge key={hobby} variant="outline">{hobby}</Badge>) : <p className="text-muted-foreground text-sm">No interests listed.</p>}
                                </div>
                            </InfoCard>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
        );
    }
    
    if (profile.role === "teacher") {
         return (
            <div className="space-y-8">
                <ScrollReveal>
                    <Card className="overflow-hidden">
                        <div className="bg-card-foreground/5 h-24" />
                         <CardHeader className="flex flex-col items-center text-center -mt-16">
                            <Avatar className="w-24 h-24 mb-2 border-4 border-background">
                                <AvatarImage src={profile.profilePicture || `https://picsum.photos/seed/${profile.uid}/100`} />
                                <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                {profile.name}
                                {profile.teacherProfile?.isVerified && <Verified className="w-6 h-6 text-blue-500" />}
                            </CardTitle>
                            <CardDescription>{profile.email}</CardDescription>
                            <UploadButton
                                endpoint="profileUploader"
                                onClientUploadComplete={(res) => {
                                    if (res && res.length > 0 && res[0].url) {
                                       mutate({ profilePicture: res[0].url });
                                        toast({
                                            title: "Profile Picture Updated",
                                            description: "Your new picture has been saved.",
                                        });
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    toast({
                                        variant: "destructive",
                                        title: "Upload Failed",
                                        description: error.message,
                                    });
                                }}
                                className="mt-4 ut-button:bg-primary ut-button:ut-readying:bg-primary/50"
                             />
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold">Bio</h3>
                                <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{profile.teacherProfile?.bio || "No bio provided."}</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                               <InfoCard icon={BookOpen} title="Specialized Subjects">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.teacherProfile?.subjects?.length > 0 ? profile.teacherProfile.subjects.map((subject: string) => <Badge key={subject}>{subject}</Badge>) : <p className="text-muted-foreground text-sm">Not specified.</p>}
                                    </div>
                                </InfoCard>
                                <InfoCard icon={GraduationCap} title="Qualifications">
                                     <div className="flex flex-wrap gap-2">
                                        {profile.teacherProfile?.qualifications?.length > 0 ? profile.teacherProfile.qualifications.map((q: string) => <Badge variant="secondary" key={q}>{q}</Badge>) : <p className="text-muted-foreground text-sm">Not specified.</p>}
                                    </div>
                                </InfoCard>
                                <InfoCard icon={Briefcase} title="Experience">
                                    <p className="text-lg font-semibold">{profile.teacherProfile?.experienceYears ? `${profile.teacherProfile.experienceYears} years` : "Not specified."}</p>
                                </InfoCard>
                                <InfoCard icon={DollarSign} title="Hourly Rate">
                                    <p className="text-lg font-semibold">${profile.teacherProfile?.hourlyRate || "0"}/hr</p>
                                </InfoCard>
                                <InfoCard icon={Calendar} title="Availability">
                                    <div className="flex flex-wrap gap-2">
                                        {profile.teacherProfile?.availability?.days?.length > 0 ? profile.teacherProfile.availability.days.map((day: string) => <Badge variant="outline" key={day}>{day}</Badge>) : <p className="text-muted-foreground text-sm">Not specified.</p>}
                                    </div>
                                </InfoCard>
                            </div>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
        );
    }

    return null;
}

    