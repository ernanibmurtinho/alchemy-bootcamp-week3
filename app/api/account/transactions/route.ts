import { type NextRequest, NextResponse } from "next/server"
import { alchemy, formatAddress } from "@/lib/alchemy"
import { AssetTransfersCategory } from "alchemy-sdk"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")
  const filter = searchParams.get("filter") || "all"

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const categories = [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.INTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ]

    let allTransfers: any[] = []

    if (filter === "sent" || filter === "all") {
      const sentResult = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: categories,
        maxCount: 100,
        withMetadata: true,
      })
      allTransfers = [...allTransfers, ...sentResult.transfers]
    }

    if (filter === "received" || filter === "all") {
      const receivedResult = await alchemy.core.getAssetTransfers({
        toAddress: address,
        category: categories,
        maxCount: 100,
        withMetadata: true,
      })
      allTransfers = [...allTransfers, ...receivedResult.transfers]
    }

    // Remove duplicates
    const uniqueTransfers = allTransfers.filter(
      (transfer, index, self) => index === self.findIndex((t) => t.hash === transfer.hash),
    )

    const transfers = uniqueTransfers.map((t) => ({
      hash: t.hash,
      from: t.from,
      to: t.to,
      value: t.value,
      asset: t.asset,
      category: t.category,
      blockNum: t.blockNum,
      formattedFrom: formatAddress(t.from),
      formattedTo: formatAddress(t.to),
      timestamp: t.metadata?.blockTimestamp || null,
    }))

    return NextResponse.json(transfers)
  } catch (error) {
    console.error("Error fetching account transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
