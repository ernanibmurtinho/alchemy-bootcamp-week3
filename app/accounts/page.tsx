"use client"

import { Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountBalanceView } from "@/components/account-balance-view"
import { AccountTransactionsView } from "@/components/account-transactions-view"

export default function AccountsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Account Lookup
        </h1>
        <p className="text-muted-foreground">
          Search for any Ethereum address to view balances and transaction history.
        </p>
      </div>

      <Tabs defaultValue="balance" className="max-w-4xl">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="balance">Balance & Block Info</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="balance" className="mt-6">
          <AccountBalanceView />
        </TabsContent>
        <TabsContent value="transactions" className="mt-6">
          <AccountTransactionsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
