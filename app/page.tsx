import { redirect } from "next/navigation"
import AuthForm from "@/components/auth-form"
import { createServerClient } from "@/lib/supabase-server"

export default async function Home() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex flex-col items-center justify-center text-center">
          <img src="/dhl-logo.svg" alt="DHL Logo" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold text-[#D40511]">DHL Leave Management</h1>
          <p className="text-gray-600 mt-2">Sign in to access the HR portal</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
