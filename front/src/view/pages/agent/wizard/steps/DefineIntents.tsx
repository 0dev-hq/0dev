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

export default function DefineIntents({ config, updateConfig }) {
  const [newIntent, setNewIntent] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIntent, setEditingIntent] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredIntents = config.intents.filter((intent) =>
    intent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIntent = useCallback(() => {
    const intent = newIntent.trim();

    if (!intent) {
      setError("Intent cannot be empty");
      return;
    }

    if (config.intents.includes(intent)) {
      setError("This intent already exists");
      return;
    }

    updateConfig({ intents: [...config.intents, intent] });
    setNewIntent("");
    setError("");
  }, [newIntent, config.intents, updateConfig]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddIntent();
      }
    },
    [handleAddIntent]
  );

  const removeIntent = useCallback(
    (intentToRemove: string) => {
      updateConfig({
        intents: config.intents.filter((intent) => intent !== intentToRemove),
      });
    },
    [config.intents, updateConfig]
  );

  const startEditing = useCallback((intent: string) => {
    setEditingIntent(intent);
    setEditValue(intent);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingIntent === null) return;

    const newIntents = config.intents.map((intent) =>
      intent === editingIntent ? editValue : intent
    );
    updateConfig({ intents: newIntents });
    setEditingIntent(null);
  }, [editingIntent, editValue, config.intents, updateConfig]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        setEditingIntent(null);
      }
    },
    [saveEdit]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingIntent !== null &&
        !(event.target as Element).closest(".intent-item")
      ) {
        saveEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingIntent, saveEdit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Define Intents</h2>
        <p className="mt-2 text-gray-600">
          Specify the tasks and behaviors your agent should handle.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Intents Overview</CardTitle>
          <CardDescription>
            View, edit, and manage all your intents in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newIntent}
              onChange={(e) => {
                setNewIntent(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Add new intent..."
              className="border-gray-300 focus:border-black focus:ring-black"
            />
            <Button
              onClick={handleAddIntent}
              className="bg-black hover:bg-gray-800 text-white whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Intent
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
              placeholder="Search intents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {filteredIntents.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredIntents.map((intent, index) => (
                    <motion.li
                      key={intent}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="intent-item"
                    >
                      <div className="flex items-center bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <span className="w-8 text-center text-gray-500 font-mono">
                          {index + 1}.
                        </span>
                        {editingIntent === intent ? (
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
                              {intent}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(intent)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIntent(intent)}
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
                  ? "No matching intents found."
                  : "No intents defined yet."}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
