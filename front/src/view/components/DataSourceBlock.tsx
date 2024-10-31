import React, { useState } from "react";
import {
  FiEdit,
  FiTrash2,
  FiFileText,
} from "react-icons/fi";
import { FaDatabase } from "react-icons/fa";
import { SiMongodb, SiMysql, SiPostgresql, SiSupabase } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface DataSourceBlockProps {
  id: string;
  name: string;
  type: string;
  lastTimeAnalyzed?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatDate = (date: string) => {
  if (!date) {
    return "Not analyzed";
  }
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getDataSourceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "mongodb":
      return <SiMongodb className="h-6 w-6 text-primary" />;
    case "mysql":
      return <SiMysql className="h-6 w-6 text-primary" />;
    case "postgresql":
      return <SiPostgresql className="h-6 w-6 text-primary" />;
    case "supabase":
      return <SiSupabase className="h-6 w-6 text-primary" />;
    default:
      return <FaDatabase className="h-6 w-6 text-primary" />;
  }
};

const DataSourceBlock: React.FC<DataSourceBlockProps> = ({
  id,
  name,
  type,
  lastTimeAnalyzed,
  onEdit,
  onDelete,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const goToDataSourceAnalysis = (id: string) => {
    navigate(`/data-source/${id}/analysis`);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg max-w-96">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="rounded-full bg-primary/10 p-2">
          {getDataSourceIcon(type)}
        </div>
        <div>
          <CardTitle className="text-xl">{name}</CardTitle>
          <p className="text-sm text-muted-foreground capitalize">{type}</p>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FiFileText className="h-4 w-4" />
            Queries
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FiFileText className="h-4 w-4" />
            Reports
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <FiEdit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>

          {/* Delete Button with Confirmation Dialog */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
              >
                <FiTrash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  onDelete(id);
                  setIsDialogOpen(false);
                }}>
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  <span className="sr-only">Last analyzed:</span>
                  <span>{formatDate(lastTimeAnalyzed)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last analyzed: {formatDate(lastTimeAnalyzed)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={() => goToDataSourceAnalysis(id)}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
          >
            Analyze
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DataSourceBlock;
