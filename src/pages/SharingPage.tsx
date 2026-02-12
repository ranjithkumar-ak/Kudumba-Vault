import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { CATEGORY_INFO } from "@/types/vault";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Share2, Eye, Clock, XCircle } from "lucide-react";

const SharingPage = () => {
  const { documents, members, shareDocument, revokeAccess } = useVault();
  const [selectedDoc, setSelectedDoc] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [permission, setPermission] = useState<"view-only" | "time-limited">("view-only");

  const handleShare = () => {
    if (!selectedDoc || !selectedMember) return;
    const expires = permission === "time-limited" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;
    shareDocument(selectedDoc, selectedMember, permission, expires);
    toast({ title: "Document shared!", description: "Family member can now access this document." });
    setSelectedDoc("");
    setSelectedMember("");
  };

  const handleRevoke = (docId: string, memberId: string) => {
    revokeAccess(docId, memberId);
    toast({ title: "Access revoked", description: "Family member can no longer access this document." });
  };

  const sharedDocs = documents.filter(d => d.sharedWith.some(s => !s.revoked));

  const allLogs = documents.flatMap(d => d.accessLog.map(l => ({ ...l, docName: d.name }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Family Sharing</h1>
        <p className="mt-1 text-muted-foreground">Share documents securely with family members</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Share a Document</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select value={selectedDoc} onValueChange={setSelectedDoc}>
              <SelectTrigger><SelectValue placeholder="Select document" /></SelectTrigger>
              <SelectContent>
                {documents.map(d => <SelectItem key={d.id} value={d.id}>{CATEGORY_INFO[d.category].icon} {d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
              <SelectContent>
                {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.relationship})</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={permission} onValueChange={v => setPermission(v as "view-only" | "time-limited")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="view-only"><Eye className="mr-1 inline h-3 w-3" /> View-only</SelectItem>
                <SelectItem value="time-limited"><Clock className="mr-1 inline h-3 w-3" /> Time-limited (30 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleShare} disabled={!selectedDoc || !selectedMember} className="gap-2">
            <Share2 className="h-4 w-4" /> Share Document
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Currently Shared Documents</CardTitle></CardHeader>
        <CardContent>
          {sharedDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents are currently shared.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Shared With</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedDocs.flatMap(d => d.sharedWith.filter(s => !s.revoked).map(s => {
                  const member = members.find(m => m.id === s.memberId);
                  return (
                    <TableRow key={`${d.id}-${s.memberId}`}>
                      <TableCell className="font-medium">{CATEGORY_INFO[d.category].icon} {d.name}</TableCell>
                      <TableCell>{member?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          {s.permission === "view-only" ? <><Eye className="h-3 w-3" /> View-only</> : <><Clock className="h-3 w-3" /> Time-limited</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(s.grantedAt), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleRevoke(d.id, s.memberId)} className="gap-1 text-destructive hover:text-destructive">
                          <XCircle className="h-3 w-3" /> Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Access Log</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLogs.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.userName}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{l.docName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(l.timestamp), "MMM d, HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharingPage;
