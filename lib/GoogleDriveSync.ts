import { authClient } from "./auth-client";

export interface DriveFileMetadata {
    id: string;
    version: string;
    name: string;
}

export const GoogleDriveSync = {
    async _getAuth(): Promise<string> {
        const response = await authClient.getAccessToken({ providerId: "google" });
        const token = response.data?.accessToken;
        if (!token) throw new Error("Google Auth Required");
        return token;
    },

    /**
     * Discovery: Find files by name (e.g., 'folders-nickblake.json')
     * This replaces the need for a local registry file.
     */
    async findFileByName(name: string): Promise<DriveFileMetadata | null> {
        try {
            const token = await this._getAuth();
            const q = encodeURIComponent(`name = '${name}' and trashed = false`);
            const res = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id, name, version)`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            return data.files && data.files.length > 0 ? data.files[0] : null;
        } catch { 
            return null; 
        }
    },

    async getFileMetadata(driveId: string): Promise<DriveFileMetadata | null> {
        const token = await this._getAuth();
        const res = await fetch(
            `https://www.googleapis.com/drive/v3/files/${driveId}?fields=id,version,name`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.ok ? await res.json() : null;
    },

    async downloadFile(driveId: string): Promise<any> {
        const token = await this._getAuth();
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${driveId}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Download failed");
        return await res.json();
    },

    /**
     * Updated sync logic:
     * 1. If existingId is provided, it uses PATCH (Update).
     * 2. If no existingId, it uses POST (Create).
     * This works for both Note ID files and your Metadata files.
     */
    async syncFile(fileName: string, data: any, existingId?: string): Promise<DriveFileMetadata | null> {
        const token = await this._getAuth();
        
        // Use PATCH for updates to prevent duplicate files on Drive
        const url = existingId 
            ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`
            : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
        
        const method = existingId ? "PATCH" : "POST";
        let headers: Record<string, string> = { Authorization: `Bearer ${token}` };
        let body;

        if (existingId) {
            // Simple media upload for PATCH
            headers["Content-Type"] = "application/json";
            body = JSON.stringify(data);
        } else {
            // Multipart upload for POST (Metadata + Content)
            const boundary = "sync_boundary_amber";
            headers["Content-Type"] = `multipart/related; boundary=${boundary}`;
            const metadata = { name: fileName, mimeType: "application/json" };
            body = `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${boundary}--`;
        }

        const res = await fetch(url, { method, headers, body });
        const result = await res.json();
        
        // We fetch the full metadata immediately to get the latest 'version' tag
        return await this.getFileMetadata(result.id);
    },

    async deleteFile(driveId: string): Promise<void> {
        const token = await this._getAuth();
        await fetch(`https://www.googleapis.com/drive/v3/files/${driveId}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        });
    }
};