import { type NextRequest, NextResponse } from "next/server"
import { createAlchemyClient } from "@/lib/alchemy"
import { Wallet } from "alchemy-sdk"

// Convert ETH string to wei as hex string
function ethToWeiHex(ethAmount: string): string {
  // Convert ETH to wei (multiply by 10^18)
  const [whole = "0", decimal = ""] = ethAmount.split(".")
  const paddedDecimal = decimal.padEnd(18, "0").slice(0, 18)
  const weiString = (whole + paddedDecimal).replace(/^0+/, "") || "0"
  const weiBigInt = BigInt(weiString)
  return "0x" + weiBigInt.toString(16)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toAddress, amountInETH, privateKey, network } = body

    // Validation
    if (!toAddress || !amountInETH || !privateKey || !network) {
      return NextResponse.json(
        { error: "Missing required fields: toAddress, amountInETH, privateKey, network" },
        { status: 400 }
      )
    }

    if (!toAddress.startsWith("0x") || toAddress.length !== 42) {
      return NextResponse.json({ error: "Invalid recipient address format" }, { status: 400 })
    }

    const normalizedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`

    // Create Alchemy client for the specified network
    const alchemy = createAlchemyClient(network)
    const provider = await alchemy.config.getProvider()
    
    // Create wallet with Alchemy's bundled ethers Wallet
    const wallet = new Wallet(normalizedPrivateKey, provider)

    console.log(`Sending ${amountInETH} ETH from ${wallet.address} to ${toAddress} on ${network}`)

    // Convert ETH to wei hex for the transaction
    const valueHex = ethToWeiHex(amountInETH.toString())

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: valueHex,
    })

    console.log(`Transaction sent: ${tx.hash}`)

    // Wait for transaction to be mined
    const receipt = await tx.wait()

    console.log(`Transaction confirmed in block: ${receipt?.blockNumber}`)

    return NextResponse.json({
      success: true,
      hash: tx.hash,
      blockNumber: receipt?.blockNumber,
      from: wallet.address,
      to: toAddress,
      value: amountInETH,
      network,
    })
  } catch (error) {
    console.error("Error sending transaction:", error)
    
    let errorMessage = "Failed to send transaction"
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Provide more helpful error messages
      if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds for transaction + gas. Get testnet ETH from a faucet."
      } else if (error.message.includes("invalid private key") || error.message.includes("invalid arrayify")) {
        errorMessage = "Invalid private key format. Make sure it's 64 hex characters (with or without 0x prefix)."
      } else if (error.message.includes("nonce")) {
        errorMessage = "Nonce error - try again in a few seconds"
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
