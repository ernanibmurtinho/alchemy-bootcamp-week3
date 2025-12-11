"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, ExternalLink, Send } from "lucide-react"

type NetworkKey = "sepolia" | "goerli" | "mainnet"

interface TransactionResult {
  hash: string
  blockNumber?: number
  from?: string
  to?: string
  value?: string
  network?: string
}

const ETHERSCAN_URLS: Record<NetworkKey, string> = {
  sepolia: "https://sepolia.etherscan.io/tx",
  goerli: "https://goerli.etherscan.io/tx",
  mainnet: "https://etherscan.io/tx",
}

export function SendEthForm() {
  const [network, setNetwork] = useState<NetworkKey>("sepolia")
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; data?: TransactionResult; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/send-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toAddress,
          amountInETH: amount,
          privateKey,
          network,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setResult({ success: false, error: data.error || "Transaction failed" })
      } else {
        setResult({
          success: true,
          data: {
            hash: data.hash,
            blockNumber: data.blockNumber,
            from: data.from,
            to: data.to,
            value: data.value,
            network: data.network,
          },
        })
      }
    } catch (error) {
      setResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" })
    } finally {
      setIsLoading(false)
    }
  }

  const etherscanUrl = result?.data?.hash ? `${ETHERSCAN_URLS[network]}/${result.data.hash}` : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Send Testnet ETH
        </CardTitle>
        <CardDescription>Fill in the details below to send ETH on your chosen testnet.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Network Selection */}
          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select value={network} onValueChange={(v) => setNetwork(v as NetworkKey)}>
              <SelectTrigger id="network">
                <SelectValue placeholder="Select network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sepolia">Sepolia</SelectItem>
                <SelectItem value="goerli">Goerli</SelectItem>
                <SelectItem value="mainnet" className="text-destructive">
                  Mainnet (not recommended)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* To Address */}
          <div className="space-y-2">
            <Label htmlFor="toAddress">To Address</Label>
            <Input
              id="toAddress"
              placeholder="0x..."
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              required
              className="font-mono text-sm"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              placeholder="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Private Key */}
          <div className="space-y-2">
            <Label htmlFor="privateKey">Private Key (testnet only)</Label>
            <Textarea
              id="privateKey"
              placeholder="Enter your testnet wallet private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              required
              className="font-mono text-sm resize-none"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Warning: Never use a mainnet private key here. This is for testnet learning only.
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Testnet ETH"
            )}
          </Button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="mt-6">
            {result.success && result.data ? (
              <Alert className="bg-primary/10 border-primary/30">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Transaction Sent!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p className="text-sm break-all font-mono">Hash: {result.data.hash}</p>
                  {result.data.blockNumber && <p className="text-sm">Block: {result.data.blockNumber}</p>}
                  {etherscanUrl && (
                    <a
                      href={etherscanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View on Etherscan <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Transaction Failed</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
