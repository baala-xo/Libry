"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Item } from "@/types/database"

interface DeleteLinkDialogProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteLinkDialog({ item, open, onOpenChange }: DeleteLinkDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from("items").delete().eq("id", item.id)

      if (error) throw error

      toast({
        title: "Link deleted",
        description: "The link has been removed from your library.",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error deleting link:", error)
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Link</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{item.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
