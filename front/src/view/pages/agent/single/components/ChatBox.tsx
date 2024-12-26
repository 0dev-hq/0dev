"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agentService } from "@/services/agentService";
import { useMutation } from "react-query";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: number;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
}

interface ChatBoxProps {
  agentId: string;
  agentName: string;
  sessionId: string;
}

export function ChatBox({ agentId, agentName, sessionId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  const interactMutation = useMutation(
    ({
      agentId,
      sessionId,
      input,
    }: {
      agentId: string;
      sessionId: string;
      input: string;
    }) => agentService.interact(agentId, sessionId, input),
    {
      onSuccess: () => {
        const newAgentMessage: Message = {
          id: messages.length + 1,
          sender: "agent",
          content: "response",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prevMessages) => [...prevMessages, newAgentMessage]);
        setIsAgentTyping(false);
      },
      onError: () => {
        setIsAgentTyping(false);
      }
    }
  );

  useEffect(() => {
    if (sessionId) {
      // Fetch messages for the selected session
      // This is a mock implementation. Replace with actual API call.
      const mockMessages: Message[] = [
        {
          id: 1,
          sender: "agent",
          content: `Continuing session ${sessionId}. How can I assist you further?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          id: 2,
          sender: "agent",
          content: `Hello 2! I'm ${agentName}. How can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
      setMessages(mockMessages);
    } else {
      setMessages([
        {
          id: 1,
          sender: "agent",
          content: `Hello! I'm ${agentName}. How can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  }, [sessionId, agentName]);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    setIsAgentTyping(true);

    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");

    interactMutation.mutate({
      agentId,
      sessionId,
      input,
    });

    // // Simulate agent response
    // setTimeout(() => {
    //   const newAgentMessage: Message = {
    //     id: messages.length + 2,
    //     sender: "agent",
    //     content: `This is a response from ${agentName}${
    //       sessionId ? ` in session ${sessionId}` : ""
    //     }.`,
    //     timestamp: new Date().toLocaleTimeString([], {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     }),
    //   };

    //   setMessages((prevMessages) => [...prevMessages, newAgentMessage]);
    // }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-grow pr-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start mb-4 ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "agent" && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt={agentName}
                />
                <AvatarFallback>{agentName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`rounded-lg p-3 max-w-[70%] ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-50 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isAgentTyping && (
          <div className="flex items-start mb-4">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt={agentName}
              />
              <AvatarFallback>{agentName[0]}</AvatarFallback>
            </Avatar>
            <TypingIndicator />
          </div>
        )}
      </ScrollArea>
      <div className="mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
