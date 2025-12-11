// Client-safe utility functions (no API keys)
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
