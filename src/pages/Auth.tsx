import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Phone, Chrome, ArrowLeft, Smartphone } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthView = "hub" | "email" | "phone" | "phone-verify";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AuthView>("hub");
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  // Email auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Phone auth
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return toast.error("Please fill all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    
    setLoading(true);
    try {
      if (authTab === "signup") {
        if (!name.trim()) return toast.error("Please enter your name");
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();
    if (cleanPhone.length < 10) return toast.error("Enter a valid phone number");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone });
      if (error) throw error;
      setView("phone-verify");
      toast.success("OTP sent to your phone!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ 
        phone: phone.trim(), 
        token: otp, 
        type: "sms" 
      });
      if (error) throw error;
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auth Hub Screen
  if (view === "hub") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-foreground">🍛 Campus Canteen</h1>
            <p className="mt-1 text-sm text-muted-foreground">Order food. Skip the queue.</p>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full h-12 text-sm font-semibold" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-12 text-sm font-semibold"
              onClick={() => setView("phone")}
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Continue with Phone OTP
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-12 text-sm font-semibold"
              onClick={() => setView("email")}
            >
              <Mail className="mr-2 h-5 w-5" />
              Continue with Email
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    );
  }

  // Phone OTP - Enter Number
  if (view === "phone") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <button onClick={() => setView("hub")} className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Phone Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">We'll send a 6-digit OTP to your number</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                type="tel"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+91 9876543210"
                className="h-12 text-base"
              />
            </div>
            <Button 
              className="w-full h-12" 
              onClick={handleSendOtp} 
              disabled={loading || phone.trim().length < 10}
            >
              <Phone className="mr-2 h-4 w-4" />
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Phone OTP - Verify
  if (view === "phone-verify") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <button onClick={() => setView("phone")} className="flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Verify OTP</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code sent to {phone}</p>
          </div>

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

          <Button 
            className="w-full h-12" 
            onClick={handleVerifyOtp} 
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </Button>

          <button 
            onClick={handleSendOtp} 
            className="w-full text-center text-sm text-muted-foreground underline"
            disabled={loading}
          >
            Resend OTP
          </button>
        </div>
      </div>
    );
  }

  // Email Auth
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={() => setView("hub")} className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-foreground">🍛 Campus Canteen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Order food. Skip the queue.</p>
        </div>

        <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 pt-4">
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required className="h-12" />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12" disabled={loading}>
                <Mail className="mr-2 h-4 w-4" /> {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 pt-4">
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-12" />
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" required className="h-12" />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12" disabled={loading}>
                <Mail className="mr-2 h-4 w-4" /> {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
