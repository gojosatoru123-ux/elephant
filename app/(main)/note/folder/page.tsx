'use client';

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Trash2, FolderOpen, StickyNote, X, ArrowLeft, Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotesContext } from "@/contexts/NotesContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NoteIndex } from "@/lib/types";

// Animation Variants for the staggered list
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
};

const FolderPage = () => {
  const router = useRouter();
  const {
    isInitialized,
    folders,
    createFolder,
    deleteFolder,
    createNoteIndex,
    getNoteIndexesForFolder
  } = useNotesContext();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Filtered Folders based on Search
  const filteredFolders = useMemo(() => {
    return folders.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [folders, searchQuery]);

  // Deterministic colors based on folder ID
  const getFolderStyle = (folderId: string) => {
    const styles = [
      { bg: "bg-emerald-500/10", text: "text-emerald-500" },
      { bg: "bg-blue-500/10", text: "text-blue-500" },
      { bg: "bg-purple-500/10", text: "text-purple-500" },
      { bg: "bg-orange-500/10", text: "text-orange-500" },
      { bg: "bg-pink-500/10", text: "text-pink-500" },
    ];
    const index = folderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return styles[index % styles.length];
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const folderNotes = useMemo(() =>
    selectedFolderId ? getNoteIndexesForFolder(selectedFolderId) : [],
    [selectedFolderId, folders, getNoteIndexesForFolder]
  );

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName("");
    setShowCreateModal(false);
  };

  if (!isInitialized) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* LEFT COLUMN: Folder Sidebar */}
      <div className="w-80 h-full border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <h2 className="text-xl font-semibold">Folders</h2>
            </div>
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsSearching(!isSearching);
                  if (isSearching) setSearchQuery("");
                }}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                {isSearching ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 overflow-hidden"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search folders..."
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border outline-none focus:border-primary text-sm transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animated Folder List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={searchQuery} // THIS IS THE KEY: It resets the stagger animation when you type
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              {filteredFolders.length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-10 px-4 text-sm text-muted-foreground"
                >
                  {searchQuery ? "No matches found." : "No folders found."}
                </motion.div>
              ) : (
                filteredFolders.map((folder) => {
                  const isDeleting = deletingFolderId === folder.id;
                  const style = getFolderStyle(folder.id);
                  const isActive = selectedFolderId === folder.id;

                  return (
                    <motion.div
                      key={folder.id}
                      variants={itemVariants}
                      onClick={() => !isDeleting && setSelectedFolderId(folder.id)}
                      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? "bg-primary/10 shadow-sm" : "hover:bg-muted/50"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                        {isActive ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                          {folder.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getNoteIndexesForFolder(folder.id).length} notes
                        </p>
                      </div>

                      {/* Your existing delete logic remains here */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center pr-1">
                        <AnimatePresence mode="wait">
                          {isDeleting ? (
                            <motion.div key="confirm" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFolder(folder.id);
                                  setDeletingFolderId(null);
                                  if (isActive) setSelectedFolderId(null);
                                }}
                                className="p-1.5 rounded-md bg-destructive text-white shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingFolderId(null); }}
                                className="p-1.5 rounded-md bg-muted border border-border"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingFolderId(folder.id); }}
                              className="p-2 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FIXED CREATE BUTTON AT BOTTOM */}
        <div className="p-4 border-t border-border bg-card">
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.01, borderColor: "var(--primary)" }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">New Folder</span>
          </motion.button>
        </div>
      </div>

      {/* RIGHT CONTENT AREA: Folder Details */}
      <div className="flex-1 h-full bg-background overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedFolder ? (
            <motion.div
              key={selectedFolder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">{selectedFolder.name}</h1>
                  <p className="text-muted-foreground mt-2 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    {folderNotes.length} notes found
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const noteId = createNoteIndex(selectedFolder.id);
                    router.push(`/note/ideas/${noteId}`);
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  New Note
                </motion.button>
              </div>

              {folderNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-border rounded-4xl bg-muted/20">
                  <Folder className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">This folder is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folderNotes.map((note, idx) => (
                    <Link key={note.id} href={`/note/ideas/${note.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ y: -5, borderColor: "var(--primary)" }}
                        className="p-5 rounded-2xl border border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all"
                      >
                        <h3 className="font-semibold text-lg truncate mb-1">{note.title || "Untitled"}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(note.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-balance">
              <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <h2 className="text-2xl font-semibold">Select a collection</h2>
              <p className="text-muted-foreground max-w-sm mt-2">
                Choose a folder from the left to manage your notes or create a new category to get organized.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* CREATE FOLDER MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/40 backdrop-blur-md"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">New Folder</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Name your category..."
                className="w-full px-4 py-4 rounded-2xl bg-muted/50 border border-border outline-none mb-8 focus:ring-2 ring-primary/20 transition-all text-lg"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-border font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FolderPage;