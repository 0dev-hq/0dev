import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Download,
  File,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  Plus,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { fileService, StorageFile } from "@/services/fileService";
import { useState } from "react";

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case "csv":
    case "excel":
      return <FileSpreadsheet className="h-5 w-5" />;
    case "json":
      return <FileText className="h-5 w-5" />;
    default:
      return <File className="h-5 w-5" />;
  }
}

export default function FilesPage() {
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery<StorageFile[]>({
    queryKey: ["files"],
    queryFn: fileService.listFiles,
    onError: () => toast.error("Failed to fetch files."),
  });

  const { register, handleSubmit, reset, formState } = useForm<{ file: FileList }>();

  const uploadMutation = useMutation(fileService.uploadFile, {
    onSuccess: () => {
      toast.success("File uploaded successfully.");
      queryClient.invalidateQueries(["files"]);
      reset();
      setShowUploadDialog(false);
    },
    onError: () => {
      toast.error("Failed to upload file.");
    },
  });

  // React Query: Delete file
  const deleteMutation = useMutation(fileService.deleteFile, {
    onSuccess: () => {
      toast.success("File deleted successfully.");
      queryClient.invalidateQueries(["files"]);
    },
    onError: () => {
      toast.error("Failed to delete file.");
    },
  });

  // React Query: Download file
  const handleDownload = async (fileUrl: string) => {
    try {
      const blob = await fileService.downloadFile(fileUrl);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileUrl; // Use file name or identifier
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file.");
    }
  };

  const onSubmit = (data: { file: FileList }) => {
    if (data.file && data.file.length > 0) {
      uploadMutation.mutate(data.file[0]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">
            Upload your files to the staging storage
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>
                Choose a file from your computer to upload
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  {...register("file")}
                  required
                  disabled={uploadMutation.isLoading}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={uploadMutation.isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={uploadMutation.isLoading || !formState.isValid}
                >
                  {uploadMutation.isLoading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading files...</p>
        ) : (
          files?.map((file) => (
            <Card key={file.url}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                  {getFileIcon(file.url.split(".").pop() || "")}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{file.url}</CardTitle>
                  <CardDescription>
                    {file.size} bytes •{" "}
                    {formatDistanceToNow(new Date(file.createdAt), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(file.url)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDownload(file.url)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(file.url)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
