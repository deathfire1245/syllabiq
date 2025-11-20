
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    
    setMessages([...messages, { text: input, sender: 'user' }]);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `This is a simulated AI response to: "${input}"`, sender: 'ai' }]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
        <p className="text-muted-foreground">Ask me anything about your subjects and topics!</p>
      </div>
      
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
           <ScrollArea className="flex-grow pr-4 -mr-4 mb-4">
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                       <Avatar className="h-8 w-8 border-2 border-primary">
                          <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                       </Avatar>
                    )}
                    <div className={`rounded-lg p-3 max-w-md ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                       <p>{msg.text}</p>
                    </div>
                     {msg.sender === 'user' && (
                       <Avatar className="h-8 w-8">
                         <AvatarImage src="https://picsum.photos/seed/user-avatar/100" />
                         <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                       </Avatar>
                    )}
                  </div>
                ))}
              </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question here..." 
            />
            <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
