import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { CATEGORY_INFO, DocumentCategory, VaultDocument } from "@/types/vault";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Shield, Hash, Cloud, Clock, Share2, Download, CheckCircle2, Server } from "lucide-react";
import { format } from "date-fns";

const DocumentsPage = () => {
  const { documents, members, userRole } = useVault();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>(searchParams.get("category") || "all");
  const [selected, setSelected] = useState<VaultDocument | null>(null);

  const visibleDocs = userRole === "member"
    ? documents.filter(d => d.privacy === "shared")
    : documents;

  const filtered = filter === "all" ? visibleDocs : visibleDocs.filter(d => d.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="mt-1 text-muted-foreground">{filtered.length} document{filtered.length !== 1 ? "s" : ""} stored securely</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(CATEGORY_INFO) as DocumentCategory[]).map(c => (
              <SelectItem key={c} value={c}>{CATEGORY_INFO[c].icon} {CATEGORY_INFO[c].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((doc, i) => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelected(doc)}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-2xl">{CATEGORY_INFO[doc.category].icon}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="gap-1 border-accent/40 text-accent"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                    </TooltipTrigger>
                    <TooltipContent>Blockchain integrity verified ✅</TooltipContent>
                  </Tooltip>
                </div>
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{CATEGORY_INFO[doc.category].label} · {doc.fileType}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={doc.privacy === "shared" ? "default" : "secondary"} className="text-[11px]">{doc.privacy === "shared" ? "👨‍👩‍👧‍👦 Shared" : "🔒 Private"}</Badge>
                  <span className="text-[11px] text-muted-foreground">{format(new Date(doc.timestamp), "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{CATEGORY_INFO[selected.category].icon}</span>
                {selected.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={selected.privacy === "shared" ? "default" : "secondary"}>{selected.privacy === "shared" ? "👨‍👩‍👧‍👦 Family Shared" : "🔒 Private"}</Badge>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="gap-1 bg-accent text-accent-foreground"><Shield className="h-3 w-3" /> Tamper-Proof Storage</Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">Any change to this document will be detected. The hash is permanently recorded on the blockchain.</TooltipContent>
                </Tooltip>
              </div>

              <div className="space-y-3 rounded-lg bg-muted p-4 text-sm">
                <div className="flex items-start gap-2">
                  <Hash className="mt-0.5 h-4 w-4 text-primary" />
                  <div><p className="font-medium">SHA-256 Hash</p><p className="break-all font-mono text-[11px] text-muted-foreground">{selected.hash}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                  <div><p className="font-medium">Stored</p><p className="text-xs text-muted-foreground">{format(new Date(selected.timestamp), "PPpp")}</p></div>
                </div>
              </div>

              {/* Distributed storage visual */}
              <div className="rounded-lg border p-4">
                <p className="mb-3 text-sm font-medium">☁️ Distributed Storage</p>
                <div className="flex items-center justify-between gap-2">
                  {["Node A (US-East)", "Node B (EU-West)", "Node C (AP-South)"].map((node, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center rounded-lg bg-muted p-3">
                      <Server className="mb-1 h-5 w-5 text-primary" />
                      <span className="text-[10px] text-muted-foreground text-center">{node}</span>
                      <Badge variant="outline" className="mt-1 text-[10px]">Active</Badge>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">Your document is safe even if your device is lost.</p>
              </div>

              {userRole === "owner" && (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1" onClick={() => { setSelected(null); navigate("/sharing"); }}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  <Button variant="outline" className="flex-1 gap-1">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              )}

              {selected.accessLog.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Access Log</p>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {selected.accessLog.map(l => (
                      <div key={l.id} className="flex justify-between text-xs text-muted-foreground">
                        <span>{l.userName}: {l.action}</span>
                        <span>{format(new Date(l.timestamp), "MMM d, HH:mm")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
