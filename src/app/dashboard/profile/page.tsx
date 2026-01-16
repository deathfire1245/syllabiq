"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, BookOpen, Goal, Star, GraduationCap, Briefcase, IndianRupee, Calendar, Verified, Save, X, Camera } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useUser, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadButton } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    const [isEditMode, setIsEditMode] = React.useState(false);

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: profile, isLoading: isProfileLoading, mutate } = useDoc(userDocRef);

    const [editData, setEditData] = React.useState({ name: '', bio: '', profilePicture: '' });

    React.useEffect(() => {
        if (profile) {
            setEditData({
                name: profile.name || '',
                bio: profile.teacherProfile?.bio || '',
                profilePicture: profile.profilePicture || '',
            });
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user || !firestore || !profile) return;
    
        const updatePayload: { [key: string]: any } = {
            name: editData.name,
            profilePicture: editData.profilePicture,
        };
    
        if (profile.role === 'teacher') {
            updatePayload['teacherProfile.bio'] = editData.bio;
        }
    
        try {
            // Update the private /users document
            await mutate(updatePayload);
    
            // Sync public fields to the /tutors document
            if (profile.role === 'teacher') {
                const tutorDocRef = doc(firestore, 'tutors', user.uid);
                const publicUpdatePayload = {
                    name: editData.name,
                    profilePicture: editData.profilePicture,
                    bio: editData.bio,
                };
                await updateDoc(tutorDocRef, publicUpdatePayload);
            }
    
            toast({ title: "Profile Updated", description: "Your changes have been saved." });
            setIsEditMode(false);
        } catch (error) {
            console.error("Error updating profile:", error)
            toast({ variant: 'destructive', title: "Error", description: "Failed to update profile." });
        }
    };


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

    const getInitials = (name?: string) => {
      if (!name) return "";
      return name.split(' ').map(n => n[0]).join('').substring(0, 2);
    }

    return (
        <div className="space-y-8">
            <ScrollReveal>
                <Card className="overflow-hidden">
                    <div className="relative">
                        <div className="bg-card-foreground/5 h-24" />
                        <div className="absolute top-4 right-4">
                           {isEditMode ? (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} size="sm"><Save className="mr-2 h-4 w-4"/>Save</Button>
                                    <Button onClick={() => setIsEditMode(false)} variant="outline" size="sm"><X className="mr-2 h-4 w-4"/>Cancel</Button>
                                </div>
                           ) : (
                                <Button onClick={() => setIsEditMode(true)} variant="outline"><Edit className="mr-2 h-4 w-4"/>Edit Profile</Button>
                           )}
                        </div>
                    </div>
                    <CardHeader className="flex flex-col items-center text-center -mt-16">
                        <div className="relative">
                           <Avatar className="w-24 h-24 mb-2 border-4 border-background">
                                <AvatarImage src={isEditMode ? editData.profilePicture : profile.profilePicture || `https://picsum.photos/seed/${profile.uid}/100`} />
                                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                            </Avatar>
                            {isEditMode && (
                                <div className="absolute bottom-2 -right-2">
                                     <UploadButton
                                        endpoint="profileUploader"
                                        onClientUploadComplete={(res) => {
                                            if (res && res.length > 0 && res[0].url) {
                                               setEditData({...editData, profilePicture: res[0].url});
                                                toast({ title: "Picture Ready", description: "Click 'Save' to apply your new picture." });
                                            }
                                        }}
                                        onUploadError={(error: Error) => {
                                            toast({ variant: "destructive", title: "Upload Failed", description: error.message });
                                        }}
                                        content={{
                                            button: <Camera className="h-5 w-5" />,
                                        }}
                                        className="ut-button:w-10 ut-button:h-10 ut-button:rounded-full ut-button:bg-primary ut-button:ut-readying:bg-primary/50"
                                     />
                                </div>
                            )}
                        </div>
                        {isEditMode ? (
                            <div className="w-full max-w-sm mt-4">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="text-center text-2xl font-bold h-12"/>
                            </div>
                        ) : (
                             <CardTitle className="text-2xl mt-4 flex items-center gap-2">
                                {profile.name}
                                {profile.teacherProfile?.isVerified && <Verified className="w-6 h-6 text-blue-500" />}
                            </CardTitle>
                        )}
                        
                        <CardDescription>{profile.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {profile.role === "student" ? (
                             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold">Bio</h3>
                                    {isEditMode ? (
                                        <Textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} className="mt-2 max-w-2xl mx-auto"/>
                                    ) : (
                                        <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{profile.teacherProfile?.bio || "No bio provided."}</p>
                                    )}
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
                                    <InfoCard icon={IndianRupee} title="Hourly Rate">
                                        <p className="text-lg font-semibold">₹{profile.teacherProfile?.hourlyRate || "0"}/hr</p>
                                    </InfoCard>
                                    <InfoCard icon={Calendar} title="Availability">
                                        <div className="flex flex-wrap gap-2">
                                            {profile.teacherProfile?.availability?.days?.length > 0 ? profile.teacherProfile.availability.days.map((day: string) => <Badge variant="outline" key={day}>{day}</Badge>) : <p className="text-muted-foreground text-sm">Not specified.</p>}
                                        </div>
                                    </InfoCard>
                                </div>
                             </>
                        )}
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    );
}
