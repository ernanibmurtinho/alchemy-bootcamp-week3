"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, ArrowRight, Search, Loader2, ExternalLink } from "lucide-react"

interface Transfer {
  hash: string | null
  from: string
  to: string | null
  value: number | null
  asset: string | null
  category: string
  blockNum: string
  formattedFrom: string
  formattedTo: string
}

const ETHERSCAN_URLS: Record<string, string> = {
  mainnet: "https://etherscan.io",
  sepolia: "https://sepolia.etherscan.io",
  goerli: "https://goerli.etherscan.io",
}

export default function TransfersPage() {
  const [address, setAddress] = useState("")
  const [category, setCategory] = useState<string>("external")
  const [network, setNetwork] = useState<string>("mainnet")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [currentNetwork, setCurrentNetwork] = useState<string>("mainnet")

  const lookupTransfers = async () => {
    if (!address.trim()) {
      setError("Please enter a wallet address")
      return
    }

    if (!address.startsWith("0x") || address.length !== 42) {
      setError("Invalid address format. Must be 42 characters starting with 0x")
      return
    }

    setLoading(true)
    setError(null)
    setTransfers([])

    try {
      const res = await fetch(`/api/transfers?address=${address}&category=${category}&network=${network}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setTransfers(data.transfers || [])
      setCurrentNetwork(data.network || network)
    } catch (err) {
      console.error("Error fetching transfers:", err)
      setError("Failed to fetch transfers. Please check the address and try again.")
    } finally {
      setLoading(false)
    }
  }

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      external: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      erc20: "bg-green-500/20 text-green-500 border-green-500/50",
      erc721: "bg-purple-500/20 text-purple-500 border-purple-500/50",
      erc1155: "bg-orange-500/20 text-orange-500 border-orange-500/50",
    }
    return <Badge className={colors[cat] || ""}>{cat.toUpperCase()}</Badge>
  }

  const getNetworkBadge = (net: string) => {
    const colors: Record<string, string> = {
      mainnet: "bg-green-500/20 text-green-500 border-green-500/50",
      sepolia: "bg-purple-500/20 text-purple-500 border-purple-500/50",
      goerli: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
    }
    return <Badge className={colors[net] || ""}>{net.toUpperCase()}</Badge>
  }

  const getEtherscanUrl = (hash: string) => {
    const baseUrl = ETHERSCAN_URLS[currentNetwork] || ETHERSCAN_URLS.mainnet
    return `${baseUrl}/tx/${hash}`
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          Asset Transfers
        </h1>
        <p className="text-muted-foreground">Track ETH and token transfers for any wallet address.</p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Transfers</CardTitle>
          <CardDescription>Enter a wallet address to view recent transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="0x..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookupTransfers()}
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
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">ETH</SelectItem>
                  <SelectItem value="erc20">ERC-20</SelectItem>
                  <SelectItem value="erc721">ERC-721</SelectItem>
                  <SelectItem value="erc1155">ERC-1155</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={lookupTransfers} disabled={loading} className="sm:ml-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>
          {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Transfers List */}
      {transfers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold">Recent Transfers</h2>
            <div className="flex items-center gap-2">
              {getNetworkBadge(currentNetwork)}
              <Badge variant="secondary">{transfers.length} transfers</Badge>
            </div>
          </div>
          {transfers.map((transfer, index) => (
            <Card key={`${transfer.hash}-${index}`} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(transfer.category)}
                      <span className="text-sm text-muted-foreground">Block #{transfer.blockNum}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {transfer.value !== null ? transfer.value.toFixed(6) : "N/A"} {transfer.asset || "ETH"}
                      </span>
                      {transfer.hash && (
                        <a
                          href={getEtherscanUrl(transfer.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          title="View on Etherscan"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm overflow-hidden">
                    <code className="text-muted-foreground truncate" title={transfer.from}>
                      {transfer.formattedFrom}
                    </code>
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                    <code className="text-muted-foreground truncate" title={transfer.to || ""}>
                      {transfer.formattedTo}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {transfers.length === 0 && !loading && !error && (
        <Card className="bg-secondary/30">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a wallet address above to view recent transfers</p>
              <p className="text-sm mt-2">Tip: Select the correct network (Mainnet, Sepolia, etc.)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
