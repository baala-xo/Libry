import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkLibrary/1.0)",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch URL")
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ""

    // Extract description from meta tags
    const descriptionMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)
    const description = descriptionMatch ? descriptionMatch[1].trim() : ""

    return NextResponse.json({
      title: title || new URL(url).hostname,
      description: description || "",
      url,
    })
  } catch (error) {
    console.error("Metadata fetch error:", error)
    return NextResponse.json(
      {
        title: new URL(url).hostname,
        description: "",
        url,
      },
      { status: 200 },
    )
  }
}
