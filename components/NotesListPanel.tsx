"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Search,
  Plus,
  X,
  Check
} from "lucide-react";
import { Note, NoteIndex } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { SidebarTrigger } from "./ui/sidebar";

interface NotesListPanelProps {
  title: string;
  noteIndexes: NoteIndex[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onCreateNote: () => void;
  getNoteById?: (id: string) => Note | undefined;
  showSearch?: boolean;
}

const NotesListPanel = ({
  title,
  noteIndexes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  onCreateNote,
  getNoteById,
  showSearch = true,
}: NotesListPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredNoteIndexes = searchQuery
    ? noteIndexes.filter((index) =>
      index.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : noteIndexes;

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false })
        .replace("about ", "")
        .replace("less than a minute", "now");
    } catch {
      return "recently";
    }
  };

  return (
    <div className="w-80 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <SidebarTrigger className="-ml-1" />
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            {showSearch && (
              <motion.button
                onClick={() => setIsSearching(!isSearching)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSearching ? (
                  <X className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Search className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border outline-none focus:border-primary text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredNoteIndexes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {searchQuery ? "No notes found" : "No notes yet"}
          </div>
        ) : (
          filteredNoteIndexes.map((noteIndex, index) => {
            const isDeleting = deletingId === noteIndex.id;

            return (
              <motion.div
                key={noteIndex.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => !isDeleting && onSelectNote(noteIndex.id)}
                className={`note-item p-4 border-b border-border cursor-pointer group transition-all relative ${activeNoteId === noteIndex.id ? "bg-primary/10 border-l-2 border-primary rounded-l-lg" : "hover:bg-muted/30"
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate mb-1">
                      {noteIndex.title || "Untitled"}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(noteIndex.updatedAt)}
                    </span>

                    {/* Actions container: only visible on hover of the row */}
                    <div className="h-7 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <AnimatePresence mode="wait">
                        {isDeleting ? (
                          <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 5 }}
                            className="flex items-center gap-1"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(noteIndex.id);
                                setDeletingId(null);
                              }}
                              className="p-1 rounded bg-destructive text-white hover:bg-destructive/90 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingId(null);
                              }}
                              className="p-1 rounded bg-muted text-foreground hover:bg-muted/80 border border-border transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="trash"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(noteIndex.id);
                            }}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add New Note Button */}
      <div className="p-4 border-t border-border">
        <motion.button
          onClick={onCreateNote}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Note</span>
        </motion.button>
      </div>
    </div>
  );
};

export default NotesListPanel;