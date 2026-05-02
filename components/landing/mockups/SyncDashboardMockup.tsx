'use client'
import { motion } from "framer-motion";
import { HardDrive, Zap, Shield, CheckCircle2, FileText, FolderOpen, Lock } from "lucide-react";

const localFiles = [
    { name: "Project Ideas.md", size: "24 KB", saved: true, time: "Just now" },
    { name: "Weekly Journal", size: "156 KB", saved: true, time: "2 min ago" },
    { name: "Brainstorming.md", size: "89 KB", saved: true, time: "12 min ago" },
    { name: "Client Proposal", size: "34 KB", saved: true, time: "Instant" },
];

const SyncDashboardMockup = () => (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border/30 bg-accent/10 px-4 py-3">
            <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-accent-foreground" />
                <span className="text-xs font-semibold text-foreground">Device Health</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[hsl(var(--green-badge))]/15 px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--green-badge))]" />
                <span className="text-[10px] font-medium text-[hsl(var(--green-badge))]">Local Storage: Active</span>
            </div>
        </div>

        <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
                {[
                    { icon: FileText, label: "Total Notes", value: "142", color: "bg-[hsl(var(--green-light))] text-[hsl(var(--green-badge))]" },
                    { icon: FolderOpen, label: "Collections", value: "23", color: "bg-[hsl(var(--yellow-light))] text-accent-foreground" },
                    { icon: Lock, label: "Private", value: "100%", color: "bg-[hsl(var(--peach-bg))] text-foreground" },
                ].map((stat, i) => (
                    <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }} whileHover={{ scale: 1.05 }}
                        className={`rounded-xl ${stat.color} p-3 text-center transition-shadow hover:shadow-md cursor-default`}>
                        <stat.icon className="h-4 w-4 mx-auto mb-1" />
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[9px] opacity-70">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-medium text-foreground">Storage Health</span>
                    <span className="text-[10px] text-[hsl(var(--green-badge))] font-semibold">Perfect</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ background: "linear-gradient(to right, hsl(var(--green-badge)), hsl(var(--green-badge) / 0.7))" }} />
                </div>
            </div>

            <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-2">Instant Save Activity</p>
                <div className="space-y-1.5">
                    {localFiles.map((file, i) => (
                        <motion.div key={file.name} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 + i * 0.1 }} whileHover={{ x: 2 }}
                            className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 transition-colors hover:bg-secondary cursor-default">
                            <div className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                <div>
                                    <p className="text-[10px] font-medium text-foreground">{file.name}</p>
                                    <p className="text-[8px] text-muted-foreground">{file.size}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3 text-[hsl(var(--green-badge))]" />
                                <span className="text-[8px] text-muted-foreground">{file.time}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--green-badge))]/10 p-3 border border-[hsl(var(--green-badge))]/15">
                <Zap className="h-4 w-4 text-[hsl(var(--green-badge))]" />
                <div>
                    <p className="text-[10px] font-semibold text-[hsl(var(--green-badge))]">0ms Latency Mode</p>
                    <p className="text-[8px] text-muted-foreground">Every interaction is handled instantly on your local hardware</p>
                </div>
            </motion.div>
        </div>
    </motion.div>
);

export default SyncDashboardMockup;