"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, Clock, IndianRupee, Save, PlusCircle, Trash2 } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
const daysOrder: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// New Slot interface
interface AvailabilitySlot {
  id: number;
  day: Day;
  time: string;
  period: "AM" | "PM";
}

export default function CreateClassesPage() {
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [costPerHour, setCostPerHour] = React.useState("50");

  // New state for dynamic slots
  const [slots, setSlots] = React.useState<AvailabilitySlot[]>([
    { id: Date.now(), day: "Mon", time: "10:00", period: "AM" },
  ]);

  const addSlot = () => {
    setSlots([...slots, { id: Date.now(), day: "Mon", time: "12:00", period: "PM" }]);
  };

  const removeSlot = (id: number) => {
    if (slots.length > 1) {
        setSlots(slots.filter(slot => slot.id !== id));
    } else {
        toast({
            variant: "destructive",
            title: "Cannot remove",
            description: "You must have at least one availability slot.",
        });
    }
  };

  const handleSlotChange = <K extends keyof AvailabilitySlot>(
    id: number,
    field: K,
    value: AvailabilitySlot[K]
  ) => {
    setSlots(slots.map(slot => (slot.id === id ? { ...slot, [field]: value } : slot)));
  };

  const handleSaveChanges = () => {
    // Placeholder for saving logic. This would now save the `slots` array.
    console.log({ isAvailable, costPerHour, slots });
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

        {/* Right Side: Availability Management */}
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5"/> Weekly Availability</CardTitle>
                <CardDescription>Add the time slots you are available for teaching.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {slots.map((slot) => (
                    <div key={slot.id} className="flex items-center gap-2 p-3 border rounded-lg bg-secondary/50">
                        <div className="grid grid-cols-3 gap-2 flex-grow">
                             <Select
                                value={slot.day}
                                onValueChange={(value: Day) => handleSlotChange(slot.id, 'day', value)}
                            >
                                <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
                                <SelectContent>
                                    {daysOrder.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input 
                                type="text"
                                placeholder="e.g., 10:00"
                                value={slot.time}
                                onChange={(e) => handleSlotChange(slot.id, 'time', e.target.value)}
                            />
                            <Select
                                value={slot.period}
                                onValueChange={(value: 'AM' | 'PM') => handleSlotChange(slot.id, 'period', value)}
                            >
                                <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeSlot(slot.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" onClick={addSlot} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Slot
                </Button>
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
              {slots.map(slot => (
                  <Card key={slot.id} className="bg-secondary p-4 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold">{slot.day}, This Week</p>
                      <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1"><Clock className="w-4 h-4" /> {slot.time} {slot.period}</p>
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
              }
               {slots.length === 0 && (
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
