import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import DashboardTabs from "@/components/dashboard-tabs"

export default async function Dashboard() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#FFCC00] shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/dhl-logo.svg" alt="DHL Logo" className="h-10 mr-3" />
            <h1 className="text-xl font-bold text-[#D40511]">Leave Management System</h1>
          </div>
          <div className="flex items-center">
            <span className="text-gray-800 mr-4">{session.user.email}</span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="bg-[#D40511] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardTabs />
      </main>
    </div>
  )
}
