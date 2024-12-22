"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, Search, Edit2, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PolicyAndPermissions({ config, updateConfig }) {
  const [newPolicy, setNewPolicy] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredPolicies = config.policies.filter((policy) =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPolicy = useCallback(() => {
    const policyName = newPolicy.trim();

    if (!policyName) {
      setError("Policy name cannot be empty");
      return;
    }

    if (config.policies.some((p) => p.name === policyName)) {
      setError("This policy already exists");
      return;
    }

    updateConfig({
      policies: [
        ...config.policies,
        { name: policyName, askConfirmation: true },
      ],
    });
    setNewPolicy("");
    setError("");
  }, [newPolicy, config.policies, updateConfig]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddPolicy();
      }
    },
    [handleAddPolicy]
  );

  const removePolicy = useCallback(
    (policyToRemove: string) => {
      updateConfig({
        policies: config.policies.filter(
          (policy) => policy.name !== policyToRemove
        ),
      });
    },
    [config.policies, updateConfig]
  );

  const startEditing = useCallback((policyName: string) => {
    setEditingPolicy(policyName);
    setEditValue(policyName);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingPolicy === null) return;

    const newPolicies = config.policies.map((policy) =>
      policy.name === editingPolicy ? { ...policy, name: editValue } : policy
    );
    updateConfig({ policies: newPolicies });
    setEditingPolicy(null);
  }, [editingPolicy, editValue, config.policies, updateConfig]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        setEditingPolicy(null);
      }
    },
    [saveEdit]
  );


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingPolicy !== null &&
        !(event.target as Element).closest(".policy-item")
      ) {
        saveEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingPolicy, saveEdit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Policy and Permissions
        </h2>
        <p className="mt-2 text-gray-600">
          Define when the agent should act autonomously and when it should ask
          for confirmation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policies Overview</CardTitle>
          <CardDescription>
            View, edit, and manage all your policies in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newPolicy}
              onChange={(e) => {
                setNewPolicy(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Add new policy..."
              className="border-gray-300 focus:border-black focus:ring-black"
            />
            <Button
              onClick={handleAddPolicy}
              className="bg-black hover:bg-gray-800 text-white whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {filteredPolicies.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredPolicies.map((policy, index) => (
                    <motion.li
                      key={policy.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="policy-item"
                    >
                      <div className="flex items-center bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <span className="w-8 text-center text-gray-500 font-mono">
                          {index + 1}.
                        </span>
                        {editingPolicy === policy.name ? (
                          <div className="flex-grow flex items-center gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              className="flex-grow border-gray-300 focus:border-black focus:ring-black"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={saveEdit}
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-grow font-mono">
                              {policy.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {policy.askConfirmation
                                  ? "Ask Confirmation"
                                  : "Autonomous"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(policy.name)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePolicy(policy.name)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center text-gray-500 p-4">
                {searchTerm
                  ? "No matching policies found."
                  : "No policies defined yet."}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
