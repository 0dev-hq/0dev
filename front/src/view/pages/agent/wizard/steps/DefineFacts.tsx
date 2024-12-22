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

export default function DefineFacts({ config, updateConfig }) {
  const [newFact, setNewFact] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFact, setEditingFact] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filteredFacts = config.facts.filter((fact) =>
    fact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFact = useCallback(() => {
    const fact = newFact.trim();

    if (!fact) {
      setError("Fact cannot be empty");
      return;
    }

    if (config.facts.includes(fact)) {
      setError("This fact already exists");
      return;
    }

    updateConfig({ facts: [...config.facts, fact] });
    setNewFact("");
    setError("");
  }, [newFact, config.facts, updateConfig]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddFact();
      }
    },
    [handleAddFact]
  );

  const removeFact = useCallback(
    (factToRemove: string) => {
      updateConfig({
        facts: config.facts.filter((fact) => fact !== factToRemove),
      });
    },
    [config.facts, updateConfig]
  );

  const startEditing = useCallback((fact: string) => {
    setEditingFact(fact);
    setEditValue(fact);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingFact === null) return;

    const newFacts = config.facts.map((fact) =>
      fact === editingFact ? editValue : fact
    );
    updateConfig({ facts: newFacts });
    setEditingFact(null);
  }, [editingFact, editValue, config.facts, updateConfig]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        setEditingFact(null);
      }
    },
    [saveEdit]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingFact !== null &&
        !(event.target as Element).closest(".fact-item")
      ) {
        saveEdit();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingFact, saveEdit]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Define Facts</h2>
        <p className="mt-2 text-gray-600">
          Specify the facts and knowledge your agent should be aware of.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facts Overview</CardTitle>
          <CardDescription>
            View, edit, and manage all your facts in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFact}
              onChange={(e) => {
                setNewFact(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Add new fact..."
              className="border-gray-300 focus:border-black focus:ring-black"
            />
            <Button
              onClick={handleAddFact}
              className="bg-black hover:bg-gray-800 text-white whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Fact
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
              placeholder="Search facts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {filteredFacts.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredFacts.map((fact, index) => (
                    <motion.li
                      key={fact}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="fact-item"
                    >
                      <div className="flex items-center bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <span className="w-8 text-center text-gray-500 font-mono">
                          {index + 1}.
                        </span>
                        {editingFact === fact ? (
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
                            <span className="flex-grow font-mono">{fact}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(fact)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFact(fact)}
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
                  ? "No matching facts found."
                  : "No facts defined yet."}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
