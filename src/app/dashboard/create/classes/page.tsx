"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, Clock, IndianRupee, Save } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

const daysOrder: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeSlots = ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"];

interface Availability {
  [day: string]: string[];
}

export default function CreateClassesPage() {
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [costPerHour, setCostPerHour] = React.useState("50");
  const [availability, setAvailability] = React.useState<Availability>({});

  const handleSlotToggle = (day: Day, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter(s => s !== slot) };
      } else {
        return { ...prev, [day]: [...daySlots, slot] };
      }
    });
  };

  const handleSaveChanges = () => {
    // Placeholder for saving logic
    toast({
      title: "Availability Saved",
      description: "Your live class schedule has been updated.",
    });
  };

  return (
    <div className="space-y-8">
      <ScrollReveal>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manage Live Classes</h1>
        <p className="text-muted-foreground mt-2 text-lg">Set your schedule and pricing for one-on-one sessions.</p>
      </ScrollReveal>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Configuration */}
        <div className="lg:col-span-1 space-y-8">
          <ScrollReveal delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="availability-toggle" className="flex flex-col space-y-1">
                    <span>Available for Online Classes</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Allow students to book live sessions with you.
                    </span>
                  </Label>
                  <Switch id="availability-toggle" checked={isAvailable} onCheckedChange={setIsAvailable} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Per Hour</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="cost" type="number" placeholder="50.00" className="pl-10" value={costPerHour} onChange={(e) => setCostPerHour(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="text-center">
            <Button size="lg" onClick={handleSaveChanges}>
              <Save className="mr-2 h-5 w-5" /> Save Changes
            </Button>
          </ScrollReveal>
        </div>

        {/* Right Side: Availability Grid */}
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5"/> Weekly Availability</CardTitle>
                <CardDescription>Select the time slots you are available for teaching.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {daysOrder.map(day => (
                            <div key={day} className="bg-card border rounded-lg p-3">
                                <h3 className="font-bold text-center mb-3">{day}</h3>
                                <div className="space-y-2">
                                    {timeSlots.map(slot => (
                                        <div
                                            key={slot}
                                            onClick={() => handleSlotToggle(day, slot)}
                                            className={cn(
                                                "p-2 text-center rounded-md cursor-pointer transition-all border",
                                                availability[day]?.includes(slot)
                                                    ? "bg-primary/10 border-primary text-primary-foreground font-semibold"
                                                    : "bg-secondary hover:bg-accent"
                                            )}
                                        >
                                            <p className="text-sm">{slot}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
      
       {/* Upcoming Slots Preview */}
      <ScrollReveal delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Available Slots</CardTitle>
            <CardDescription>This is how your available slots will appear to students.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {daysOrder.flatMap(day => 
                (availability[day] || []).map(slot => (
                  <Card key={`${day}-${slot}`} className="bg-secondary p-4 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold">{day}, This Week</p>
                      <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1"><Clock className="w-4 h-4" /> {slot}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                       <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                         <CheckCircle className="w-4 h-4"/>
                         Available
                       </div>
                       <p className="font-bold text-lg">₹{costPerHour}<span className="text-xs text-muted-foreground">/hr</span></p>
                    </div>
                  </Card>
                ))
              )}
               {Object.keys(availability).every(day => availability[day].length === 0) && (
                 <div className="col-span-full text-center py-8 text-muted-foreground">
                    You have not set any available slots.
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
