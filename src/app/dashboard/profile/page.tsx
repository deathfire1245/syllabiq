"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, BookOpen, Bullseye, Star, Clock, GraduationCap, Briefcase, DollarSign, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

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
    const [role, setRole] = React.useState<string | null>(null);
    const [data, setData] = React.useState<any>(null);

    React.useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        const storedData = localStorage.getItem("onboardingData");
        setRole(storedRole);
        if (storedData) {
            setData(JSON.parse(storedData));
        }
    }, []);

    if (!role || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                 <h2 className="text-2xl font-bold">Loading Profile...</h2>
                 <p className="text-muted-foreground mt-2">
                   Please wait a moment.
                 </p>
            </div>
        );
    }

    if (role === "Student") {
        return (
            <div className="space-y-8">
                <ScrollReveal>
                    <Card className="overflow-hidden">
                        <div className="bg-card-foreground/5 h-24" />
                        <CardHeader className="flex flex-col items-center text-center -mt-16">
                            <Avatar className="w-24 h-24 mb-2 border-4 border-background">
                                <AvatarImage src="https://picsum.photos/seed/user-avatar/100" />
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">Student</CardTitle>
                            <CardDescription>student@example.com</CardDescription>
                             <Button variant="outline" size="sm" className="mt-4">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            <InfoCard icon={GraduationCap} title="Grade & School">
                                <p className="text-lg font-semibold">{data.grade || "Not set"}</p>
                                <p className="text-muted-foreground">{data.school || "Not set"}</p>
                            </InfoCard>
                             <InfoCard icon={Bullseye} title="Study Goals">
                                <div className="flex flex-wrap gap-2">
                                    {data.studyGoals?.length > 0 ? data.studyGoals.map((goal: string) => <Badge key={goal}>{goal}</Badge>) : <p className="text-muted-foreground text-sm">No goals set.</p>}
                                </div>
                            </InfoCard>
                            <InfoCard icon={BookOpen} title="Favorite Subjects">
                                <div className="flex flex-wrap gap-2">
                                    {data.favoriteSubjects?.length > 0 ? data.favoriteSubjects.map((subject: string) => <Badge key={subject} variant="secondary">{subject}</Badge>) : <p className="text-muted-foreground text-sm">No subjects selected.</p>}
                                </div>
                            </InfoCard>
                            <InfoCard icon={Star} title="Hobbies & Interests">
                                <div className="flex flex-wrap gap-2">
                                    {data.hobbies?.length > 0 ? data.hobbies.map((hobby: string) => <Badge key={hobby} variant="outline">{hobby}</Badge>) : <p className="text-muted-foreground text-sm">No hobbies listed.</p>}
                                </div>
                            </InfoCard>
                            <InfoCard icon={Clock} title="Preferred Study Time">
                                 <p className="text-lg font-semibold">{data.studyTime || "Not set"}</p>
                            </InfoCard>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>
        );
    }
    
    if (role === "Teacher") {
         return (
            <div className="space-y-8">
                <ScrollReveal>
                    <Card className="overflow-hidden">
                        <div className="bg-card-foreground/5 h-24" />
                         <CardHeader className="flex flex-col items-center text-center -mt-16">
                            <Avatar className="w-24 h-24 mb-2 border-4 border-background">
                                <AvatarImage src="https://picsum.photos/seed/teacher-avatar/100" />
                                <AvatarFallback>T</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">Teacher</CardTitle>
                            <CardDescription>teacher@example.com</CardDescription>
                            <Button variant="outline" size="sm" className="mt-4">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold">Bio</h3>
                                <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{data.bio || "No bio provided."}</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                               <InfoCard icon={BookOpen} title="Specialized Subjects">
                                    <div className="flex flex-wrap gap-2">
                                        {data.subjects?.length > 0 ? data.subjects.map((subject: string) => <Badge key={subject}>{subject}</Badge>) : <p className="text-muted-foreground text-sm">Not specified.</p>}
                                    </div>
                                </InfoCard>
                                <InfoCard icon={GraduationCap} title="Qualification">
                                     <p className="text-lg font-semibold">{data.qualification || "Not specified."}</p>
                                </InfoCard>
                                <InfoCard icon={Briefcase} title="Experience">
                                    <p className="text-lg font-semibold">{data.experience ? `${data.experience} years` : "Not specified."}</p>
                                </InfoCard>
                                <InfoCard icon={Star} title="Teaching Style">
                                    <Badge variant="secondary">{data.teachingStyle || "Not specified."}</Badge>
                                </InfoCard>
                                <InfoCard icon={DollarSign} title="Hourly Rate">
                                    <p className="text-lg font-semibold">${data.hourlyRate || "0"}/hr</p>
                                </InfoCard>
                                <InfoCard icon={Calendar} title="Teaching Mode">
                                    <p className="text-lg font-semibold">{data.teachingMode || "Not specified."}</p>
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
