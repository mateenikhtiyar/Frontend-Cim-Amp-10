import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dealId = params.id
    const body = await request.json()

    // Get the token from the request headers
    const token = request.headers.get("Authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get the API URL from environment or use default
    const apiUrl = process.env.API_URL || "https://api.cimamplify.com"

    // Forward the request to the backend API
    const response = await fetch(`${apiUrl}/deals/${dealId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to update deal" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating deal:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
