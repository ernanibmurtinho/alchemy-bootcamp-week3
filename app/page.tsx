import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Blocks, Users, ImageIcon, ArrowRightLeft, FlaskConical, Search } from "lucide-react"

const features = [
  {
    href: "/blocks",
    icon: Blocks,
    title: "Blocks",
    description: "Explore recent blocks, transactions, and mining data on Ethereum testnets.",
  },
  {
    href: "/accounts",
    icon: Users,
    title: "Accounts",
    description: "Look up account balances, transaction history, and token holdings.",
  },
  {
    href: "/nft-lookup",
    icon: ImageIcon,
    title: "NFT Lookup",
    description: "Search for NFTs by contract address and token ID, view metadata and ownership.",
  },
  {
    href: "/transaction-status",
    icon: Search,
    title: "Transaction Status",
    description: "Check the status of any transaction by hash - pending, success, or failed.",
  },
  {
    href: "/transfers",
    icon: ArrowRightLeft,
    title: "Transfers",
    description: "Track ETH and token transfers across accounts and contracts.",
  },
  {
    href: "/playground",
    icon: FlaskConical,
    title: "Testnet Playground",
    description: "Send testnet ETH without MetaMask. Perfect for learning and experimenting.",
  },
]

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-balance">Ethereum Block Explorer</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          A learning-focused block explorer for the Alchemy Ethereum Bootcamp. Explore testnets, send transactions, and
          understand the blockchain.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group">
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-secondary/50">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
