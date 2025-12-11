import { SendEthForm } from "@/components/send-eth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertTriangle, Droplets, Shield } from "lucide-react"

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3 text-balance">Ethereum Testnet Playground</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
          Send ETH on Goerli or Sepolia without MetaMask – perfect for learning and experimenting.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] max-w-5xl mx-auto">
        {/* Left: Send Form */}
        <SendEthForm />

        {/* Right: Helper Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Faucet Links */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Get Testnet ETH</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Free ETH for testing on Sepolia and Goerli networks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Sepolia</p>
                <div className="flex flex-col gap-1">
                  <a
                    href="https://sepoliafaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    sepoliafaucet.com <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://www.alchemy.com/faucets/ethereum-sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Alchemy Sepolia Faucet <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Goerli</p>
                <div className="flex flex-col gap-1">
                  <a
                    href="https://goerlifaucet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    goerlifaucet.com <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://faucets.chain.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Chainlink Faucets <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Tips */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Safety Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Use only testnet wallets and private keys here.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Never paste a real mainnet private key.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Start with tiny amounts (0.01 ETH).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Double-check the recipient address before sending.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This tool exposes your private key in browser memory. Use only for testnet learning purposes.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
