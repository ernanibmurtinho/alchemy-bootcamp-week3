import { type NextRequest, NextResponse } from "next/server"
import { alchemy } from "@/lib/alchemy"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const contractAddress = searchParams.get("contractAddress")
  const tokenId = searchParams.get("tokenId")

  if (!contractAddress || !tokenId) {
    return NextResponse.json({ error: "Contract address and token ID are required" }, { status: 400 })
  }

  try {
    const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId)

    return NextResponse.json({
      tokenId: nft.tokenId,
      name: nft.name || `Token #${nft.tokenId}`,
      description: nft.description || "No description available",
      image: nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl || null,
      collection: nft.contract.name || "Unknown Collection",
      contractAddress: nft.contract.address,
      tokenType: nft.tokenType,
      attributes: nft.raw?.metadata?.attributes || [],
    })
  } catch (error) {
    console.error("Error fetching NFT metadata:", error)
    return NextResponse.json({ error: "Failed to fetch NFT metadata" }, { status: 500 })
  }
}
