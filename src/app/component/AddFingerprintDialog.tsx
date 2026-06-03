'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Fingerprint } from 'lucide-react';

export default function AddFingerprintDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerPasskey = async () => {
    setLoading(true);
    try {
      // 1. Get challenge from server (you can make a GET API for this)
      const res = await fetch('/api/auth/passkey/challenge');
      const { challenge, userId } = await res.json();

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(atob(challenge), (c) => c.charCodeAt(0)),
        rp: { name: "Your CRM", id: window.location.hostname },
       user: {
          id: Uint8Array.from(userId, (c:string) => c.charCodeAt(0)),
          name: "user@example.com",        // Better to use real email
          displayName: "User",
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      const credentialID = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const publicKeyBuffer = (credential.response as AuthenticatorAttestationResponse).attestationObject;
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

      // Send to backend
      const registerRes = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialID, publicKey, deviceName: navigator.userAgent }),
      });

      if (registerRes.ok) {
        toast.success("✅ Fingerprint / Passkey Registered Successfully!");
        setOpen(false);
      } else {
        toast.error("Registration failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Biometric not supported or cancelled");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4" />
          Add Fingerprint 
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Fingerprint / Passkey</DialogTitle>
          <DialogDescription>
            Use your device's biometric (Fingerprint / Face ID / Windows Hello)
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 text-center">
          <Button onClick={registerPasskey} disabled={loading} size="lg" className="w-full">
            {loading ? "Registering..." : "Register Now"}
          </Button>
          <p className="text-xs text-gray-500 mt-3">
            This will replace password login with biometric
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}