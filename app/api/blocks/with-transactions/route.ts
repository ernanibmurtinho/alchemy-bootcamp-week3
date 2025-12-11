import { type NextRequest, NextResponse } from "next/server"
import { alchemy, formatEther, formatAddress } from "@/lib/alchemy"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const blockNumber = searchParams.get("blockNumber")

  try {
    if (blockNumber) {
      // Fetch single block with transactions
      const block = await alchemy.core.getBlockWithTransactions(Number(blockNumber))

      if (!block) {
        return NextResponse.json({ error: "Block not found" }, { status: 404 })
      }

      return NextResponse.json({
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasUsed: block.gasUsed?.toString() || "0",
        gasLimit: block.gasLimit?.toString() || "0",
        transactionCount: block.transactions?.length || 0,
        formattedHash: formatAddress(block.hash),
        transactions: block.transactions?.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: formatEther(tx.value?.toString()),
          gasLimit: tx.gasLimit?.toString(),
          nonce: tx.nonce,
          formattedFrom: formatAddress(tx.from),
          formattedTo: tx.to ? formatAddress(tx.to) : null,
        })) || [],
      })
    }

    // Fetch latest 10 blocks
    const latestBlock = await alchemy.core.getBlockNumber()
    console.log("Latest block number:", latestBlock)

    if (!latestBlock) {
      return NextResponse.json({ error: "Could not fetch latest block number" }, { status: 500 })
    }

    const blockPromises = []
    for (let i = 0; i < 10; i++) {
      blockPromises.push(alchemy.core.getBlockWithTransactions(latestBlock - i))
    }
    const blocks = await Promise.all(blockPromises)

    // Filter out null blocks and format
    const formattedBlocks = blocks
      .filter((block) => block !== null && block !== undefined)
      .map((block) => ({
        number: block.number,
        hash: block.hash,
        parentHash: block.parentHash,
        timestamp: block.timestamp,
        gasUsed: block.gasUsed?.toString() || "0",
        gasLimit: block.gasLimit?.toString() || "0",
        transactionCount: block.transactions?.length || 0,
        formattedHash: formatAddress(block.hash),
        transactions: block.transactions?.map((tx) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: formatEther(tx.value?.toString()),
          formattedFrom: formatAddress(tx.from),
          formattedTo: tx.to ? formatAddress(tx.to) : null,
        })) || [],
      }))

    console.log("Fetched blocks count:", formattedBlocks.length)

    return NextResponse.json({ blockNumber: latestBlock, blocks: formattedBlocks })
  } catch (error) {
    console.error("Error fetching blocks:", error)
    return NextResponse.json(
      { error: "Failed to fetch blocks", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
