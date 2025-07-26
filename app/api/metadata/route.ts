import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  try {
    // Validate URL
    new URL(url)

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BookmarkBot/1.0)",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    let title = titleMatch ? titleMatch[1].trim() : ""

    // Extract meta description
    const descriptionMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i)
    let description = descriptionMatch ? descriptionMatch[1].trim() : ""

    // Extract Open Graph data as fallback
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      title = ogTitleMatch ? ogTitleMatch[1].trim() : ""
    }

    if (!description) {
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      description = ogDescMatch ? ogDescMatch[1].trim() : ""
    }

    // Fallback to domain name if no title found
    if (!title) {
      const domain = new URL(url).hostname.replace("www.", "")
      title = domain.charAt(0).toUpperCase() + domain.slice(1)
    }

    // Clean up title and description
    title = title.replace(/\s+/g, " ").trim()
    description = description.replace(/\s+/g, " ").trim()

    return NextResponse.json({
      title: title || "Website",
      description: description || "",
      url: url,
    })
  } catch (error) {
    console.error("Metadata fetch error:", error)

    // Return fallback data
    try {
      const domain = new URL(url).hostname.replace("www.", "")
      return NextResponse.json({
        title: domain.charAt(0).toUpperCase() + domain.slice(1),
        description: "",
        url: url,
      })
    } catch {
      return NextResponse.json({
        title: "Website",
        description: "",
        url: url,
      })
    }
  }
}
