"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useLoading } from "./loading-provider";

const initialMessages = [
  {
    role: "system",
    content: "Hi there! I'm your AI Career Coach assistant. How can I help you today?"
  }
];

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, isLoaded } = useUser();
  const { showLoading, hideLoading } = useLoading();
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add welcome message with user's name if available
  useEffect(() => {
    if (isLoaded && user && messages.length === 1) {
      // Update the initial message with the user's name
      const welcomeMessage = {
        role: "system",
        content: `Hi ${user.firstName || "there"}! I'm your AI Career Coach assistant. How can I help you today?`
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoaded, user, messages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    showLoading("Thinking...");
    
    // Extract name if present in first greeting
    let detectedName = null;
    if (messages.length === 1 && input.toLowerCase().startsWith("hi") || input.toLowerCase().startsWith("hello")) {
      // Check for name in greeting (e.g., "Hi Krishna!")
      const parts = input.trim().split(/\s+/);
      if (parts.length >= 2) {
        // Get potential name (second word after greeting)
        const potentialName = parts[1].replace(/[^a-zA-Z]/g, '');
        if (potentialName && potentialName.length >= 2) {
          detectedName = potentialName;
        }
      }
    }
    
    try {
      // Call our Gemini-powered API with the entire conversation history
      const response = await fetch("/api/chat-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: input,
          messageHistory: [...messages, userMessage].map(msg => ({
            role: msg.role === "system" ? "model" : "user",
            content: msg.content
          })),
          userData: isLoaded && user ? {
            id: user.id,
            firstName: user.firstName || detectedName,
            lastName: user.lastName,
            email: user.emailAddresses[0]?.emailAddress,
          } : detectedName ? {
            firstName: detectedName
          } : null
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }
      
      const data = await response.json();
      
      // Add AI response to messages
      setMessages(prev => [...prev, { 
        role: "system", 
        content: data.response || "I'm having trouble connecting. Please try again."
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Using fallback.");
      
      // Use fallback response if API fails
      const fallbackResponse = getFallbackResponse(input, messages, detectedName);
      setMessages(prev => [...prev, { role: "system", content: fallbackResponse }]);
    } finally {
      setIsLoading(false);
      hideLoading();
    }
  };

  // Get user data for personalized fallbacks
  const getUserData = async () => {
    if (!isLoaded || !user) return null;
    
    try {
      // This would be better as an API call to get the user's data
      // For now, we'll just return what we have from Clerk
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Fallback responses if API fails - now with message history and detected name
  const getFallbackResponse = (query, messageHistory, detectedName = null) => {
    query = query.toLowerCase();
    const userData = user ? {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress,
    } : null;
    
    // Name question fallback
    if (query.includes("my name") || query.includes("who am i")) {
      if (isLoaded && user && user.firstName) {
        return `You're logged in as ${user.firstName} ${user.lastName || ""}.`;
      } else if (detectedName) {
        return `Based on our conversation, I understand your name is ${detectedName}. Nice to meet you!`;
      } else {
        return "I don't have your name information yet. You can update your profile by clicking your profile picture in the top-right corner of the screen.";
      }
    }
    
    // Industry insights personalized fallback
    if (query.includes("industry") || query.includes("career path") || query.includes("salary")) {
      if (isLoaded && user && user.firstName) {
        return `${user.firstName}, you can find detailed industry insights by clicking the 'Industry Insights' button in the header. This will show you data relevant to your career interests.`;
      } else {
        return "You can find industry insights by clicking the 'Industry Insights' button in the header of the application.";
      }
    }
    
    // Resume building personalized fallback
    if (query.includes("resume") || query.includes("cv")) {
      if (isLoaded && user && user.firstName) {
        return `${user.firstName}, to build or update your resume, click on the 'Growth Tools' dropdown in the top navigation bar, then select 'Build Resume'. There you can create a professional resume tailored to your experience.`;
      } else {
        return "You can find the Resume Builder by clicking the 'Growth Tools' dropdown in the top navigation bar, then select 'Build Resume' from the dropdown menu.";
      }
    }
    
    // Interview prep personalized fallback
    if (query.includes("interview")) {
      if (isLoaded && user && user.firstName) {
        return `${user.firstName}, our Interview Preparation tools are available by clicking on the 'Growth Tools' dropdown, then selecting 'Interview Prep'. Would you like to know more about practicing for specific types of interviews?`;
      } else {
        return "Interview Preparation tools are located in the 'Growth Tools' dropdown in the top navigation bar. Click on 'Growth Tools' and then select 'Interview Prep' from the dropdown menu.";
      }
    }
    
    // Check if we're in a coding career conversation
    const isInCodingConversation = messageHistory.some(msg => 
      msg.content.toLowerCase().includes("become a coder") || 
      msg.content.toLowerCase().includes("learn coding") ||
      msg.content.toLowerCase().includes("web development") ||
      msg.content.toLowerCase().includes("programming")
    );
    
    if (isInCodingConversation) {
      if (query.includes("web") && query.includes("development")) {
        return "Great choice! For web development, I recommend starting with HTML, CSS, and JavaScript basics. There are excellent free resources like freeCodeCamp, MDN Web Docs, and The Odin Project that provide structured learning paths. Would you like more specific resources or have questions about particular aspects of web development?";
      }
      
      if (query.includes("no") && query.includes("experience")) {
        return "That's completely fine! Everyone starts somewhere. For beginners in web development, I recommend starting with HTML and CSS to build static websites, then moving to JavaScript for interactivity. Would you prefer tutorial videos, interactive coding platforms, or project-based learning?";
      }
      
      // Continue the coding conversation
      return "To begin your web development journey, I recommend starting with the fundamentals: HTML for structure, CSS for styling, and JavaScript for interactivity. Free resources like freeCodeCamp and The Odin Project offer structured learning paths. Would you like to focus on front-end (user interfaces), back-end (server-side), or full-stack development?";
    }
    
    // Coding career interest fallback
    if (query.includes("become a coder") || query.includes("learn coding") || 
        query.includes("become a programmer") || query.includes("start coding")) {
      return "That's great! I'd love to learn more about what interests you in coding. Are you drawn to web development, mobile apps, data science, or something else? Your interests will help me suggest the best starting resources for you.";
    }
    
    // Interview preparation fallback
    if (query.includes("interview") && (query.includes("prep") || query.includes("practice") || 
        query.includes("prepare") || query.includes("ready"))) {
      return "I'd be happy to help with your interview preparation. What kind of role are you interviewing for, and do you have any specific concerns about the interview process? This will help me provide more relevant advice.";
    }
    
    // Personal profile fallback
    if (query.includes("my profile") || query.includes("my account") || 
        query.includes("my skills") || query.includes("my progress")) {
      if (isLoaded && user) {
        return `I can see you're logged in as ${user.firstName || "a user"}. You can access your account settings by clicking on your profile picture in the top-right corner of the screen.`;
      } else {
        return "You can access your account settings by clicking on your profile picture in the top-right corner of the screen.";
      }
    }

    if (query.includes("features") || query.includes("what can you do") || query.includes("what is thunai")) {
      return `ThunAI offers several powerful features:\n\n- AI-Powered Career Guidance: Personalized advice based on your goals\n- Interview Mastery: Practice sessions\n- Industry Insights: Trends and data\n- Smart Resume Builder: Create optimized resumes\n- Cover Letter Generator: Create customized cover letters\n\nWhat would you like to explore first?`;
    }
    
    if (query.includes("resume") && (query.includes("where") || query.includes("find") || query.includes("how"))) {
      return "You can find the Resume Builder by clicking the 'Growth Tools' dropdown in the top navigation bar, then select 'Build Resume' from the dropdown menu.";
    }
    
    if (query.includes("interview") && (query.includes("where") || query.includes("find") || query.includes("how"))) {
      return "Interview Preparation tools are located in the 'Growth Tools' dropdown in the top navigation bar. Click on 'Growth Tools' and then select 'Interview Prep' from the dropdown menu.";
    }
    
    if (query.includes("cover letter") && (query.includes("where") || query.includes("find") || query.includes("how"))) {
      return "You can access the Cover Letter Generator from the 'Growth Tools' dropdown in the top navigation bar. Click on 'Growth Tools' and then select 'Cover Letter' from the dropdown menu.";
    }
    
    if (query.includes("navigation") || query.includes("menu") || query.includes("layout")) {
      return "ThunAI's main navigation includes:\n\n- Logo (top-left): Click to go to home page\n- Industry Insights button: Takes you to the dashboard\n- Growth Tools Dropdown: Contains Resume Builder, Cover Letter, and Interview Prep\n- User Profile button (top-right): Settings and logout";
    }
    
    return "I'm ThunAI, your AI career coach providing personalized guidance, resume building, interview preparation, and industry insights. How can I help you today?";
  };

  return (
    <>
      {/* Chat button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat panel */}
      <div className={cn(
        "fixed bottom-6 right-6 w-80 sm:w-96 h-[480px] bg-background border rounded-lg shadow-lg z-50 flex flex-col transition-all duration-300",
        isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-medium">ThunAI Support Assistant</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-primary-foreground">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((message, i) => (
            <div key={i} className={cn(
              "px-3 py-2 rounded-lg max-w-[85%]",
              message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="px-3 py-2 rounded-lg max-w-[85%] bg-muted">
              <p className="text-sm">Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
} 