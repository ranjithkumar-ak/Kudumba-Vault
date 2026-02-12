import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { UserRole } from "@/types/vault";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Users } from "lucide-react";

const LoginPage = () => {
  const { login } = useVault();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [role, setRole] = useState<UserRole>("owner");
  const [email, setEmail] = useState("john@family.com");
  const [password, setPassword] = useState("••••••••");
  const [otp, setOtp] = useState("");

  const handleLogin = () => {
    if (step === "credentials") {
      setStep("otp");
    } else {
      login(role);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Shield className="h-8 w-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">Family Vault</h1>
          <p className="mt-2 text-muted-foreground">Blockchain-secured document & credential vault</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{step === "credentials" ? "Welcome Back" : "Verify Identity"}</CardTitle>
            <CardDescription>{step === "credentials" ? "Sign in to access your family vault" : "Enter the OTP sent to your device"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <AnimatePresence mode="wait">
              {step === "credentials" ? (
                <motion.div key="cred" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <div className="flex gap-2 rounded-lg bg-muted p-1">
                    <button onClick={() => setRole("owner")} className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${role === "owner" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      <Lock className="mr-1.5 inline h-3.5 w-3.5" /> Family Owner
                    </button>
                    <button onClick={() => setRole("member")} className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${role === "member" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      <Users className="mr-1.5 inline h-3.5 w-3.5" /> Family Member
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@family.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <p className="text-sm text-muted-foreground">A 6-digit code has been sent to your registered device. Enter any code to proceed.</p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <Button onClick={handleLogin} className="w-full" size="lg" disabled={step === "otp" && otp.length < 6}>
              {step === "credentials" ? "Continue" : "Verify & Sign In"}
            </Button>
            {step === "otp" && (
              <Button variant="ghost" className="w-full" onClick={() => setStep("credentials")}>Back to login</Button>
            )}
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">🔒 End-to-end encrypted · 🔗 Blockchain verified · ☁️ Distributed storage</p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
