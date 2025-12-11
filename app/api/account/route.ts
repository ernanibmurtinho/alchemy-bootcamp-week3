import { type NextRequest, NextResponse } from "next/server"
import { alchemy, formatEther } from "@/lib/alchemy"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const balance = await alchemy.core.getBalance(address)

    return NextResponse.json({
      address,
      balance: formatEther(balance.toString()),
      balanceWei: balance.toString(),
    })
  } catch (error) {
    console.error("Error fetching account:", error)
    return NextResponse.json({ error: "Failed to fetch account" }, { status: 500 })
  }
}
