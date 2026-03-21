import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import axiosInstance from '@/lib/axios'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Transaction } from '@/types'

interface WalletData {
  balance: number
  currency: string
}

const WalletPage = () => {
  const queryClient = useQueryClient()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('bank')
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  // Fetch wallet balance
  const { data: walletResponse, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await axiosInstance.get('/wallet/balance/')
      // Handle different response structures
      return response.data?.balance || response.data || 0
    },
  })

  // Fetch transactions
  const { data: transactionsResponse, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/wallet/transactions/')
      // Handle both paginated and direct array responses
      return response.data?.results || response.data || []
    },
  })

  // Ensure wallet balance is a number
  const walletBalance = typeof walletResponse === 'number' ? walletResponse : 0
  // Ensure transactions is an array
  const transactions = Array.isArray(transactionsResponse) ? transactionsResponse : []

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: number; method: string }) => 
      axiosInstance.post('/wallet/withdraw/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setIsWithdrawOpen(false)
      setWithdrawAmount('')
    },
  })

  const handleWithdraw = () => {
    withdrawMutation.mutate({
      amount: parseFloat(withdrawAmount),
      method: withdrawMethod,
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      case 'debit':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const isLoading = walletLoading || transactionsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate totals
  const totalDeposits = transactions
    .filter((t: Transaction) => t.type === 'credit' && t.status === 'completed')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  
  const totalWithdrawals = transactions
    .filter((t: Transaction) => t.type === 'debit' && t.status === 'completed')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  
  const pendingAmount = transactions
    .filter((t: Transaction) => t.status === 'pending')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-accent border-0">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <WalletIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Balance</p>
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  ₦{walletBalance.toLocaleString()}
                </h2>
              </div>
            </div>
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Withdraw Funds</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Withdraw your earnings to your bank account or Raenest wallet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Amount (₦)</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Withdrawal Method</label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="raenest">Raenest Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Withdraw
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/10 rounded-lg p-3 md:p-4">
              <p className="text-xs text-white/80">Total Deposits</p>
              <p className="text-base md:text-xl font-semibold text-white">₦{totalDeposits.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 md:p-4">
              <p className="text-xs text-white/80">Total Withdrawals</p>
              <p className="text-base md:text-xl font-semibold text-white">₦{totalWithdrawals.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 md:p-4">
              <p className="text-xs text-white/80">Pending</p>
              <p className="text-base md:text-xl font-semibold text-white">₦{pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:text-foreground">All</TabsTrigger>
              <TabsTrigger value="credits" className="text-muted-foreground data-[state=active]:text-foreground">Credits</TabsTrigger>
              <TabsTrigger value="debits" className="text-muted-foreground data-[state=active]:text-foreground">Debits</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-muted/50 transition border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm md:text-base text-foreground">{transaction.description}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()} • {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm md:text-base ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₦{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <WalletIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="credits" className="space-y-3">
              {transactions.filter((t: Transaction) => t.type === 'credit').length > 0 ? (
                transactions
                  .filter((t: Transaction) => t.type === 'credit')
                  .map((transaction: Transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-muted/50 transition border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-base text-foreground">{transaction.description}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">+₦{Math.abs(transaction.amount).toLocaleString()}</span>
                        {getStatusIcon(transaction.status)}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No credit transactions yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="debits" className="space-y-3">
              {transactions.filter((t: Transaction) => t.type === 'debit').length > 0 ? (
                transactions
                  .filter((t: Transaction) => t.type === 'debit')
                  .map((transaction: Transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-muted/50 transition border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-muted p-2 rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm md:text-base text-foreground">{transaction.description}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-red-600">-₦{Math.abs(transaction.amount).toLocaleString()}</span>
                        {getStatusIcon(transaction.status)}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No debit transactions yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default WalletPage