import { NextResponse } from "next/server"
import { alchemy, formatEther, formatTimestamp } from "@/lib/alchemy"

export async function GET() {
  try {
    const currentBlockNumber = await alchemy.core.getBlockNumber()

    const blockPromises = []
    for (let i = 0; i < 10; i++) {
      blockPromises.push(alchemy.core.getBlock(currentBlockNumber - i))
    }

    const blocks = await Promise.all(blockPromises)

    const formattedBlocks = blocks.map((block) => ({
      number: block?.number || 0,
      hash: block?.hash || "",
      timestamp: formatTimestamp(block?.timestamp),
      transactions: block?.transactions?.length || 0,
      gasUsed: block?.gasUsed?.toString() || "0",
      gasLimit: block?.gasLimit?.toString() || "0",
      miner: block?.miner || "",
      baseFeePerGas: block?.baseFeePerGas ? formatEther(block.baseFeePerGas.toString()) : "N/A",
    }))

    return NextResponse.json(formattedBlocks)
  } catch (error) {
    console.error("Error fetching blocks:", error)
    return NextResponse.json({ error: "Failed to fetch blocks" }, { status: 500 })
  }
}
