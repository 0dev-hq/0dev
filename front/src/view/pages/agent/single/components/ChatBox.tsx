"use client";

import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agentService, InteractionResponse } from "@/services/agentService";
import { useMutation } from "react-query";
import { TypingIndicator } from "./TypingIndicator";
import { InteractionMessage } from "./chatbox-messages/messageTypes";
import { MessageFactory } from "./chatbox-messages/MessageBubbleFactory";

interface ChatBoxProps {
  agentId: string;
  agentName: string;
  sessionId: string;
}

export function ChatBox({ agentId, agentName, sessionId }: ChatBoxProps) {
  const [messages, setMessages] = useState<InteractionMessage[]>([]);
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
      onSuccess: (response: InteractionResponse) => {
        setMessages((prevMessages) => [...prevMessages, response]);
        setIsAgentTyping(false);
      },
      onError: () => {
        setIsAgentTyping(false);
      },
    }
  );

  const { mutate: loadInteractionHistory, isLoading } = useMutation(
    () => agentService.loadChatHistory(agentId, sessionId),
    {
      onSuccess: (history: InteractionMessage[]) => {
        console.log(JSON.stringify(history, null, 2));
        setMessages(history);
      },
      onError: () => {
        setMessages([]);
      },
      onSettled: () => {
      },
    }
  );

  useEffect(() => {
    if (sessionId) {
      loadInteractionHistory();
    } else {
      setMessages([]);
    }
  }, [sessionId, loadInteractionHistory]);

  const handleSendMessage = (content: string) => {
    const newUserMessage: InteractionMessage = {
      type: "user_input",
      content,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");
    setIsAgentTyping(true);

    interactMutation.mutate({
      agentId,
      sessionId,
      input,
    });
  };

  const handleStructuredResponse = (response: string) => {
    handleSendMessage(response);
  };

  if (isLoading) {
    return <div>Loading chat history...</div>;
  }

  return (
    <div className="flex flex-col h-[600px]">
      <ScrollArea className="flex-grow pr-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start mb-4 ${
              message.type === "user_input" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type !== "user_input" && (
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt={agentName}
                />
                <AvatarFallback>{agentName[0]}</AvatarFallback>
              </Avatar>
            )}
            <MessageFactory
              message={message}
              onResponse={handleStructuredResponse}
            />
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
            handleSendMessage(input);
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
