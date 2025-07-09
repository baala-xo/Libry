"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExternalLink, MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"
import { EditLinkDialog } from "@/components/edit-link-dialog"
import { DeleteLinkDialog } from "@/components/delete-link-dialog"
import { ClientDate } from "@/components/client-date"
import type { Item } from "@/types/database"

interface LinkCardProps {
  item: Item
  libraryId: string
}

export function LinkCard({ item, libraryId }: LinkCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return url
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight truncate font-serif">{item.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <ExternalLink className="mr-1 h-3 w-3 flex-shrink-0" />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate font-sans"
                  title={item.url}
                >
                  {getDomain(item.url)}
                </a>
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="mr-1 h-3 w-3" />
                <ClientDate date={item.created_at} />
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm" asChild className="shadow-xs bg-transparent">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="font-sans">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive font-sans">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        {(item.description || (item.tags && item.tags.length > 0)) && (
          <CardContent className="pt-0">
            {item.description && <CardDescription className="mb-3 font-sans">{item.description}</CardDescription>}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs font-mono">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <EditLinkDialog item={item} libraryId={libraryId} open={showEditDialog} onOpenChange={setShowEditDialog} />

      <DeleteLinkDialog item={item} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
    </>
  )
}
