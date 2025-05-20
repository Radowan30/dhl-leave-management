"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LeaveRequestsList from "@/components/leave-requests-list"
import LeaveRequestForm from "@/components/leave-request-form"

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("leave-requests")

  return (
    <Tabs defaultValue="leave-requests" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger
          value="leave-requests"
          className="text-lg font-medium data-[state=active]:bg-[#FFCC00] data-[state=active]:text-[#D40511]"
        >
          Leave Requests
        </TabsTrigger>
        <TabsTrigger
          value="enter-new-request"
          className="text-lg font-medium data-[state=active]:bg-[#FFCC00] data-[state=active]:text-[#D40511]"
        >
          Enter New Request
        </TabsTrigger>
      </TabsList>
      <TabsContent value="leave-requests">
        <LeaveRequestsList />
      </TabsContent>
      <TabsContent value="enter-new-request">
        <LeaveRequestForm onSuccess={() => setActiveTab("leave-requests")} />
      </TabsContent>
    </Tabs>
  )
}
