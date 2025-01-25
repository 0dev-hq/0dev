"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Eye, EyeOff, Key } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AgentConfig } from "@/services/agentControllerService";

interface Secret {
  name: string;
  value: string;
  description: string;
}

interface SecretsProps {
  config: AgentConfig;
  updateConfig: (config: Partial<AgentConfig>) => void;
}

export default function Secrets({
  config,
  updateConfig,
}: SecretsProps) {
  const [newSecret, setNewSecret] = useState<Secret>({
    name: "",
    value: "",
    description: "",
  });
  const [editingSecretName, setEditingSecretName] = useState<string | null>(
    null
  );
  const [showSecretValue, setShowSecretValue] = useState<
    Record<string, boolean>
  >({});
  const [error, setError] = useState<string | null>(null); // Added state for error handling

  const handleAddSecret = () => {
    if (newSecret.name.trim() && newSecret.value.trim()) {
      updateConfig({
        secrets: [...(config.secrets || []), newSecret],
      });
      setNewSecret({ name: "", value: "", description: "" });
    }
  };

  const handleEditSecret = (secretName: string) => {
    setEditingSecretName(secretName);
  };

  const handleUpdateSecret = (updatedSecret: Secret) => {
    if (
      updatedSecret.name !== editingSecretName &&
      config.secrets.some((s: Secret) => s.name === updatedSecret.name)
    ) {
      // Name conflict detected
      alert(
        `A secret with the name "${updatedSecret.name}" already exists. Please choose a different name.`
      );
      return;
    }

    updateConfig({
      secrets: config.secrets.map((s: Secret) =>
        s.name === editingSecretName ? updatedSecret : s
      ),
    });
    setEditingSecretName(null);
  };

  const handleRemoveSecret = (secretToRemove: Secret) => {
    updateConfig({
      secrets: config.secrets.filter(
        (s: Secret) => s.name !== secretToRemove.name
      ),
    });
  };

  const toggleSecretVisibility = (secretName: string) => {
    setShowSecretValue((prev) => ({
      ...prev,
      [secretName]: !prev[secretName],
    }));
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <h2 className="text-2xl font-bold text-gray-900">Secrets</h2>
      <p className="text-gray-600">
        Manage secrets for your agent. These will be securely stored and used by the agent.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Add New Secret</CardTitle>
          <CardDescription>
            Provide the details for the new secret
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secret-name">Secret Name</Label>
                <Input
                  id="secret-name"
                  value={newSecret.name}
                  onChange={(e) =>
                    setNewSecret({ ...newSecret, name: e.target.value })
                  }
                  placeholder="API_KEY"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret-value">Secret Value</Label>
                <Input
                  id="secret-value"
                  type="password"
                  value={newSecret.value}
                  onChange={(e) =>
                    setNewSecret({ ...newSecret, value: e.target.value })
                  }
                  placeholder="Enter secret value"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret-description">Description</Label>
              <Textarea
                id="secret-description"
                value={newSecret.description}
                onChange={(e) =>
                  setNewSecret({ ...newSecret, description: e.target.value })
                }
                placeholder="Describe the purpose of this secret"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddSecret} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Secret
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configured Secrets</h3>
        <Accordion type="single" collapsible className="w-full">
          {config.secrets &&
            config.secrets.map((secret: Secret, index: number) => (
              <AccordionItem value={`secret-${index}`} key={secret.name}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>{secret.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardContent className="pt-6">
                      {editingSecretName === secret.name ? (
                        <EditSecretForm
                          secret={secret}
                          onSave={(updatedSecret) => {
                            if (
                              updatedSecret.name !== editingSecretName &&
                              config.secrets.some(
                                (s: Secret) => s.name === updatedSecret.name
                              )
                            ) {
                              setError(
                                `A secret with the name "${updatedSecret.name}" already exists. Please choose a different name.`
                              );
                            } else {
                              handleUpdateSecret(updatedSecret);
                            }
                          }}
                          onCancel={() => setEditingSecretName(null)}
                          showSecretValue={showSecretValue[secret.name]}
                          toggleSecretVisibility={() =>
                            toggleSecretVisibility(secret.name)
                          }
                        />
                      ) : (
                        <ViewSecretForm
                          secret={secret}
                          onEdit={() => handleEditSecret(secret.name)}
                          onRemove={() => handleRemoveSecret(secret)}
                          showSecretValue={showSecretValue[secret.name]}
                          toggleSecretVisibility={() =>
                            toggleSecretVisibility(secret.name)
                          }
                        />
                      )}
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}

interface SecretFormProps {
  secret: Secret;
  showSecretValue: boolean;
  toggleSecretVisibility: () => void;
}

function EditSecretForm({
  secret,
  onSave,
  onCancel,
  showSecretValue,
  toggleSecretVisibility,
}: SecretFormProps & {
  onSave: (secret: Secret) => void;
  onCancel: () => void;
}) {
  const [editedSecret, setEditedSecret] = useState(secret);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    onSave(editedSecret);
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="space-y-2">
        <Label>Secret Name</Label>
        <Input
          value={editedSecret.name}
          onChange={(e) =>
            setEditedSecret({ ...editedSecret, name: e.target.value })
          }
          placeholder="Secret name"
        />
      </div>
      <div className="space-y-2">
        <Label>Secret Value</Label>
        <div className="flex space-x-2">
          <Input
            type={showSecretValue ? "text" : "password"}
            value={editedSecret.value}
            onChange={(e) =>
              setEditedSecret({ ...editedSecret, value: e.target.value })
            }
            placeholder="Secret value"
            className="flex-grow"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSecretVisibility}
          >
            {showSecretValue ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={editedSecret.description}
          onChange={(e) =>
            setEditedSecret({ ...editedSecret, description: e.target.value })
          }
          placeholder="Secret description"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}

function ViewSecretForm({
  secret,
  onEdit,
  onRemove,
  showSecretValue,
  toggleSecretVisibility,
}: SecretFormProps & { onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Secret Value</Label>
        <div className="flex space-x-2">
          <Input
            type={showSecretValue ? "text" : "password"}
            value={secret.value}
            readOnly
            className="flex-grow"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSecretVisibility}
          >
            {showSecretValue ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <p className="text-sm text-gray-500">{secret.description}</p>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>
    </div>
  );
}
