import { useState, useCallback } from "react";
import { useVault } from "@/context/VaultContext";
import { DocumentCategory, CATEGORY_INFO } from "@/types/vault";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileUp, CheckCircle2, Lock, Hash, Cloud, LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = ["Encrypting document...", "Generating SHA-256 hash...", "Storing in distributed cloud...", "Recording on blockchain..."];

const UploadPage = () => {
  const { addDocument } = useVault();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("ids");
  const [isShared, setIsShared] = useState(false);
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<"form" | "processing" | "success">("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<{ hash: string; timestamp: string } | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileName(e.target.files[0].name);
  }, []);

  const handleSubmit = () => {
    if (!name) return;
    setPhase("processing");
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= STEPS.length) {
        clearInterval(interval);
        const doc = addDocument(name, category, isShared ? "shared" : "private", fileName ? "PDF" : "Text", "1.2 MB");
        setResult({ hash: doc.hash, timestamp: doc.timestamp });
        setPhase("success");
      } else {
        setCurrentStep(step);
      }
    }, 900);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Document</h1>
        <p className="mt-1 text-muted-foreground">Securely encrypt and store your document with blockchain verification</p>
      </div>

      <AnimatePresence mode="wait">
        {phase === "form" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/50 p-8 text-center">
                  <Upload className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="mb-2 text-sm font-medium">Drag & drop your file here, or click to browse</p>
                  <Input type="file" className="mx-auto max-w-xs" onChange={handleFileChange} accept=".pdf,.jpg,.png,.txt" />
                  {fileName && <Badge variant="secondary" className="mt-3"><FileUp className="mr-1 h-3 w-3" />{fileName}</Badge>}
                </div>
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Passport - John" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={v => setCategory(v as DocumentCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CATEGORY_INFO) as DocumentCategory[]).map(c => (
                        <SelectItem key={c} value={c}>{CATEGORY_INFO[c].icon} {CATEGORY_INFO[c].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div>
                    <p className="text-sm font-medium">Share with Family</p>
                    <p className="text-xs text-muted-foreground">Make visible to family members</p>
                  </div>
                  <Switch checked={isShared} onCheckedChange={setIsShared} />
                </div>
                <Button onClick={handleSubmit} size="lg" className="w-full gap-2" disabled={!name}>
                  <Lock className="h-4 w-4" /> Encrypt & Store Securely
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "processing" && (
          <motion.div key="proc" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="space-y-6 p-8">
                <div className="text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold">Securing Your Document</h2>
                </div>
                <div className="space-y-3">
                  {STEPS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                      {i <= currentStep ? <CheckCircle2 className="h-5 w-5 text-accent" /> : <div className="h-5 w-5 rounded-full border-2 border-muted" />}
                      <span className={`text-sm ${i <= currentStep ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {phase === "success" && result && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-accent/30">
              <CardContent className="space-y-6 p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">Document Secured!</h2>
                  <p className="mt-1 text-muted-foreground">Your document has been encrypted and stored on the blockchain</p>
                </div>
                <div className="space-y-3 rounded-lg bg-muted p-4 text-left text-sm">
                  <div className="flex items-start gap-2">
                    <Hash className="mt-0.5 h-4 w-4 text-primary" />
                    <div><p className="font-medium">Document Hash</p><p className="break-all font-mono text-xs text-muted-foreground">{result.hash}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Cloud className="mt-0.5 h-4 w-4 text-primary" />
                    <div><p className="font-medium">Distributed Storage</p><p className="text-xs text-muted-foreground">Encrypted across 3 cloud nodes</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <LinkIcon className="mt-0.5 h-4 w-4 text-primary" />
                    <div><p className="font-medium">Blockchain Verified</p><p className="text-xs text-muted-foreground">{new Date(result.timestamp).toLocaleString()}</p></div>
                  </div>
                </div>
                <Badge className="bg-accent text-accent-foreground">🛡️ Tamper-Proof Storage Active</Badge>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setPhase("form"); setName(""); setFileName(""); setCurrentStep(0); }}>Upload Another</Button>
                  <Button className="flex-1" onClick={() => navigate("/documents")}>View Documents</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
