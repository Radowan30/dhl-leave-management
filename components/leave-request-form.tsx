"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

type LeaveRequestFormData = {
  employee_name: string
  staff_id: string
  leave_type: string
  start_date: string
  end_date: string
  status: string
}

export default function LeaveRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LeaveRequestFormData>({
    defaultValues: {
      employee_name: "",
      staff_id: "",
      leave_type: "Annual",
      start_date: "",
      end_date: "",
      status: "Pending",
    },
  })

  const leaveType = watch("leave_type")
  const status = watch("status")

  // Function to parse flexible date formats and convert to YYYY-MM-DD
  const parseDate = (dateString: string): string => {
    // Handle different separators (-, /, .)
    const cleanDateString = dateString.replace(/[^\d]/g, "-").replace(/--+/g, "-").trim()

    // Try to parse DD-MM-YYYY format (with flexible separators)
    const parts = cleanDateString.split("-").filter((part) => part.length > 0)

    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0")
      const month = parts[1].padStart(2, "0")
      let year = parts[2]

      // Ensure year has 4 digits
      if (year.length === 2) {
        year = `20${year}`
      }

      // Validate day and month ranges
      const dayNum = Number.parseInt(day, 10)
      const monthNum = Number.parseInt(month, 10)

      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12) {
        return `${year}-${month}-${day}`
      }
    }

    // If parsing fails, return original string
    return dateString
  }

  // Function to check for duplicate leave requests
  const checkForDuplicates = async (staffId: string, startDate: string, endDate: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("leave_requests")
      .select("id")
      .eq("staff_id", staffId)
      .eq("start_date", startDate)
      .eq("end_date", endDate)
      .limit(1)

    if (error) {
      console.error("Error checking for duplicates:", error)
      return false
    }

    return data && data.length > 0
  }

  const onSubmit = async (data: LeaveRequestFormData) => {
    setLoading(true)

    try {
      // Parse and format dates
      const parsedStartDate = parseDate(data.start_date)
      const parsedEndDate = parseDate(data.end_date)

      // Validate dates
      const startDate = new Date(parsedStartDate)
      const endDate = new Date(parsedEndDate)

      if (isNaN(startDate.getTime())) {
        throw new Error("Invalid start date format. Please use DD-MM-YYYY format.")
      }

      if (isNaN(endDate.getTime())) {
        throw new Error("Invalid end date format. Please use DD-MM-YYYY format.")
      }

      if (startDate > endDate) {
        throw new Error("End date cannot be before start date.")
      }

      // Check for duplicate leave requests
      const isDuplicate = await checkForDuplicates(data.staff_id, parsedStartDate, parsedEndDate)

      if (isDuplicate) {
        throw new Error("A leave request with the same Staff ID, Start Date, and End Date already exists.")
      }

      // Format dates for database (YYYY-MM-DD)
      const formattedData = {
        ...data,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
      }

      const { error } = await supabase.from("leave_requests").insert([formattedData])

      if (error) {
        throw error
      }

      toast({
        title: "Leave request submitted",
        description: "The leave request has been successfully submitted.",
      })

      reset()
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error submitting leave request",
        description: error.message || "An error occurred while submitting the leave request.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Enter New Leave Request</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="employee_name">Employee Name</Label>
            <Input
              id="employee_name"
              {...register("employee_name", { required: "Employee name is required" })}
              placeholder="John Doe"
              className={errors.employee_name ? "border-red-500" : ""}
            />
            {errors.employee_name && <p className="text-red-500 text-sm">{errors.employee_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff_id">Staff ID</Label>
            <Input
              id="staff_id"
              {...register("staff_id", { required: "Staff ID is required" })}
              placeholder="DHL12345"
              className={errors.staff_id ? "border-red-500" : ""}
            />
            {errors.staff_id && <p className="text-red-500 text-sm">{errors.staff_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave_type">Leave Type</Label>
            <Select value={leaveType} onValueChange={(value) => setValue("leave_type", value)}>
              <SelectTrigger className={errors.leave_type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual">Annual</SelectItem>
                <SelectItem value="Sick">Sick</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            {errors.leave_type && <p className="text-red-500 text-sm">{errors.leave_type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="text"
              placeholder="DD-MM-YYYY"
              {...register("start_date", {
                required: "Start date is required",
                pattern: {
                  // More flexible pattern to allow different separators and single-digit months/days
                  value: /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/,
                  message: "Please use DD-MM-YYYY format",
                },
              })}
              className={errors.start_date ? "border-red-500" : ""}
            />
            {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date.message}</p>}
            <p className="text-xs text-gray-500">Format: DD-MM-YYYY (e.g., 25-05-2025 or 25/5/2025)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="text"
              placeholder="DD-MM-YYYY"
              {...register("end_date", {
                required: "End date is required",
                pattern: {
                  // More flexible pattern to allow different separators and single-digit months/days
                  value: /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/,
                  message: "Please use DD-MM-YYYY format",
                },
              })}
              className={errors.end_date ? "border-red-500" : ""}
            />
            {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date.message}</p>}
            <p className="text-xs text-gray-500">Format: DD-MM-YYYY (e.g., 25-05-2025 or 25/5/2025)</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => reset()} disabled={loading}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#FFCC00] text-[#D40511] hover:bg-[#FFCC00]/90 font-bold"
          >
            {loading ? "Submitting..." : "Submit Leave Request"}
          </Button>
        </div>
      </form>
      <Toaster />
    </div>
  )
}
