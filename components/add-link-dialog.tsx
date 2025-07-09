"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface AddLinkDialogProps {
  libraryId: string
  children: React.ReactNode
}

export function AddLinkDialog({ libraryId, children }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const fetchMetadata = async (url: string) => {
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const metadata = await response.json()
        if (metadata.title && !title) {
          setTitle(metadata.title)
        }
        if (metadata.description && !description) {
          setDescription(metadata.description)
        }
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
    }
  }

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    if (newUrl && newUrl.startsWith("http")) {
      fetchMetadata(newUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    setLoading(true)
    try {
      // Verify user session first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        throw new Error("Authentication error. Please try logging in again.")
      }

      if (!session) {
        throw new Error("You must be logged in to add links.")
      }

      // Verify the library belongs to the current user
      const { data: library, error: libraryError } = await supabase
        .from("libraries")
        .select("id, user_id")
        .eq("id", libraryId)
        .eq("user_id", session.user.id)
        .single()

      if (libraryError) {
        console.error("Library verification error:", libraryError)
        throw new Error("Library not found or access denied.")
      }

      if (!library) {
        throw new Error("Library not found or you don't have permission to add links to it.")
      }

      // Insert the item - only include the fields that exist in the items table
      const insertData = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || null,
        tags: tags.length > 0 ? tags : null,
        library_id: libraryId,
        // Do NOT include user_id - it doesn't belong in the items table
      }

      console.log("Inserting item with data:", insertData)

      const { data, error } = await supabase.from("items").insert(insertData).select().single()

      if (error) {
        console.error("Supabase insert error:", error)
        throw new Error(error.message || "Failed to add link to database")
      }

      console.log("Successfully inserted item:", data)

      toast({
        title: "Link added successfully",
        description: "Your link has been added to the library.",
      })

      // Reset form
      setTitle("")
      setUrl("")
      setDescription("")
      setTags([])
      setTagInput("")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error adding link:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add link. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
          <DialogDescription>Add a new link to your library with optional tags and description.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Link title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X className="ml-1 h-3 w-3" onClick={() => handleRemoveTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !url.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
