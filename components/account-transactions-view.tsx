"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Loader2, Search } from "lucide-react"

interface Transfer {
  hash: string
  from: string | null
  to: string | null
  value: number | null
  asset: string | null
  category: string
  blockNum: string
  formattedFrom: string
  formattedTo: string
  timestamp: string | null
}

export function AccountTransactionsView() {
  const [address, setAddress] = useState("")
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!address) {
      setError("Please enter an address")
      return
    }

    setLoading(true)
    setError(null)
    setTransfers([])

    try {
      const res = await fetch(`/api/account/transactions?address=${address}&filter=${filter}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setTransfers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  const getTransferType = (transfer: Transfer) => {
    if (transfer.category === "external") return "External"
    if (transfer.category === "internal") return "Internal"
    if (transfer.category === "erc20") return "ERC-20"
    if (transfer.category === "erc721") return "ERC-721"
    if (transfer.category === "erc1155") return "ERC-1155"
    return "Unknown"
  }

  const getTransferDirection = (transfer: Transfer) => {
    if (transfer.from?.toLowerCase() === address.toLowerCase()) return "Sent"
    if (transfer.to?.toLowerCase() === address.toLowerCase()) return "Received"
    return "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="text"
          placeholder="Enter Ethereum address (0x...)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 font-mono"
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
          </SelectContent>
        </Select>
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

      {transfers.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getTransferType(transfer)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTransferDirection(transfer) === "Sent" ? "destructive" : "default"}>
                          {getTransferDirection(transfer)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{transfer.formattedFrom}</TableCell>
                      <TableCell className="font-mono text-xs">{transfer.formattedTo}</TableCell>
                      <TableCell className="text-xs">
                        {transfer.value ? `${transfer.value} ${transfer.asset || "ETH"}` : "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {transfer.blockNum ? Number.parseInt(transfer.blockNum, 16).toLocaleString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {transfer.timestamp ? new Date(transfer.timestamp).toLocaleString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {!loading && transfers.length === 0 && address && !error && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No transactions found</CardContent>
        </Card>
      )}
    </div>
  )
}
