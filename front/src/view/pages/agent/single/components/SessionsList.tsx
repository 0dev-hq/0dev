import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "react-query";
import { agentService } from "@/services/agentService";

interface SessionsListProps {
  agentId: string;
  onSelectSession: (sessionId: string) => void;
}

export function SessionsList({ onSelectSession, agentId }: SessionsListProps) {
  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery(["sessions", agentId], () => agentService.listSessions(agentId));

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error loading sessions</div>;

  if (sessions?.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No sessions available yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session ID</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>{/* Action */}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions?.map((session) => (
          <TableRow key={session.sessionId}>
            <TableCell>{session.sessionId}</TableCell>
            <TableCell>{format(session.createdAt, "PPpp")}</TableCell>
            <TableCell>
              <Button onClick={() => onSelectSession(session.sessionId)}>
                Continue
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
