import { type NextRequest, NextResponse } from "next/server"
import { alchemy, formatEther, formatAddress } from "@/lib/alchemy"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const [balanceResult, contractResult, blockResult] = await Promise.all([
      alchemy.core.getBalance(address),
      alchemy.core.isContractAddress(address),
      alchemy.core.getBlockNumber(),
    ])

    return NextResponse.json({
      address,
      formattedAddress: formatAddress(address),
      balance: formatEther(balanceResult.toString()),
      balanceWei: balanceResult.toString(),
      isContract: contractResult,
      blockNumber: blockResult,
    })
  } catch (error) {
    console.error("Error fetching account info:", error)
    return NextResponse.json({ error: "Failed to fetch account info" }, { status: 500 })
  }
}
