import { type NextRequest, NextResponse } from "next/server"
import { createAlchemyClient, formatEther, formatTimestamp } from "@/lib/alchemy"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const hash = searchParams.get("hash")
  const network = searchParams.get("network") || "mainnet"

  if (!hash) {
    return NextResponse.json({ error: "Transaction hash is required" }, { status: 400 })
  }

  try {
    // Create Alchemy client for the specified network
    const alchemy = createAlchemyClient(network)

    const [tx, receipt] = await Promise.all([
      alchemy.core.getTransaction(hash),
      alchemy.core.getTransactionReceipt(hash),
    ])

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found. Make sure you selected the correct network." }, { status: 404 })
    }

    let timestamp: number | null = null
    let confirmations = 0

    if (tx.blockNumber) {
      const [block, currentBlock] = await Promise.all([
        alchemy.core.getBlock(tx.blockNumber),
        alchemy.core.getBlockNumber(),
      ])
      timestamp = block?.timestamp || null
      confirmations = currentBlock - tx.blockNumber + 1
    }

    let status: "success" | "failed" | "pending" = "pending"
    if (receipt) {
      status = receipt.status === 1 ? "success" : "failed"
    }

    return NextResponse.json({
      hash: tx.hash,
      status,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      value: formatEther(tx.value?.toString()),
      gasUsed: receipt?.gasUsed?.toString() || "N/A",
      gasPrice: tx.gasPrice ? `${(Number(tx.gasPrice) / 1e9).toFixed(2)} Gwei` : "N/A",
      timestamp,
      formattedTimestamp: timestamp ? formatTimestamp(timestamp) : "Pending",
      confirmations,
      network,
    })
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}
