import { type NextRequest, NextResponse } from "next/server"
import { createAlchemyClient, formatAddress, AssetTransfersCategory, SortingOrder } from "@/lib/alchemy"

const categoryMap: Record<string, AssetTransfersCategory> = {
  external: AssetTransfersCategory.EXTERNAL,
  erc20: AssetTransfersCategory.ERC20,
  erc721: AssetTransfersCategory.ERC721,
  erc1155: AssetTransfersCategory.ERC1155,
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")
  const category = searchParams.get("category") || "external"
  const network = searchParams.get("network") || "mainnet"

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    // Create Alchemy client for the specified network
    const alchemy = createAlchemyClient(network)

    const [incoming, outgoing] = await Promise.all([
      alchemy.core.getAssetTransfers({
        toAddress: address,
        category: [categoryMap[category] || AssetTransfersCategory.EXTERNAL],
        maxCount: 25,
        order: SortingOrder.DESCENDING,
      }),
      alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: [categoryMap[category] || AssetTransfersCategory.EXTERNAL],
        maxCount: 25,
        order: SortingOrder.DESCENDING,
      }),
    ])

    const allTransfers = [
      ...incoming.transfers.map((t) => ({ ...t, direction: "in" })),
      ...outgoing.transfers.map((t) => ({ ...t, direction: "out" })),
    ].sort((a, b) => Number.parseInt(b.blockNum, 16) - Number.parseInt(a.blockNum, 16))

    const transfers = allTransfers.slice(0, 50).map((t) => ({
      hash: t.hash,
      from: t.from,
      to: t.to,
      value: t.value,
      asset: t.asset,
      category: t.category,
      blockNum: Number.parseInt(t.blockNum, 16).toString(),
      formattedFrom: formatAddress(t.from),
      formattedTo: t.to ? formatAddress(t.to) : "Contract",
    }))

    return NextResponse.json({ transfers, network })
  } catch (error) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 })
  }
}
