"use client";

import { useEffect, useState } from "react";
import { StorageEngine, SyncStatus } from "@/lib/storage-engine";
import { CloudCheck, CloudUpload, CloudAlert, CloudOff } from "lucide-react";
import { cn } from "@/lib/utils";

export const SyncStatusIndicator = () => {
    const [status, setStatus] = useState<SyncStatus>("synced");

    useEffect(() => {
        // Register the listener to the engine
        StorageEngine.onStatusChange((newStatus) => setStatus(newStatus));
    }, []);

    const config = {
        synced: { 
            icon: CloudCheck, 
            text: "All changes saved", 
            color: "text-green-600 dark:text-green-400" 
        },
        syncing: { 
            icon: CloudUpload, 
            text: "Syncing to Drive...", 
            color: "text-blue-600 dark:text-blue-400 animate-pulse" 
        },
        error: { 
            icon: CloudAlert, 
            text: "Sync failed", 
            color: "text-red-600 dark:text-red-400" 
        },
        offline: { 
            icon: CloudOff, 
            text: "Working offline", 
            color: "text-slate-500" 
        },
    };

    const active = config[status];
    const Icon = active.icon;

    return (
        <div className="flex items-center gap-2 px-3 py-2 mt-auto">
            <Icon className={cn("h-4 w-4 shrink-0", active.color)} />
            <span className={cn("text-[11px] font-medium truncate", active.color)}>
                {active.text}
            </span>
        </div>
    );
};