'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Fingerprint, Loader2 } from 'lucide-react';

export default function PasskeyLoginButton() {
  const [loading, setLoading] = useState(false);

  const loginWithPasskey = async () => {
    setLoading(true);
    try {
      const challengeRes = await fetch('/api/auth/passkey/challenges');
      const { challenge } = await challengeRes.json();

      if (!challenge) {
        toast.error("Failed to start login");
        return;
      }

      const publicKeyRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
        timeout: 60000,
        userVerification: 'required',
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyRequestOptions,
      }) as PublicKeyCredential;

      const credentialID = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));

      const loginRes = await fetch('/api/auth/passkey/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialID }),
      });

      const data = await loginRes.json();

      if (data.success) {
        toast.success("✅ Fingerprint Login Successful!");
        window.location.href = '/post-welcome';   // Dashboard
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Biometric login failed or cancelled");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={loginWithPasskey}
      disabled={loading}
      className="w-full h-12 text-base font-medium flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Verifying Fingerprint...
        </>
      ) : (
        <>
          <Fingerprint className="w-5 h-5" />
          Login with Fingerprint
        </>
      )}
    </Button>
  );
}