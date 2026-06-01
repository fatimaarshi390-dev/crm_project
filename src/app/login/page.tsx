"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PasskeyLoginButton from "../component/PasskeyLoginButton";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Login() {
      const router = useRouter();
      const [showLogin, setShowLogin] = useState(false);
    const [employeeId, setEmployeeId] = useState<string>("")
    const [password, setpassword] = useState<string>("")
    useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
    async function handlesubmit() {
        const res=await fetch("/api/login",{
            method:"POST",
            body:JSON.stringify({
                employeeId,
                password
            }),
        });
        const data=await res.json()
        if(data.success)
        {
            toast("Login Done")
            router.push('/post-welcome');
        }
        else{
            toast("something went wrong")
        }
    }
    if (!showLogin) {
    return (
      <div className="min-h-screen bg-[#e9edf2] flex items-center justify-center px-6">
  <div className="text-center">
    
    {/* Main Heading */}
    <h1
      className="
        text-[#23439b]
        font-extrabold
        uppercase
        leading-tight
        tracking-wide
        text-5xl
        sm:text-6xl
        md:text-7xl
      "
      style={{
        fontFamily: "'Orbitron', sans-serif",
      }}
    >
      Customer
      <br />
      Relationship
      <br />
      Management
      <br />
      Digital System
    </h1>

    {/* Subtitle */}
    <p
      className="
        mt-10
        text-gray-500
        text-base
        sm:text-lg
        tracking-wide
      "
    >
      Next-Generation CRM Engineered for Excellence
    </p>
  </div>
</div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Secure Login</CardTitle>
          <CardDescription>
                Access the Future of Customer Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="employeeId">Employee ID</Label>
<Input
  id="employeeId"
  placeholder="EMP001"
  value={employeeId}
  onChange={(e) => setEmployeeId(e.target.value)}
  required
/>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" 
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e)=>setpassword(e.target.value)} 
                required />
              </div>
            </div>
          </form>
          <br></br>
           <PasskeyLoginButton />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={handlesubmit} className="w-full bg-orange-400 hover:bg-orange-500">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
