"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Search, Loader2 } from "lucide-react"

interface NFTData {
  tokenId: string
  name: string
  description: string
  image: string | null
  collection: string
  contractAddress: string
  tokenType: string
  attributes: { trait_type: string; value: string }[]
}

export default function NFTLookupPage() {
  const [contractAddress, setContractAddress] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nftData, setNftData] = useState<NFTData | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contractAddress || !tokenId) {
      setError("Please enter both contract address and token ID")
      return
    }

    setLoading(true)
    setError(null)
    setNftData(null)

    try {
      const res = await fetch(`/api/nft/metadata?contractAddress=${contractAddress}&tokenId=${tokenId}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setNftData(data)
    } catch (err) {
      setError("Failed to fetch NFT metadata. Please check the contract address and token ID.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-primary" />
          NFT Lookup
        </h1>
        <p className="text-muted-foreground">Search for any NFT by contract address and token ID.</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Search NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contract">Contract Address</Label>
              <Input
                id="contract"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenId">Token ID</Label>
              <Input
                id="tokenId"
                placeholder="1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search NFT
            </Button>
          </form>
          {error && <p className="text-destructive text-sm mt-3">{error}</p>}
        </CardContent>
      </Card>

      {nftData && (
        <Card className="mt-8 max-w-2xl">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {nftData.image ? (
                  <img
                    src={nftData.image || "/placeholder.svg"}
                    alt={nftData.name}
                    className="h-48 w-48 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-48 w-48 bg-secondary rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{nftData.name}</h2>
                  <p className="text-muted-foreground text-sm">{nftData.collection}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{nftData.tokenType}</Badge>
                  <Badge variant="outline">Token #{nftData.tokenId}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{nftData.description}</p>
                <div>
                  <p className="text-xs text-muted-foreground">Contract Address:</p>
                  <code className="text-xs break-all">{nftData.contractAddress}</code>
                </div>
                {nftData.attributes && nftData.attributes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Attributes</p>
                    <div className="flex flex-wrap gap-2">
                      {nftData.attributes.map((attr, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
