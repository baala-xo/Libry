import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

async function createLibrary(formData: FormData) {
  "use server"

  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const isPublic = formData.get("isPublic") === "on"

  if (!name.trim()) {
    // In a real app, you'd handle this error properly
    return
  }

  const { error } = await supabase.from("libraries").insert({
    name: name.trim(),
    description: description.trim() || null,
    is_public: isPublic,
    user_id: session.user.id,
  })

  if (error) {
    console.error("Error creating library:", error)
    return
  }

  redirect("/")
}

export default async function CreateLibraryPage() {
  const supabase = await createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Library</h1>
          <p className="text-muted-foreground">Create a new collection to organize your links</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Library Details</CardTitle>
            <CardDescription>Provide information about your new Libry</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createLibrary} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Library Name *</Label>
                <Input id="name" name="name" placeholder="Enter library name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this library is for (optional)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isPublic" name="isPublic" />
                <Label htmlFor="isPublic" className="text-sm font-medium">
                  Make this library public
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Public libraries can be viewed by other users</p>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Library
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
