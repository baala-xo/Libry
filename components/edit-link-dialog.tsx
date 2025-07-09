"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { Item } from "@/types/database"

interface EditLinkDialogProps {
  item: Item
  libraryId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditLinkDialog({ item, libraryId, open, onOpenChange }: EditLinkDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open && item) {
      setTitle(item.title)
      setUrl(item.url)
      setDescription(item.description || "")
      setTags(item.tags || [])
      setTagInput("")
    }
  }, [open, item])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("items")
        .update({
          title: title.trim(),
          url: url.trim(),
          description: description.trim() || null,
          tags: tags.length > 0 ? tags : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      if (error) throw error

      toast({
        title: "Link updated successfully",
        description: "Your changes have been saved.",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating link:", error)
      toast({
        title: "Error",
        description: "Failed to update link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>Update your link details and tags.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-url">URL *</Label>
            <Input
              id="edit-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              placeholder="Link title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="edit-tags"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !url.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
