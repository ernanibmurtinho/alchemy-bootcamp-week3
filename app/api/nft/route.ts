import { type NextRequest, NextResponse } from "next/server"
import { alchemy } from "@/lib/alchemy"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    const nfts = await alchemy.nft.getNftsForOwner(address, { pageSize: 20 })

    const formattedNfts = nfts.ownedNfts.map((nft) => ({
      tokenId: nft.tokenId,
      name: nft.name || `Token #${nft.tokenId}`,
      description: nft.description || "No description",
      image: nft.image?.thumbnailUrl || nft.image?.cachedUrl || null,
      collection: nft.contract.name || "Unknown Collection",
      contractAddress: nft.contract.address,
    }))

    return NextResponse.json({
      nfts: formattedNfts,
      totalCount: nfts.totalCount,
    })
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    return NextResponse.json({ error: "Failed to fetch NFTs" }, { status: 500 })
  }
}
