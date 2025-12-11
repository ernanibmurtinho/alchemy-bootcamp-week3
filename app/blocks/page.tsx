"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Blocks, X, Loader2 } from "lucide-react"
import { formatAddress } from "@/lib/format-utils"

interface Block {
  number: number
  hash: string
  parentHash: string
  timestamp: number
  gasUsed: string
  gasLimit: string
  transactionCount: number
  formattedHash: string
  transactions: Transaction[]
}

interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  gasLimit?: string
  nonce?: number
  formattedFrom: string
  formattedTo: string | null
  receipt?: {
    blockNumber: number
    gasUsed: string
    status: number
  }
}

export default function BlocksPage() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    async function fetchLatestBlocks() {
      try {
        const res = await fetch("/api/blocks/with-transactions")
        const data = await res.json()

        if (data.error) {
          console.error("Error fetching blocks:", data.error)
          return
        }

        setBlockNumber(data.blockNumber)
        setBlocks(data.blocks)
      } catch (error) {
        console.error("Error fetching blocks:", error)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchLatestBlocks()
  }, [])

  const handleBlockClick = async (blockNum: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/blocks/with-transactions?blockNumber=${blockNum}`)
      const block = await res.json()

      if (block.error) {
        console.error("Error fetching block:", block.error)
        return
      }

      setSelectedBlock(block)
      setSelectedTransaction(null)
    } catch (error) {
      console.error("Error fetching block:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionClick = async (txHash: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/transaction?hash=${txHash}`)
      const tx = await res.json()

      if (tx.error) {
        console.error("Error fetching transaction:", tx.error)
        return
      }

      setSelectedTransaction({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gasLimit: tx.gasUsed,
        formattedFrom: formatAddress(tx.from),
        formattedTo: tx.to ? formatAddress(tx.to) : null,
        receipt: {
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          status: tx.status === "success" ? 1 : 0,
        },
      })
    } catch (error) {
      console.error("Error fetching transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Blocks className="h-8 w-8 text-primary" />
          Ethereum Block Explorer
        </h1>
        {blockNumber && (
          <p className="text-muted-foreground">
            Current Block: <span className="text-primary font-mono">{blockNumber.toLocaleString()}</span>
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Blocks List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Latest Blocks</h2>
          <div className="space-y-3">
            {blocks.map((block) => (
              <Card
                key={block.number}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleBlockClick(block.number)}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono">Block #{block.number?.toLocaleString()}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {block.transactionCount || 0} txns
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-4 pt-0">
                  <p className="text-xs text-muted-foreground">Hash: {block.formattedHash}</p>
                  <p className="text-xs text-muted-foreground">{new Date(block.timestamp * 1000).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Block Details */}
        <div className="lg:col-span-2">
          {selectedBlock ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Block #{selectedBlock.number?.toLocaleString()}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedBlock(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Hash</p>
                    <p className="font-mono text-xs break-all">{selectedBlock.hash}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parent Hash</p>
                    <p className="font-mono text-xs break-all">{selectedBlock.parentHash}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="text-sm">{new Date(selectedBlock.timestamp * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gas Used / Limit</p>
                    <p className="text-sm">
                      {selectedBlock.gasUsed} / {selectedBlock.gasLimit}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Transactions ({selectedBlock.transactions?.length || 0})
                  </h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {selectedBlock.transactions?.map((tx, index) => (
                        <Card
                          key={tx.hash || index}
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => handleTransactionClick(tx.hash)}
                        >
                          <CardContent className="py-3 px-4">
                            <p className="text-xs font-mono text-primary">
                              {tx.formattedFrom ? formatAddress(tx.hash) : tx.hash?.slice(0, 10) + "..."}
                            </p>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                              <span>From: {tx.formattedFrom}</span>
                              <span>To: {tx.formattedTo || "Contract Creation"}</span>
                              <span>{tx.value} ETH</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center text-muted-foreground">
                <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a block to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Transaction Details Modal */}
          {selectedTransaction && (
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Transaction Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTransaction(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Hash</p>
                    <p className="font-mono text-xs break-all">{selectedTransaction.hash}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-mono text-xs break-all">{selectedTransaction.from}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-mono text-xs break-all">{selectedTransaction.to || "Contract Creation"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Value</p>
                    <p className="text-sm">{selectedTransaction.value} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gas Limit</p>
                    <p className="text-sm">{selectedTransaction.gasLimit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nonce</p>
                    <p className="text-sm">{selectedTransaction.nonce}</p>
                  </div>
                  {selectedTransaction.receipt && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Block Number</p>
                        <p className="text-sm">{selectedTransaction.receipt.blockNumber?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={selectedTransaction.receipt.status === 1 ? "default" : "destructive"}>
                          {selectedTransaction.receipt.status === 1 ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gas Used</p>
                        <p className="text-sm">{selectedTransaction.receipt.gasUsed}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
