import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Wallet, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Clock, Lock } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { showToast } from '@/lib/toast'

interface EscrowInfo {
  has_escrow: boolean
  id?: number
  amount?: string
  status?: string
  funded_at?: string
  released_at?: string
  created_at?: string
  can_fund?: boolean
  can_release?: boolean
  can_refund?: boolean
}

interface EscrowManagerProps {
  taskId: number
  taskTitle: string
  taskBudget: number
  taskStatus: string
  isPoster: boolean
  isAcceptedApplicant: boolean
}

const EscrowManager = ({ taskId, taskBudget, taskStatus, isPoster, isAcceptedApplicant }: EscrowManagerProps) => {
  const [fundAmount, setFundAmount] = useState(taskBudget.toString())
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false)
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: escrowInfo, isLoading, refetch } = useQuery({
    queryKey: ['task-escrow', taskId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${taskId}/escrow_info/`)
      return response.data as EscrowInfo
    },
    enabled: !!taskId && isPoster, // Only fetch if user is poster
  })

  const fundEscrowMutation = useMutation({
    mutationFn: (amount: number) => axiosInstance.post(`/tasks/${taskId}/fund_escrow/`, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-escrow', taskId] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      setIsFundDialogOpen(false)
      refetch()
      showToast.success('Escrow Funded', {
        description: `₦${parseFloat(fundAmount).toLocaleString()} has been moved to escrow`
      })
    },
    onError: (error: any) => {
      showToast.error('Funding Failed', {
        description: error.response?.data?.error || 'Failed to fund escrow'
      })
    }
  })

  const releasePaymentMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/tasks/${taskId}/release_payment/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-escrow', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      setIsReleaseDialogOpen(false)
      refetch()
      showToast.success('Payment Released', {
        description: `Payment has been released to the worker`
      })
    },
    onError: (error: any) => {
      showToast.error('Release Failed', {
        description: error.response?.data?.error || 'Failed to release payment'
      })
    }
  })

  const refundPaymentMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/tasks/${taskId}/refund_payment/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-escrow', taskId] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      setIsRefundDialogOpen(false)
      refetch()
      showToast.success('Refund Processed', {
        description: `₦${parseFloat(escrowInfo?.amount || '0').toLocaleString()} has been refunded to your wallet`
      })
    },
    onError: (error: any) => {
      showToast.error('Refund Failed', {
        description: error.response?.data?.error || 'Failed to process refund'
      })
    }
  })

  const handleFundEscrow = () => {
    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount !== taskBudget) {
      showToast.error('Invalid Amount', {
        description: `Amount must match task budget: ₦${taskBudget.toLocaleString()}`
      })
      return
    }
    fundEscrowMutation.mutate(amount)
  }

  const getStatusInfo = () => {
    if (!escrowInfo || !escrowInfo.has_escrow) return null

    switch (escrowInfo.status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: 'Awaiting Funding',
          description: 'You need to fund the escrow to activate this task',
          color: 'text-yellow-500'
        }
      case 'funded':
        return {
          icon: <Lock className="h-5 w-5 text-green-500" />,
          title: 'Escrow Funded',
          description: 'Payment is securely held in escrow until task completion',
          color: 'text-green-500'
        }
      case 'released':
        return {
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
          title: 'Payment Released',
          description: 'Payment has been released to the worker',
          color: 'text-blue-500'
        }
      case 'refunded':
        return {
          icon: <TrendingDown className="h-5 w-5 text-gray-500" />,
          title: 'Refunded',
          description: 'Funds have been refunded to your wallet',
          color: 'text-gray-500'
        }
      case 'disputed':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          title: 'Under Dispute',
          description: 'This transaction is under review',
          color: 'text-red-500'
        }
      default:
        return null
    }
  }

  // Only show for poster
  if (!isPoster) {
    return null
  }

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusInfo()

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Escrow Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!escrowInfo?.has_escrow ? (
          <div className="text-center py-6">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Escrow will be created when you post the task</p>
          </div>
        ) : (
          <>
            {/* Escrow Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {statusInfo?.icon}
                  <span className={`font-semibold ${statusInfo?.color}`}>
                    {statusInfo?.title}
                  </span>
                </div>
                <span className="text-2xl font-bold text-foreground">
                  ₦{parseFloat(escrowInfo.amount || '0').toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{statusInfo?.description}</p>
              {escrowInfo.funded_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Funded on: {new Date(escrowInfo.funded_at).toLocaleDateString()}
                </p>
              )}
              {escrowInfo.released_at && (
                <p className="text-xs text-muted-foreground">
                  Released on: {new Date(escrowInfo.released_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Progress Indicator */}
            {escrowInfo.status === 'funded' && taskStatus === 'in_progress' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="text-primary font-medium">Awaiting Completion</span>
                </div>
                <Progress value={50} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Funds will be released after the task is completed and payment proof is verified
                </p>
              </div>
            )}

            {escrowInfo.status === 'funded' && taskStatus === 'completed' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ready for Release</span>
                  <span className="text-green-500 font-medium">Task Completed</span>
                </div>
                <Progress value={100} className="h-2 bg-green-500/20" />
                <p className="text-xs text-muted-foreground text-center">
                  Task is completed. Ready to release payment to worker.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {escrowInfo.can_fund && (
              <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                    <Wallet className="h-4 w-4" />
                    Fund Escrow
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Fund Escrow</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Amount (₦)</label>
                      <Input
                        type="number"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder={`Task budget: ₦${taskBudget.toLocaleString()}`}
                        className="bg-background border-border text-foreground"
                      />
                      {parseFloat(fundAmount) !== taskBudget && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Amount must match the task budget: ₦{taskBudget.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsFundDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleFundEscrow}
                        disabled={parseFloat(fundAmount) !== taskBudget || fundEscrowMutation.isPending}
                        className="flex-1"
                      >
                        {fundEscrowMutation.isPending ? 'Processing...' : 'Fund Escrow'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {escrowInfo.can_release && taskStatus === 'completed' && (
              <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Release Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Release Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Are you sure you want to release ₦{parseFloat(escrowInfo.amount || '0').toLocaleString()} to the worker?
                      This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => releasePaymentMutation.mutate()}
                        disabled={releasePaymentMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {releasePaymentMutation.isPending ? 'Processing...' : 'Release Payment'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {escrowInfo.can_refund && (
              <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                    <XCircle className="h-4 w-4" />
                    Request Refund
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Request Refund</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Are you sure you want to request a refund of ₦{parseFloat(escrowInfo.amount || '0').toLocaleString()}?
                      This will cancel the task and return the funds to your wallet.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => refundPaymentMutation.mutate()}
                        disabled={refundPaymentMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        {refundPaymentMutation.isPending ? 'Processing...' : 'Request Refund'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default EscrowManager