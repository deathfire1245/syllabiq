
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, setDoc, query, collection, where, serverTimestamp, updateDoc, onSnapshot, limit, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageSquare, Timer, UserCircle, Check, X, ShieldAlert, MoreVertical, Send, Play, Square } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { StudyPartnerProfile, StudyPartnerConnection, StudyPartnerMessage, StudyPartnerSession } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Profile Component ---

function ProfileTab({ profile, onUpdate }: { profile: StudyPartnerProfile | null, onUpdate: () => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const [formData, setFormData] = React.useState({
    targetExam: profile?.targetExam || "NEET",
    subjects: profile?.subjects || [],
    studyHoursPerDay: profile?.studyHoursPerDay || "2-3 hours",
    bio: profile?.bio || "",
    status: profile?.status || "available"
  });

  // Sync state when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        targetExam: profile.targetExam,
        subjects: profile.subjects,
        studyHoursPerDay: profile.studyHoursPerDay,
        bio: profile.bio,
        status: profile.status
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    setIsSaving(true);
    
    const profileRef = doc(firestore, `students/${user.uid}/studyPartnerProfile`, 'main');
    const studentRef = doc(firestore, 'students', user.uid);
    const userRef = doc(firestore, 'users', user.uid);
    
    try {
      // Fetch the latest core profile to get the real name and picture
      const userSnap = await getDoc(userRef);
      const coreProfile = userSnap.exists() ? userSnap.data() : {};

      const profileData = {
        ...formData,
        updatedAt: serverTimestamp(),
        createdAt: profile?.createdAt || serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const denormalizedData = {
        id: user.uid,
        name: coreProfile.name || user.displayName || "Student",
        profileImageUrl: coreProfile.profilePicture || user.photoURL || `https://picsum.photos/seed/${user.uid}/100`,
        partnerProfile: {
          targetExam: formData.targetExam,
          subjects: formData.subjects,
          status: formData.status,
          bio: formData.bio,
          lastActiveAt: serverTimestamp()
        }
      };

      // 1. Save detailed profile to subcollection
      await setDoc(profileRef, profileData, { merge: true });
      
      // 2. Denormalize to student root doc
      await setDoc(studentRef, denormalizedData, { merge: true });
      
      toast({ title: "Profile Saved", description: "Your study partner preferences have been updated." });
      onUpdate();
    } catch (e: any) {
      console.error("Save profile error:", e);
      if (e.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `students/${user.uid}`,
          operation: 'write',
        }));
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not save profile. Please try again." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const exams = ["NEET", "JEE Main", "JEE Advanced", "CUET", "Boards"];
  const availableSubjects = ["Physics", "Chemistry", "Biology", "Mathematics", "English", "Informatics Practices"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Partner Profile</CardTitle>
        <CardDescription>Configure your preferences to find the best matches.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Target Examination</Label>
            <Select value={formData.targetExam} onValueChange={(v) => setFormData({ ...formData, targetExam: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {exams.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Daily Study Goal</Label>
            <Input value={formData.studyHoursPerDay} onChange={e => setFormData({ ...formData, studyHoursPerDay: e.target.value })} placeholder="e.g. 4-5 hours" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>My Strong Subjects</Label>
          <div className="flex flex-wrap gap-2">
            {availableSubjects.map(s => (
              <Badge 
                key={s} 
                variant={formData.subjects.includes(s) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  const newSubs = formData.subjects.includes(s) 
                    ? formData.subjects.filter(x => x !== s)
                    : [...formData.subjects, s];
                  setFormData({ ...formData, subjects: newSubs });
                }}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Study Goals & Bio</Label>
          <Textarea 
            value={formData.bio} 
            onChange={e => setFormData({ ...formData, bio: e.target.value })} 
            placeholder="Tell potential partners about your goals (e.g. Aiming for AIR 100 in NEET 2026)"
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Update Partner Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Discovery Component ---

function DiscoveryTab({ profile, connections }: { profile: StudyPartnerProfile | null, connections: StudyPartnerConnection[] }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  // Query for students with the same target exam
  const matchesQuery = useMemoFirebase(() => {
    if (!firestore || !profile) return null;
    return query(
      collection(firestore, "students"), 
      where("partnerProfile.targetExam", "==", profile.targetExam),
      where("partnerProfile.status", "==", "available"),
      limit(20)
    );
  }, [firestore, profile]);

  const { data: students, isLoading } = useCollection(matchesQuery);
  const [connectingId, setConnectingId] = React.useState<string | null>(null);

  // Filter out existing connections and current user
  const potentialMatches = React.useMemo(() => {
    if (!students || !user) return [];
    const connectedIds = new Set(connections.flatMap(c => [c.studentIdA, c.studentIdB]));
    
    return students
      .filter(s => s.id !== user.uid && !connectedIds.has(s.id))
      .map(student => {
        // Calculate compatibility score
        const sharedSubjects = student.partnerProfile?.subjects?.filter((s: string) => profile?.subjects?.includes(s)) || [];
        const baseScore = 70;
        const subjectScore = Math.min(30, sharedSubjects.length * 10);
        return {
          ...student,
          matchScore: baseScore + subjectScore,
          sharedSubjects
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [students, user, connections, profile]);

  const handleConnect = async (targetStudent: any) => {
    if (!user || !firestore) return;
    setConnectingId(targetStudent.id);
    try {
      // Get current user's name for denormalization
      const userSnap = await getDoc(doc(firestore, 'users', user.uid));
      const userName = userSnap.exists() ? userSnap.data().name : user.displayName || "Student";

      const connectionId = [user.uid, targetStudent.id].sort().join('_');
      const connRef = doc(firestore, 'studyPartnerConnections', connectionId);
      
      const payload: any = {
        id: connectionId,
        studentIdA: user.uid,
        studentIdB: targetStudent.id,
        participants: { [user.uid]: true, [targetStudent.id]: true },
        status: 'pending',
        matchScore: targetStudent.matchScore,
        initiatedBy: user.uid,
        initiatedByName: userName, // Denormalize for the receiver to see
        createdAt: serverTimestamp(),
        commonSubjects: targetStudent.sharedSubjects || [],
        commonStudyTimeStart: 6,
        commonStudyTimeEnd: 8,
        messagesCount: 0,
        // Store names for easy retrieval
        [`name_${user.uid}`]: userName,
        [`name_${targetStudent.id}`]: targetStudent.name
      };

      await setDoc(connRef, payload);
      toast({ title: "Request Sent", description: `Connection request sent to ${targetStudent.name}.` });
    } catch (e: any) {
      console.error("Connect error:", e);
      if (e.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: `studyPartnerConnections/${[user.uid, targetStudent.id].sort().join('_')}`,
              operation: 'create',
          }));
      } else {
          toast({ variant: "destructive", title: "Error", description: "Could not send request." });
      }
    } finally {
      setConnectingId(null);
    }
  };

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <CardTitle>Setup Your Profile First</CardTitle>
        <CardDescription className="mt-2">You need to configure your study preferences before finding partners.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />) : 
        potentialMatches.length > 0 ? (
          potentialMatches.map(student => (
            <Card key={student.id} className="overflow-hidden border-2 transition-all hover:border-primary/50">
              <CardHeader className="bg-secondary/30 pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={student.profileImageUrl} alt={student.name} />
                      <AvatarFallback>{student.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <Badge variant="outline">{student.partnerProfile?.targetExam} Prep</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{student.matchScore}%</span>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Match</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Common Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {student.sharedSubjects?.length > 0 ? 
                      student.sharedSubjects.map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>) :
                      <span className="text-[10px] text-muted-foreground">None identified yet</span>
                    }
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 italic min-h-[40px]">
                  "{student.partnerProfile?.bio || "Let's study together and ace our exams!"}"
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => handleConnect(student)} 
                  disabled={connectingId === student.id}
                >
                  {connectingId === student.id ? "Sending..." : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-secondary/10 rounded-xl border-2 border-dashed">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No matches found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">We couldn't find any partners matching your exam goal right now. Try updating your profile or check back later!</p>
          </div>
        )
      }
    </div>
  );
}

// --- Active Partners Tab ---

function PartnersTab({ connections }: { connections: StudyPartnerConnection[] }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedConnection, setSelectedConnection] = React.useState<StudyPartnerConnection | null>(null);

  const activePartners = connections.filter(c => c.status === 'active');
  const pendingRequests = connections.filter(c => c.status === 'pending' && c.initiatedBy !== user?.uid);

  const handleAccept = async (conn: StudyPartnerConnection) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'studyPartnerConnections', conn.id), {
        status: 'active',
        acceptedAt: serverTimestamp()
      });
      toast({ title: "Partner Added!", description: "You can now start studying together." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Action failed." });
    }
  };

  const getPartnerName = (conn: any) => {
    const partnerId = conn.studentIdA === user?.uid ? conn.studentIdB : conn.studentIdA;
    return conn[`name_${partnerId}`] || conn.initiatedByName || "Study Buddy";
  };

  if (selectedConnection) {
    return <ChatView connection={selectedConnection} onBack={() => setSelectedConnection(null)} />;
  }

  return (
    <div className="space-y-8">
      {pendingRequests.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            Pending Requests
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingRequests.map(req => (
              <Card key={req.id} className="flex items-center justify-between p-4 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{(req.initiatedByName || "S").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{req.initiatedByName || "New Student Match"}</p>
                    <p className="text-xs text-muted-foreground">{req.matchScore}% Compatibility</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(req)} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive"><X className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-bold">Active Partners</h3>
        {activePartners.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activePartners.map(p => (
              <Card key={p.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedConnection(p)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-primary/20">
                        <AvatarFallback>{getPartnerName(p).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{getPartnerName(p)}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">🟢 Active Partner</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Timer className="h-3 w-3" />
                    Last session: {p.lastMessageAt ? format(p.lastMessageAt.toDate(), "PPP") : "No sessions yet"}
                  </div>
                  <Button className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Open Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed rounded-xl bg-secondary/10">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No active partners yet. Explore the discovery tab!</p>
          </div>
        )}
      </section>
    </div>
  );
}

// --- Chat & Session View ---

function ChatView({ connection, onBack }: { connection: StudyPartnerConnection, onBack: () => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [msgText, setMsgText] = React.useState("");
  const [activeSession, setActiveSession] = React.useState<StudyPartnerSession | null>(null);

  // Real-time messages
  const msgsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, `studyPartnerConnections/${connection.id}/messages`), limit(50));
  }, [firestore, connection.id]);
  const { data: messages } = useCollection<StudyPartnerMessage>(msgsQuery);

  // Real-time active session
  React.useEffect(() => {
    if (!firestore) return;
    const sessionRef = query(collection(firestore, `studyPartnerConnections/${connection.id}/studySessions`), where('status', '==', 'active'), limit(1));
    return onSnapshot(sessionRef, (snap) => {
      if (!snap.empty) {
        setActiveSession({ id: snap.docs[0].id, ...snap.docs[0].data() } as StudyPartnerSession);
      } else {
        setActiveSession(null);
      }
    });
  }, [firestore, connection.id]);

  const handleSendMessage = async () => {
    if (!user || !firestore || !msgText.trim()) return;
    if (!activeSession) {
      toast({ title: "Focus Mode", description: "Messaging is only enabled during active study sessions." });
      return;
    }

    try {
      const msgRef = collection(firestore, `studyPartnerConnections/${connection.id}/messages`);
      await setDoc(doc(msgRef), {
        senderId: user.uid,
        receiverId: user.uid === connection.studentIdA ? connection.studentIdB : connection.studentIdA,
        text: msgText,
        type: 'text',
        sentAt: serverTimestamp(),
        flaggedForReview: false
      });
      setMsgText("");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Message failed." });
    }
  };

  const handleStartSession = async () => {
    if (!user || !firestore) return;
    try {
      const sessionRef = doc(collection(firestore, `studyPartnerConnections/${connection.id}/studySessions`));
      await setDoc(sessionRef, {
        initiatedBy: user.uid,
        subject: connection.commonSubjects[0] || "General Study",
        plannedDuration: 3600,
        startedAt: serverTimestamp(),
        status: 'active',
        bothPartnersParticipated: false
      });
      toast({ title: "Session Started", description: "Go study! Messaging is now enabled." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not start session." });
    }
  };

  const handleEndSession = async () => {
    if (!user || !firestore || !activeSession) return;
    try {
      await updateDoc(doc(firestore, `studyPartnerConnections/${connection.id}/studySessions`, activeSession.id), {
        status: 'completed',
        endedAt: serverTimestamp()
      });
      toast({ title: "Session Ended", description: "Great work today!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Could not end session." });
    }
  };

  const partnerName = (connection as any)[`name_${user?.uid === connection.studentIdA ? connection.studentIdB : connection.studentIdA}`] || connection.initiatedByName || "Partner";

  return (
    <div className="flex flex-col h-[70vh] bg-card border rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><X className="h-4 w-4" /></Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{partnerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-sm">{partnerName}</p>
            <p className="text-xs text-muted-foreground">
              {activeSession ? "🟢 In Session" : "⚪ Focus Mode (Messaging Disabled)"}
            </p>
          </div>
        </div>
        {activeSession ? (
          <Button variant="destructive" size="sm" onClick={handleEndSession} className="gap-2">
            <Square className="h-3 w-3 fill-current" /> End Session
          </Button>
        ) : (
          <Button size="sm" onClick={handleStartSession} className="gap-2 bg-green-600 hover:bg-green-700">
            <Play className="h-3 w-3 fill-current" /> Start Study
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
        {messages?.sort((a, b) => a.sentAt?.toMillis() - b.sentAt?.toMillis()).map(m => (
          <div key={m.id} className={cn("flex flex-col max-w-[80%]", m.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start")}>
            <div className={cn("px-4 py-2 rounded-2xl text-sm", m.senderId === user?.uid ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none")}>
              {m.text}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 px-1">{m.sentAt ? format(m.sentAt.toDate(), "HH:mm") : "..." }</span>
          </div>
        ))}
        {!activeSession && messages?.length === 0 && (
          <div className="py-8 text-center opacity-50">
            <Timer className="h-8 w-8 mx-auto mb-2" />
            <p className="text-xs">Start a study session to unlock messaging.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input 
            placeholder={activeSession ? "Type a message..." : "Messaging disabled during focus hours"} 
            disabled={!activeSession}
            value={msgText}
            onChange={e => setMsgText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!activeSession || !msgText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function StudyPartnerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const profileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `students/${user.uid}/studyPartnerProfile`, 'main');
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<StudyPartnerProfile>(profileRef);

  const connsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "studyPartnerConnections"), where(`participants.${user.uid}`, '==', true));
  }, [firestore, user]);

  const { data: connections, isLoading: areConnsLoading } = useCollection<StudyPartnerConnection>(connsQuery);

  if (isUserLoading || isProfileLoading || areConnsLoading) {
    return <div className="space-y-8 p-8"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Study Partner</h1>
        <p className="text-muted-foreground mt-2 text-lg">Connect with peers, stay accountable, and ace your exams together.</p>
      </ScrollReveal>

      <Tabs defaultValue={connections && connections.length > 0 ? "partners" : "discovery"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="discovery">Find Partner</TabsTrigger>
          <TabsTrigger value="partners" className="relative">
            My Partners
            {connections?.some(c => c.status === 'pending' && c.initiatedBy !== user?.uid) && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="discovery">
          <DiscoveryTab profile={profile} connections={connections || []} />
        </TabsContent>

        <TabsContent value="partners">
          <PartnersTab connections={connections || []} />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab profile={profile} onUpdate={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
