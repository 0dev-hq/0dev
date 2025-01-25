

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import yaml from "js-yaml";

interface YamlUploadProps {
  onConfigLoaded: (config: any) => void;
}

export default function YamlUpload({ onConfigLoaded }: YamlUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        try {
          const data = yaml.load(text as string);
          onConfigLoaded(data);
          setUploadStatus("success");
          setErrorMessage("");
        } catch (error) {
          console.error("Error parsing YAML:", error);
          setUploadStatus("error");
          setErrorMessage(
            "Error parsing YAML file. Please check the file format."
          );
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-black">
        Upload Configuration File (Optional)
      </h2>
      <p className="text-gray-600">
        Upload a YAML file to pre-fill the wizard, or proceed with empty inputs.
      </p>
      <div className="space-y-2">
        <Label htmlFor="yaml-upload" className="text-black">
          YAML File
        </Label>
        <div className="flex items-center space-x-2">
          <Input
            id="yaml-upload"
            type="file"
            accept=".yaml,.yml"
            onChange={handleFileUpload}
            className="border-gray-300 focus:border-black focus:ring-black"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("yaml-upload")?.click()}
          >
            Browse
          </Button>
        </div>
      </div>
      {uploadStatus === "success" && (
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>YAML file successfully loaded</span>
        </div>
      )}
      {uploadStatus === "error" && (
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
