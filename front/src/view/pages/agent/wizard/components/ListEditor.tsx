"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, AlertCircle, Search, Edit2, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, Controller } from "react-hook-form";

type ListItem = string;

interface ListEditorProps {
  title: string;
  description: string;
  items: ListItem[];
  onAddItem: (item: string) => void;
  onUpdateItem: (oldItem: ListItem, newItem: ListItem) => void;
  onRemoveItem: (item: ListItem) => void;
  itemKey?: string;
  renderItemExtra?: (item: ListItem) => React.ReactNode;
}

export default function ListEditor({
  title,
  description,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  itemKey = "name",
  renderItemExtra,
}: ListEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);

  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm({
    defaultValues: { newItem: "" },
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: { editItem: "" },
  });

  const filteredItems = items.filter((item) =>
    (typeof item === "string" ? item : item[itemKey])
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const onAddSubmit = useCallback(
    ({ newItem }: { newItem: string }) => {
      const trimmedItem = newItem.trim();
      if (!trimmedItem) return;
      if (
        items.some(
          (item) =>
            (typeof item === "string" ? item : item[itemKey]) === trimmedItem
        )
      )
        return;
      onAddItem(trimmedItem);
      resetAdd({ newItem: "" });
    },
    [items, onAddItem, resetAdd, itemKey]
  );

  const startEditing = useCallback(
    (item: ListItem) => {
      setEditingItem(item);
      resetEdit({ editItem: typeof item === "string" ? item : item[itemKey] });
    },
    [resetEdit, itemKey]
  );

  const onEditSubmit = useCallback(
    ({ editItem }: { editItem: string }) => {
      if (editingItem === null) return;
      const trimmedItem = editItem.trim();
      if (!trimmedItem) return;
      onUpdateItem(editingItem, trimmedItem);
      setEditingItem(null);
      resetEdit({ editItem: "" });
    },
    [editingItem, onUpdateItem, resetEdit]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      <div>
        <div className="space-y-4">
          <form onSubmit={handleAddSubmit(onAddSubmit)} className="flex gap-2">
            <Controller
              name="newItem"
              control={addControl}
              rules={{ required: "This field is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              )}
            />
            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {title.slice(0, -1)}
            </Button>
          </form>
          {addErrors.newItem && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{addErrors.newItem.message}</span>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-gray-300 focus:border-black focus:ring-black"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            {filteredItems.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredItems.map((item, index) => (
                    <motion.li
                      key={typeof item === "string" ? item : item[itemKey]}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="item"
                    >
                      <div className="flex items-center bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                        <span className="w-8 text-center text-gray-500 font-mono">
                          {index + 1}.
                        </span>
                        {editingItem === item ? (
                          <form
                            onSubmit={handleEditSubmit(onEditSubmit)}
                            className="flex-grow flex items-center gap-2"
                          >
                            <Controller
                              name="editItem"
                              control={editControl}
                              rules={{ required: "This field is required" }}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  className="flex-grow border-gray-300 focus:border-black focus:ring-black"
                                  autoFocus
                                />
                              )}
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </form>
                        ) : (
                          <>
                            <span className="flex-grow font-mono">
                              {typeof item === "string" ? item : item[itemKey]}
                            </span>
                            {renderItemExtra && renderItemExtra(item)}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditing(item)}
                                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveItem(item)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      {editingItem === item && editErrors.editItem && (
                        <div className="text-red-600 text-sm mt-1 ml-8">
                          {editErrors.editItem.message}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="text-center text-gray-500 p-4">
                {searchTerm
                  ? `No matching ${title.toLowerCase()} found.`
                  : `No ${title.toLowerCase()} defined yet.`}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
