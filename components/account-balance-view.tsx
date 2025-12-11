"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Wallet, FileCode, Hash } from "lucide-react"

interface AccountInfo {
  address: string
  formattedAddress: string
  balance: string
  isContract: boolean
  blockNumber: number
}

export function AccountBalanceView() {
  const [address, setAddress] = useState("")
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!address) {
      setError("Please enter an address")
      return
    }

    setLoading(true)
    setError(null)
    setAccountInfo(null)

    try {
      const res = await fetch(`/api/account/info?address=${address}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setAccountInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch account information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter Ethereum address (0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
        />
        <Button onClick={handleLookup} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Lookup</span>
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {accountInfo && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm break-all">{accountInfo.address}</p>
              <p className="text-muted-foreground text-xs mt-1">{accountInfo.formattedAddress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{accountInfo.balance} ETH</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Account Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={accountInfo.isContract ? "secondary" : "default"}>
                {accountInfo.isContract ? "Contract" : "EOA (Externally Owned Account)"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Block</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-mono">{accountInfo.blockNumber?.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
