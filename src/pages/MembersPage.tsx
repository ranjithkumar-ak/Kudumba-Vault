import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users, Plus, Trash2, FileText } from "lucide-react";

const MembersPage = () => {
  const { members, documents, addMember, removeMember } = useVault();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Spouse");

  const handleAdd = () => {
    if (!name || !email) return;
    addMember(name, email, relationship);
    toast({ title: "Member added!", description: `${name} has been added to your family vault.` });
    setOpen(false);
    setName("");
    setEmail("");
  };

  const handleRemove = (id: string, memberName: string) => {
    removeMember(id);
    toast({ title: "Member removed", description: `${memberName} has been removed from the vault.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Family Members</h1>
          <p className="mt-1 text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""} in your vault</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Family Member</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Johnson" /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@family.com" /></div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Spouse", "Son", "Daughter", "Parent", "Sibling", "Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={!name || !email}>Add to Family Vault</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map(m => {
          const accessibleDocs = documents.filter(d => d.sharedWith.some(s => s.memberId === m.id && !s.revoked));
          return (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary/10 text-primary font-semibold">{m.avatarInitials}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemove(m.id, m.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="secondary">{m.relationship}</Badge>
                  <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" />{accessibleDocs.length} doc{accessibleDocs.length !== 1 ? "s" : ""}</Badge>
                </div>
                {accessibleDocs.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Accessible Documents:</p>
                    {accessibleDocs.map(d => (
                      <p key={d.id} className="text-xs text-muted-foreground">• {d.name}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MembersPage;
