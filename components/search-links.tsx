"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface SearchLinksProps {
  libraryId: string
  currentSearch?: string
  currentTag?: string
  allTags: string[]
}

export function SearchLinks({ libraryId, currentSearch, currentTag, allTags }: SearchLinksProps) {
  const [search, setSearch] = useState(currentSearch || "")
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }
    router.push(`/libraries/${libraryId}?${params.toString()}`)
  }

  const handleTagFilter = (tag: string) => {
    const params = new URLSearchParams(searchParams)
    if (tag && tag !== "all") {
      params.set("tag", tag)
    } else {
      params.delete("tag")
    }
    router.push(`/libraries/${libraryId}?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    router.push(`/libraries/${libraryId}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {allTags.length > 0 && (
          <>
            <span className="text-sm text-muted-foreground">Filter by tag:</span>
            <Select value={currentTag || "all"} onValueChange={handleTagFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {(currentSearch || currentTag) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        )}
      </div>

      {(currentSearch || currentTag) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {currentSearch && <Badge variant="secondary">Search: {currentSearch}</Badge>}
          {currentTag && <Badge variant="secondary">Tag: {currentTag}</Badge>}
        </div>
      )}
    </div>
  )
}
