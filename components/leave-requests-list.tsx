"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search, X, Trash2, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type LeaveRequest = {
  id: string
  employee_name: string
  staff_id: string
  leave_type: string
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export default function LeaveRequestsList() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<LeaveRequest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [leaveRequests, searchTerm, startDate, endDate])

  const fetchLeaveRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        setLeaveRequests(data)
        setFilteredRequests(data)
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch leave requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...leaveRequests]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((request) => request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by start date
    if (startDate) {
      filtered = filtered.filter((request) => {
        const requestStartDate = new Date(request.start_date)
        return requestStartDate >= startDate
      })
    }

    // Filter by end date
    if (endDate) {
      filtered = filtered.filter((request) => {
        const requestEndDate = new Date(request.end_date)
        return requestEndDate <= endDate
      })
    }

    setFilteredRequests(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  // Handle start date change
  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    // If the selected start date is after the current end date, reset end date
    if (date && endDate && date > endDate) {
      setEndDate(undefined)
    }
  }

  // Handle end date change
  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    // If the selected end date is before the current start date, reset start date
    if (date && startDate && date < startDate) {
      setStartDate(undefined)
    }
  }

  // Handle delete request
  const handleDeleteRequest = (request: LeaveRequest) => {
    setRequestToDelete(request)
    setDeleteDialogOpen(true)
  }

  // Confirm delete request
  const confirmDelete = async () => {
    if (!requestToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("leave_requests").delete().eq("id", requestToDelete.id)

      if (error) {
        throw error
      }

      // Remove the deleted request from the state
      const updatedRequests = leaveRequests.filter((request) => request.id !== requestToDelete.id)
      setLeaveRequests(updatedRequests)

      toast({
        title: "Success",
        description: "Leave request deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting leave request:", error)
      toast({
        title: "Error",
        description: "Failed to delete leave request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRequestToDelete(null)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setRequestToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Leave Requests</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by employee name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd-MM-yyyy") : "Start Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                  // Disable dates after the end date if it's set
                  disabled={(date) => (endDate ? date > endDate : false)}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd-MM-yyyy") : "End Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  // Disable dates before the start date if it's set
                  disabled={(date) => (startDate ? date < startDate : false)}
                />
              </PopoverContent>
            </Popover>

            {(searchTerm || startDate || endDate) && (
              <Button variant="ghost" onClick={clearFilters} className="flex items-center">
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading leave requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No leave requests found matching your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.employee_name}</TableCell>
                    <TableCell>{request.staff_id}</TableCell>
                    <TableCell>{request.leave_type}</TableCell>
                    <TableCell>{new Date(request.start_date).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>{new Date(request.end_date).toLocaleDateString("en-GB")}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRequest(request)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        aria-label={`Delete leave request for ${request.employee_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the leave request for{" "}
              <span className="font-semibold">{requestToDelete?.employee_name}</span>?
              <br />
              <br />
              <span className="text-sm text-gray-700">
                Staff ID: {requestToDelete?.staff_id}
                <br />
                Period: {requestToDelete ? new Date(requestToDelete.start_date).toLocaleDateString("en-GB") : ""} to{" "}
                {requestToDelete ? new Date(requestToDelete.end_date).toLocaleDateString("en-GB") : ""}
                <br />
                Type: {requestToDelete?.leave_type}
              </span>
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  )
}
