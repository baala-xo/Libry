"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, Upload, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

interface ImportExportButtonsProps {
  libraryId: string
}

export function ImportExportButtons({ libraryId }: ImportExportButtonsProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importText, setImportText] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const { data: items, error } = await supabase
        .from("items")
        .select("*")
        .eq("library_id", libraryId)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Prepare data for Excel
      const excelData =
        items?.map((item, index) => ({
          "S.No": index + 1,
          Title: item.title,
          URL: item.url,
          Description: item.description || "",
          Tags: item.tags ? item.tags.join(", ") : "",
          "Created Date": new Date(item.created_at).toLocaleDateString(),
          "Created Time": new Date(item.created_at).toLocaleTimeString(),
        })) || []

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      const colWidths = [
        { wch: 5 }, // S.No
        { wch: 30 }, // Title
        { wch: 50 }, // URL
        { wch: 40 }, // Description
        { wch: 20 }, // Tags
        { wch: 12 }, // Created Date
        { wch: 12 }, // Created Time
      ]
      ws["!cols"] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Links")

      // Generate filename with current date
      const filename = `library-${libraryId}-${new Date().toISOString().split("T")[0]}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)

      toast({
        title: "Export successful",
        description: `Your library has been exported to ${filename}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "Failed to export library. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importText.trim()) return

    setImportLoading(true)
    try {
      let linksToImport: Array<{ title: string; url: string; description?: string; tags?: string[] }> = []

      try {
        const parsed = JSON.parse(importText)
        if (parsed.items && Array.isArray(parsed.items)) {
          linksToImport = parsed.items.map((item: any) => ({
            title: item.title || item.url,
            url: item.url,
            description: item.description || null,
            tags: item.tags || null,
          }))
        } else if (Array.isArray(parsed)) {
          linksToImport = parsed.map((item: any) => ({
            title: item.title || item.url,
            url: item.url,
            description: item.description || null,
            tags: item.tags || null,
          }))
        }
      } catch {
        const urls = importText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && (line.startsWith("http://") || line.startsWith("https://")))

        linksToImport = urls.map((url) => ({
          title: new URL(url).hostname.replace("www.", ""),
          url,
          description: null,
          tags: null,
        }))
      }

      if (linksToImport.length === 0) {
        throw new Error("No valid links found in the import data")
      }

      const { error } = await supabase.from("items").insert(
        linksToImport.map((link) => ({
          ...link,
          library_id: libraryId,
        })),
      )

      if (error) throw error

      toast({
        title: "Import successful",
        description: `Successfully imported ${linksToImport.length} links.`,
      })

      setImportText("")
      setImportOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import links. Please check your data format.",
        variant: "destructive",
      })
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={handleExport} disabled={exportLoading} className="shadow-xs bg-transparent">
        {exportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        <span className="font-serif">Export Excel</span>
      </Button>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="shadow-xs bg-transparent">
            <Upload className="mr-2 h-4 w-4" />
            <span className="font-serif">Import</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="font-serif">Import Links</DialogTitle>
            <DialogDescription className="font-sans">
              Import links from JSON export or paste URLs (one per line). Supports browser bookmark exports.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-data" className="font-serif">
                Import Data
              </Label>
              <Textarea
                id="import-data"
                placeholder={`Paste your data here:

JSON format:
[{"title": "Example", "url": "https://example.com", "description": "...", "tags": ["tag1"]}]

Or simple URLs:
https://example.com
https://another-site.com`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportOpen(false)} className="font-serif">
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importLoading || !importText.trim()} className="font-serif">
                {importLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import Links
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
