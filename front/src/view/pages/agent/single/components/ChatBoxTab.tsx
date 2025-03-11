import { useState, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { agentService } from "@/services/agentService";
import { useMutation } from "react-query";
import { TypingIndicator } from "./TypingIndicator";
import { InteractionMessage, JobMessage } from "./chatbox-messages/messageTypes";
import { MessageFactory } from "./chatbox-messages/MessageBubbleFactory";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/context/SocketProvider";

interface ChatBoxTabProps {
  agentId: string;
  agentName: string;
  sessionId?: string;
  shouldLoadHistory?: boolean;
  onStartNewSession: () => void;
}

export function ChatBoxTab({
  agentId,
  agentName,
  sessionId,
  shouldLoadHistory,
  onStartNewSession,
}: ChatBoxTabProps) {
  const [messages, setMessages] = useState<InteractionMessage[]>([]);
  const [input, setInput] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const { socket, joinRoom, leaveRoom } = useSocket();

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
      onSuccess: (response: InteractionMessage) => {
        // Only valid case is handing the job_execution step in the backend
        if (!response)
        {
          return;
        }
        setMessages((prevMessages) => [...prevMessages, response]);
        setIsAgentTyping(false);
      },
      onError: () => {
        setIsAgentTyping(false);
      },
    }
  );

  const { mutate: loadInteractionHistory, isLoading } = useMutation(
    () => agentService.loadChatHistory(agentId, sessionId!),
    {
      onSuccess: (history: InteractionMessage[]) => {
        // Remove null values from the history
        const filteredHistory = history.filter((item) => item !== null);
        setMessages(filteredHistory);
      },
      onError: () => {
        setMessages([]);
      },
      onSettled: () => {},
    }
  );

  useEffect(() => {
    if (!agentId || !sessionId) return;
    const room = `dana:job-update:${agentId}:${sessionId}`;
    console.log("Joining room", room);
    joinRoom(room);

    socket?.on("job_created", (data) => {
      const msg: JobMessage = {
        "type": "job",
        "content": {
          "name": data.name,
          "description": data.description,
          "job_id": data.job_id,
          "status": data.status,
          "payload": data.result
        }
      }
      setMessages((prevMessages) => [...prevMessages, msg]);
      // setJobUpdates((prevJobUpdates) => [...prevJobUpdates, data]);
      console.log("Job created", data);
    });

    socket?.on("job_completed", (data) => {
      const msg: JobMessage = {
        "type": "job",
        "content": {
          "name": data.name,
          "description": data.description,
          "job_id": data.job_id,
          "status": data.status,
          "payload": data.result
        }
      }
      setMessages((prevMessages) => [...prevMessages, msg]);
      // setJobUpdates((prevJobUpdates) => [...prevJobUpdates, data]);
      console.log("Job completed", data);
    });

    socket?.on("job_failed", (data) => {
      const msg: JobMessage = {
        "type": "job",
        "content": {
          "name": data.name,
          "description": data.description,
          "job_id": data.job_id,
          "status": data.status,
          "payload": data.result
        }
      }
      setMessages((prevMessages) => [...prevMessages, msg]);
      // setJobUpdates((prevJobUpdates) => [...prevJobUpdates, data]);
      console.log("Job failed", data);
    });

    socket?.on("job_scheduled", (data) => {
      const msg: JobMessage = {
        "type": "job",
        "content": {
          "name": data.name,
          "description": data.description,
          "job_id": data.job_id,
          "status": data.status,
          "payload": data.result
        }
      }
      setMessages((prevMessages) => [...prevMessages, msg]);
      // setJobUpdates((prevJobUpdates) => [...prevJobUpdates, data]);
      console.log("Job scheduled");
    });

    if (shouldLoadHistory) {
      loadInteractionHistory();
    } else {
      setMessages([]);
    }

    return () => {
      leaveRoom(room);
    };
  }, [agentId, sessionId, shouldLoadHistory, loadInteractionHistory]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

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
      sessionId: sessionId!,
      input: content,
    });
  };

  const handleStructuredResponse = (response: string) => {
    handleSendMessage(response);
  };

  if (isLoading) {
    return <div>Loading chat history...</div>;
  }

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground mb-6">
          Start a new chat session with the agent.
        </p>
        <Button onClick={onStartNewSession} size="lg">
          Start a new chat
        </Button>
      </div>
    );
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
      <div className="mt-4 relative">
        <Textarea
          placeholder="Message your agent..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow min-h-[60px] pr-12 resize-none"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 bottom-2 h-8 w-8"
          onClick={() => handleSendMessage(input?.trim())}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
