"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth, useUser } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RefreshCcw, Lock, Mail, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  React.useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    initiateEmailSignIn(auth, email, password)
    toast({ title: "Authenticating", description: "Checking credentials..." })
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    initiateEmailSignUp(auth, email, password)
    toast({ title: "Creating Account", description: "Setting up your HR portal..." })
  }

  const handleGuestSignIn = () => {
    initiateAnonymousSignIn(auth)
    toast({ title: "Guest Access", description: "Entering portal as temporary admin..." })
  }

  if (isUserLoading) return null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 rounded-lg p-2 shadow-lg shadow-blue-500/20">
          <RefreshCcw className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RenderHRMS</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Secure Admin Gateway</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <Tabs defaultValue="login">
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <TabsContent value="login">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@company.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Lock className="h-4 w-4 mr-2" /> Sign In
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div>
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleGuestSignIn}>
                  Try as Guest
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" /> Create Portal
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      <p className="mt-8 text-xs text-slate-400 font-medium">
        &copy; 2026 RenderHRMS. Optimized for Cloud Availability.
      </p>
    </div>
  )
}
