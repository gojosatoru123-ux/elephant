import { Folder, NoteBlock, NoteIndex } from "./types";
import { GoogleDriveSync, DriveFileMetadata } from "./GoogleDriveSync";

const INDEXES_FILE = "note-indexes-nickblake.json";
const FOLDERS_FILE = "folders-nickblake.json";
const NOTES_DIR = "notes";

export type SyncStatus = "synced" | "syncing" | "error" | "offline";
let statusListener: ((status: SyncStatus) => void) | null = null;

// Temporary in-memory cache for this session's Drive IDs
const driveIdCache: Record<string, string> = {};
const saveTimeouts: Record<string, any> = {};

const getRoot = () => navigator.storage.getDirectory();

export const StorageEngine = {
    onStatusChange(callback: (status: SyncStatus) => void) {
        statusListener = callback;
    },

    _updateStatus(status: SyncStatus) {
        if (statusListener) statusListener(status);
    },

    async init() {
        if (navigator.onLine) {
            this._updateStatus("syncing");
            // Discovery-based boot: Look for metadata files directly on Drive
            await this.bootstrapMetadata();
            this._updateStatus("synced");
        } else {
            this._updateStatus("offline");
        }
    },

    async bootstrapMetadata() {
        const metaFiles = [INDEXES_FILE, FOLDERS_FILE];
        for (const fileName of metaFiles) {
            const cloudFile = await GoogleDriveSync.findFileByName(fileName);
            if (cloudFile) {
                driveIdCache[fileName] = cloudFile.id;
                const data = await GoogleDriveSync.downloadFile(cloudFile.id);
                await this._saveToLocal(fileName, data, false);
            }
        }
    },

    async loadWithCloudSync<T>(id: string, onConflict: (id: string) => void): Promise<T> {
        const isNote = !id.includes('nickblake');
        const driveName = isNote ? `${id}.json` : id;

        if (navigator.onLine) {
            this._updateStatus("syncing");
            try {
                // Discover file ID if not in cache
                let driveId = driveIdCache[id];
                if (!driveId) {
                    const found = await GoogleDriveSync.findFileByName(driveName);
                    if (found) {
                        driveId = found.id;
                        driveIdCache[id] = driveId;
                    }
                }

                if (driveId) {
                    const cloudData = await GoogleDriveSync.downloadFile(driveId);
                    await this._saveToLocal(id, cloudData, isNote);
                    this._updateStatus("synced");
                    return cloudData as T;
                }
            } catch { this._updateStatus("error"); }
        }

        this._updateStatus("synced");
        if (id === FOLDERS_FILE) return (await this.loadFolders()) as T;
        if (id === INDEXES_FILE) return (await this.loadIndexes()) as T;
        return (await this.loadNoteBlocks(id)) as T;
    },

    async _performWrite(fileName: string, data: any, isNote: boolean) {
        await this._saveToLocal(fileName, data, isNote);
        if (!navigator.onLine) {
            this._updateStatus("offline");
            return;
        }

        this._updateStatus("syncing");
        const driveName = isNote ? `${fileName}.json` : fileName;

        try {
            // Check cache or Discover on Drive to avoid duplicates
            let driveId = driveIdCache[fileName];
            if (!driveId) {
                const found = await GoogleDriveSync.findFileByName(driveName);
                if (found) driveId = found.id;
            }

            const result = await GoogleDriveSync.syncFile(driveName, data, driveId);
            if (result) {
                driveIdCache[fileName] = result.id;
                this._updateStatus("synced");
            }
        } catch (error) {
            console.error("Sync failed:", error);
            this._updateStatus("error");
        }
    },

    // UI features & Debouncing preserved
    _writeFile(fileName: string, data: any, isNote: boolean = false) {
        if (saveTimeouts[fileName]) clearTimeout(saveTimeouts[fileName]);
        saveTimeouts[fileName] = setTimeout(() => {
            this._performWrite(fileName, data, isNote);
            delete saveTimeouts[fileName];
        }, 800);
    },

    async _saveToLocal(fileName: string, data: any, isNote: boolean) {
        const root = await getRoot();
        let dir = root;
        if (isNote) dir = await root.getDirectoryHandle(NOTES_DIR, { create: true });
        const finalName = isNote && !fileName.endsWith('.json') ? `${fileName}.json` : fileName;
        const handle = await dir.getFileHandle(finalName, { create: true });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data));
        await writable.close();
    },

    async deleteNoteFile(id: string): Promise<void> {
        this._updateStatus("syncing");
        try {
            const root = await getRoot();
            const dir = await root.getDirectoryHandle(NOTES_DIR);
            await dir.removeEntry(`${id}.json`);
            
            const driveName = `${id}.json`;
            const found = await GoogleDriveSync.findFileByName(driveName);
            if (found) await GoogleDriveSync.deleteFile(found.id);
            
            delete driveIdCache[id];
            this._updateStatus("synced");
        } catch (e) { this._updateStatus("error"); }
    },

    saveIndexesDebounced(indexes: NoteIndex[]) { this._writeFile(INDEXES_FILE, indexes, false); },
    saveFoldersDebounced(folders: Folder[]) { this._writeFile(FOLDERS_FILE, folders, false); },
    saveNoteBlocksDebounced(id: string, blocks: NoteBlock[]) { this._writeFile(id, blocks, true); },

    async loadIndexes(): Promise<NoteIndex[]> {
        try {
            const root = await getRoot();
            const handle = await root.getFileHandle(INDEXES_FILE);
            return JSON.parse(await (await handle.getFile()).text());
        } catch { return []; }
    },

    async loadFolders(): Promise<Folder[]> {
        try {
            const root = await getRoot();
            const handle = await root.getFileHandle(FOLDERS_FILE);
            return JSON.parse(await (await handle.getFile()).text());
        } catch { return []; }
    },

    async loadNoteBlocks(id: string): Promise<NoteBlock[]> {
        try {
            const root = await getRoot();
            const dir = await root.getDirectoryHandle(NOTES_DIR);
            const handle = await dir.getFileHandle(`${id}.json`);
            return JSON.parse(await (await handle.getFile()).text());
        } catch { return [{ id: crypto.randomUUID(), type: "text", content: "" }]; }
    },

    // Kept for API compatibility, though logic is now Discovery-based
    async syncDirtyFiles() {} 
};