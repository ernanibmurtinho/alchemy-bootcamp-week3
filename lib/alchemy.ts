// Server-side only - do not import in client components
import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from "alchemy-sdk"

const apiKey = process.env.ALCHEMY_API_KEY
const networkEnv = process.env.ALCHEMY_NETWORK || "mainnet"

// Map environment variable to Alchemy Network
const networkMapConfig: Record<string, Network> = {
  mainnet: Network.ETH_MAINNET,
  sepolia: Network.ETH_SEPOLIA,
  goerli: Network.ETH_GOERLI,
}

const selectedNetwork = networkMapConfig[networkEnv] || Network.ETH_MAINNET

// Alchemy SDK settings with connection config for server-side usage
const settings = {
  apiKey,
  network: selectedNetwork,
  connectionInfoOverrides: {
    skipFetchSetup: true, // Fix for server-side environments
  },
}

console.log(`Alchemy SDK: network=${networkEnv}, apiKey=${apiKey ? "present" : "missing"}`)

export const alchemy = new Alchemy(settings)

export const formatEther = (value: string | bigint | number | null | undefined): string => {
  if (!value) return "0"
  try {
    const wei = typeof value === "string" ? value : value.toString()
    const weiBigInt = BigInt(wei)
    const divisor = BigInt("1000000000000000000")
    const eth = weiBigInt / divisor
    const remainder = weiBigInt % divisor

    if (remainder === BigInt(0)) {
      return eth.toString()
    }

    const decimals = remainder.toString().padStart(18, "0")
    const trimmedDecimals = decimals.replace(/0+$/, "")
    return `${eth.toString()}.${trimmedDecimals}`
  } catch {
    return value?.toString() || "0"
  }
}

export const formatAddress = (address: string | null | undefined): string => {
  if (!address) return ""
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatTimestamp = (timestamp: number | string | null | undefined): string => {
  if (!timestamp) return "N/A"
  try {
    const ts = typeof timestamp === "string" ? Number.parseInt(timestamp) : timestamp
    const date = new Date(ts * 1000)
    return date.toLocaleString()
  } catch {
    return timestamp?.toString() || "N/A"
  }
}

export const NETWORK_MAP: Record<string, Network> = {
  mainnet: Network.ETH_MAINNET,
  goerli: Network.ETH_GOERLI,
  sepolia: Network.ETH_SEPOLIA,
}

export function createAlchemyClient(networkKey = "sepolia"): Alchemy {
  const clientSettings = {
    apiKey,
    network: NETWORK_MAP[networkKey] || Network.ETH_SEPOLIA,
    connectionInfoOverrides: {
      skipFetchSetup: true,
    },
  }
  return new Alchemy(clientSettings)
}

export { AssetTransfersCategory, SortingOrder }
