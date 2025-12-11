"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, CheckCircle2, XCircle, Clock, Loader2, FileSearch, ExternalLink } from "lucide-react"

interface TransactionData {
  hash: string
  status: "success" | "failed" | "pending"
  blockNumber: number | null
  from: string
  to: string | null
  value: string
  gasUsed: string
  gasPrice: string
  formattedTimestamp: string
  confirmations: number
  network: string
}

const ETHERSCAN_URLS: Record<string, string> = {
  mainnet: "https://etherscan.io",
  sepolia: "https://sepolia.etherscan.io",
  goerli: "https://goerli.etherscan.io",
}

export default function TransactionStatusPage() {
  const [txHash, setTxHash] = useState("")
  const [network, setNetwork] = useState("sepolia")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txData, setTxData] = useState<TransactionData | null>(null)

  const lookupTransaction = async () => {
    if (!txHash.trim()) {
      setError("Please enter a transaction hash")
      return
    }

    if (!txHash.startsWith("0x") || txHash.length !== 66) {
      setError("Invalid transaction hash format. Must be 66 characters starting with 0x")
      return
    }

    setLoading(true)
    setError(null)
    setTxData(null)

    try {
      const res = await fetch(`/api/transaction?hash=${txHash}&network=${network}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setTxData(data)
    } catch (err) {
      console.error("Error fetching transaction:", err)
      setError("Failed to fetch transaction. Please check the hash and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Success</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Failed</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Pending</Badge>
    }
  }

  const getNetworkBadge = (net: string) => {
    const colors: Record<string, string> = {
      mainnet: "bg-green-500/20 text-green-500 border-green-500/50",
      sepolia: "bg-purple-500/20 text-purple-500 border-purple-500/50",
      goerli: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    }
    return <Badge className={colors[net] || ""}>{net.toUpperCase()}</Badge>
  }

  const getEtherscanUrl = (hash: string, net: string) => {
    const baseUrl = ETHERSCAN_URLS[net] || ETHERSCAN_URLS.mainnet
    return `${baseUrl}/tx/${hash}`
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <FileSearch className="h-8 w-8 text-primary" />
          Transaction Status
        </h1>
        <p className="text-muted-foreground">Look up any transaction by its hash to check its status and details.</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Transaction</CardTitle>
          <CardDescription>Enter a transaction hash to view its details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="0x..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookupTransaction()}
              className="font-mono flex-1"
            />
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mainnet">🟢 Mainnet</SelectItem>
                <SelectItem value="sepolia">🟣 Sepolia</SelectItem>
                <SelectItem value="goerli">🟡 Goerli</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={lookupTransaction} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
          {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Transaction Details */}
      {txData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(txData.status)}
                <CardTitle>Transaction Details</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {getNetworkBadge(txData.network)}
                {getStatusBadge(txData.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Transaction Hash:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm break-all">{txData.hash}</code>
                  <a
                    href={getEtherscanUrl(txData.hash, txData.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary shrink-0"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Block:</span>
                <span>{txData.blockNumber || "Pending"}</span>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Timestamp:</span>
                <span>{txData.formattedTimestamp}</span>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Confirmations:</span>
                <Badge variant="secondary">{txData.confirmations}</Badge>
              </div>
              <hr className="border-[hsl(var(--border))]" />
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">From:</span>
                <code className="text-sm break-all">{txData.from}</code>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">To:</span>
                <code className="text-sm break-all">{txData.to || "Contract Creation"}</code>
              </div>
              <hr className="border-[hsl(var(--border))]" />
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Value:</span>
                <span className="font-mono font-medium">{txData.value} ETH</span>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Gas Used:</span>
                <span className="font-mono">{txData.gasUsed}</span>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-2 items-start">
                <span className="text-muted-foreground text-sm">Gas Price:</span>
                <span className="font-mono">{txData.gasPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!txData && !loading && !error && (
        <Card className="bg-secondary/30">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a transaction hash above to view its details</p>
              <p className="text-sm mt-2">Tip: Make sure to select the correct network (Mainnet, Sepolia, etc.)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
