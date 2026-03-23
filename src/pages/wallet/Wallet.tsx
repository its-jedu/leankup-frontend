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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import axiosInstance from '@/lib/axios'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface Transaction {
  id: number
  amount: number
  transaction_type: 'credit' | 'debit'
  status: 'pending' | 'completed' | 'failed'
  description: string
  reference: string
  created_at: string
}

interface WalletStats {
  balance: number
  total_deposits: number
  total_withdrawals: number
  pending_amount: number
  transaction_count: number
}

const WalletPage = () => {
  const queryClient = useQueryClient()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [fundAmount, setFundAmount] = useState('')
  const [withdrawMethod] = useState('bank')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isFundOpen, setIsFundOpen] = useState(false)
  const [isFunding, setIsFunding] = useState(false)

  // Fetch wallet stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['wallet-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/wallet/stats/')
      return response.data as WalletStats
    },
  })

  // Fetch transactions
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/wallet/transactions/')
      return response.data || []
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: (data: { 
      amount: number; 
      method: string; 
      bank_name: string; 
      bank_account_number: string; 
      bank_account_name: string;
      bank_code?: string;
    }) => 
      axiosInstance.post('/wallet/withdraw/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-stats'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setIsWithdrawOpen(false)
      setWithdrawAmount('')
      setBankName('')
      setBankAccountNumber('')
      setBankAccountName('')
      setBankCode('')
      showToast.success('Withdrawal Initiated', {
        description: 'Your withdrawal request has been processed successfully.'
      })
    },
    onError: (error: any) => {
      showToast.error('Withdrawal Failed', {
        description: error.response?.data?.error || Object.values(error.response?.data || {}).flat()[0] || 'Failed to process withdrawal'
      })
    },
  })

  const fundWalletMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await axiosInstance.post('/wallet/fund/', { amount })
      return response.data
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        // Store return URL in session storage
        sessionStorage.setItem('wallet_fund_return_url', '/wallet')
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url
      }
    },
    onError: (error: any) => {
      setIsFunding(false)
      showToast.error('Payment Initialization Failed', {
        description: error.response?.data?.error || 'Please try again'
      })
    },
  })

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast.error('Invalid Amount', {
        description: 'Please enter a valid amount'
      })
      return
    }
    if (amount > (stats?.balance || 0)) {
      showToast.error('Insufficient Balance', {
        description: `Your balance is ₦${(stats?.balance || 0).toLocaleString()}`
      })
      return
    }
    
    // Validate bank details
    if (!bankName.trim()) {
      showToast.error('Bank Name Required', {
        description: 'Please enter your bank name'
      })
      return
    }
    if (!bankAccountNumber.trim()) {
      showToast.error('Account Number Required', {
        description: 'Please enter your account number'
      })
      return
    }
    if (!bankAccountName.trim()) {
      showToast.error('Account Name Required', {
        description: 'Please enter the account holder name'
      })
      return
    }
    
    withdrawMutation.mutate({
      amount: amount,
      method: withdrawMethod,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_name: bankAccountName,
      bank_code: bankCode || undefined,
    })
  }

  const handleFundWallet = () => {
    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast.error('Invalid Amount', {
        description: 'Please enter a valid amount'
      })
      return
    }
    if (amount < 1000) {
      showToast.error('Minimum Amount', {
        description: 'Minimum funding amount is ₦1,000'
      })
      return
    }
    setIsFunding(true)
    fundWalletMutation.mutate(amount)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Completed</span>
      case 'pending':
        return <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">Pending</span>
      case 'failed':
        return <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Failed</span>
      default:
        return null
    }
  }

  const formatTransactionDescription = (description: string) => {
    if (description.includes('Escrow created for task:')) {
      return description.replace('Escrow created for task:', 'Task escrow created:')
    }
    if (description.includes('Payment received for task:')) {
      return description.replace('Payment received for task:', 'Payment received:')
    }
    if (description.includes('Escrow refund for deleted task:')) {
      return description.replace('Escrow refund for deleted task:', 'Refund:')
    }
    if (description.includes('Wallet funding for task creation')) {
      return 'Wallet funded for task creation'
    }
    if (description.includes('Wallet funding via Paystack')) {
      return 'Wallet funded'
    }
    if (description.includes('Withdrawal to')) {
      return 'Withdrawal'
    }
    return description
  }

  const isLoading = statsLoading || transactionsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-secondary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Wallet</h1>
          <p className="text-muted-foreground">Manage your earnings and transactions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            refetchStats()
            refetchTransactions()
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-secondary/90 dark:to-secondary/70 border-0 shadow-xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-background/20 p-3 rounded-xl">
                <WalletIcon className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80 dark:text-white/80">Total Balance</p>
                <h2 className="text-2xl md:text-4xl font-bold text-white dark:text-white">
                  ₦{(stats?.balance || 0).toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isFundOpen} onOpenChange={setIsFundOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90">
                    Fund Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Fund Wallet</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Add funds to your wallet to post tasks or make payments.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Amount (₦)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum amount: ₦1,000
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsFundOpen(false)
                      setFundAmount('')
                    }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleFundWallet}
                      disabled={isFunding || !fundAmount || parseFloat(fundAmount) < 1000}
                      className="bg-primary text-white hover:bg-primary/90 dark:bg-secondary dark:text-background dark:hover:bg-secondary/90"
                    >
                      {isFunding ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90">
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Withdraw Funds</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Withdraw your earnings to your bank account.
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
                      <p className="text-xs text-muted-foreground">
                        Available balance: ₦{(stats?.balance || 0).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Bank Name</label>
                      <Input
                        placeholder="e.g., First Bank, GTBank, etc."
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Account Number</label>
                      <Input
                        type="text"
                        placeholder="Enter your 10-digit account number"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="bg-background border-border text-foreground"
                        maxLength={10}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Account Name</label>
                      <Input
                        placeholder="Account holder's full name"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Bank Code (Optional)</label>
                      <Input
                        placeholder="Bank code (if known)"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Bank code helps speed up the processing. You can leave it blank if not sure.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsWithdrawOpen(false)
                      setWithdrawAmount('')
                      setBankName('')
                      setBankAccountNumber('')
                      setBankAccountName('')
                      setBankCode('')
                    }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (stats?.balance || 0) || withdrawMutation.isPending || !bankName || !bankAccountNumber || !bankAccountName}
                      className="bg-primary text-white hover:bg-primary/90 dark:bg-secondary dark:text-background dark:hover:bg-secondary/90"
                    >
                      {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/20 dark:bg-background/20 rounded-lg p-3 md:p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-3 w-3 text-white dark:text-white/90" />
                <p className="text-xs text-white dark:text-white/90">Total Deposits</p>
              </div>
              <p className="text-base md:text-xl font-semibold text-white dark:text-white">
                ₦{(stats?.total_deposits || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/20 dark:bg-background/20 rounded-lg p-3 md:p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-white dark:text-white/90" />
                <p className="text-xs text-white dark:text-white/90">Total Withdrawals</p>
              </div>
              <p className="text-base md:text-xl font-semibold text-white dark:text-white">
                ₦{(stats?.total_withdrawals || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/20 dark:bg-background/20 rounded-lg p-3 md:p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-white dark:text-white/90" />
                <p className="text-xs text-white dark:text-white/90">Pending</p>
              </div>
              <p className="text-base md:text-xl font-semibold text-white dark:text-white">
                ₦{(stats?.pending_amount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Transaction History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing your personal transaction history
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4 bg-muted">
              <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:text-foreground">All Transactions</TabsTrigger>
              <TabsTrigger value="credits" className="text-muted-foreground data-[state=active]:text-foreground">Deposits & Earnings</TabsTrigger>
              <TabsTrigger value="debits" className="text-muted-foreground data-[state=active]:text-foreground">Withdrawals & Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-muted/50 transition border border-border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-muted p-2 rounded-lg">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm md:text-base text-foreground">
                          {formatTransactionDescription(transaction.description)}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()} • {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm md:text-base ${
                        transaction.transaction_type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}₦{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <WalletIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="credits" className="space-y-3">
              {transactions && transactions.filter((t: Transaction) => t.transaction_type === 'credit').length > 0 ? (
                transactions
                  .filter((t: Transaction) => t.transaction_type === 'credit')
                  .map((transaction: Transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-muted/50 transition border border-border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-green-500/10 dark:bg-green-500/20 p-2 rounded-lg">
                          <ArrowDownLeft className="h-5 w-5 text-green-500 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm md:text-base text-foreground">
                            {formatTransactionDescription(transaction.description)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600 dark:text-green-400">+₦{Math.abs(transaction.amount).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <ArrowDownLeft className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No deposits or earnings yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Credits appear when you receive payments or fund your wallet
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="debits" className="space-y-3">
              {transactions && transactions.filter((t: Transaction) => t.transaction_type === 'debit').length > 0 ? (
                transactions
                  .filter((t: Transaction) => t.transaction_type === 'debit')
                  .map((transaction: Transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-muted/50 transition border border-border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-red-500/10 dark:bg-red-500/20 p-2 rounded-lg">
                          <ArrowUpRight className="h-5 w-5 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm md:text-base text-foreground">
                            {formatTransactionDescription(transaction.description)}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-red-600 dark:text-red-400">-₦{Math.abs(transaction.amount).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <ArrowUpRight className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No withdrawals or payments yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Debits appear when you fund escrow or make withdrawals
                  </p>
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