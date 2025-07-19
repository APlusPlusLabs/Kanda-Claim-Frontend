"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"
import { useLanguage } from "@/lib/language-context"
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";

export default function CancelAccountPage() {
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage();
  const { toast } = useToast()
  const { apiRequest } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isCanceled, setIsCanceled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string>("")

  // Get token from URL params
  useEffect(() => {
    if (params?.token) {
      setUserToken(params.token as string)
    }
  }, [params])

  async function handleCancelAccount() {
    if (!userToken) {
      setError("Invalid cancellation link. Please check your email for the correct link.")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await apiRequest(`${API_URL}users/cancel-account/${userToken}`, "POST", {})
      
      setIsCanceled(true)
      
      toast({
        title: "Account Canceled Successfully",
        description: "Your account has been canceled and deactivated.",
      })
      
      // Clear any existing session data
      sessionStorage.removeItem("ottqen");
      sessionStorage.removeItem("sessuza");
      sessionStorage.removeItem("tenetIed");
      
    } catch (error: any) {
      const errorMessage = error?.message || "There was an error canceling your account. Please try again or contact support."
      setError(errorMessage)
      
      toast({
        variant: "destructive",
        title: "Failed to Cancel Account",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoToLogin() {
    router.push("/login")
  }

  function handleGoHome() {
    router.push("/")
  }

  if (isCanceled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Canceled</CardTitle>
            <CardDescription>
              Your account has been successfully canceled and deactivated.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your account is now INACTIVE. You can still reactivate it by logging in again if you change your mind.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button onClick={handleGoToLogin} className="w-full">
              Go to Login
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {error ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">Cancel Account</CardTitle>
          <CardDescription>
            {error 
              ? "There was an error with your cancellation request"
              : "Are you sure you want to cancel your account?"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This will deactivate your account. You can reactivate it by logging in again.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p>When you cancel your account:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Your account will be deactivated immediately</li>
                  <li>You will be logged out of all devices</li>
                  {/* <li>Your data will be preserved and can be restored if you log in again</li>
                  <li>You can reactivate your account at any time</li> */}
                </ul>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {error ? (
            <>
              <Button variant="outline" onClick={handleGoToLogin} className="w-full">
                Go to Login
              </Button>
              <Button variant="ghost" onClick={handleGoHome} className="w-full">
                Go to Home
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="destructive" 
                onClick={handleCancelAccount}
                disabled={isLoading || !userToken}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Canceling..." : "Yes, Cancel My Account"}
              </Button>
              
              <Button variant="outline" onClick={handleGoToLogin} className="w-full">
                Back to Login
              </Button>
              
              <div className="text-sm text-center text-gray-500">
                <Link href="/" className="text-primary hover:underline">
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}