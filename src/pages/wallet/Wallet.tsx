import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import axiosInstance from '../../lib/axios'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Wallet, Transaction } from '../../types'

const WalletPage = () => {
  const queryClient = useQueryClient()
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('bank')
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  const { data: wallet } = useQuery<{ data: Wallet }>({
    queryKey: ['wallet'],
    queryFn: () => axiosInstance.get('/wallet/balance/'),
  })

  const { data: transactions } = useQuery<{ data: Transaction[] }>({
    queryKey: ['transactions'],
    queryFn: () => axiosInstance.get('/wallet/transactions/'),
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-gray-600">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-accent text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <WalletIcon className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-white/80">Total Balance</p>
                <h2 className="text-4xl font-bold">${wallet?.data?.balance?.toFixed(2) || '0.00'}</h2>
              </div>
            </div>
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="lg">
                  Withdraw Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Withdraw your earnings to your bank account or Raenest wallet
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Withdrawal Method</label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger>
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
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Withdraw
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-white/80">Total Deposits</p>
              <p className="text-xl font-semibold">$5,000.00</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-white/80">Total Withdrawals</p>
              <p className="text-xl font-semibold">$2,500.00</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-white/80">Pending</p>
              <p className="text-xl font-semibold">$0.00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="credits">Credits</TabsTrigger>
              <TabsTrigger value="debits">Debits</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {transactions?.data?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    {getStatusIcon(transaction.status)}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="credits">
              {transactions?.data
                ?.filter(t => t.type === 'credit')
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition">
                    {/* Similar structure as above */}
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="debits">
              {transactions?.data
                ?.filter(t => t.type === 'debit')
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition">
                    {/* Similar structure as above */}
                  </div>
                ))}
            </TabsContent>
          </Tabs>

          {transactions?.data?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WalletPage