import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Wallet } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { showToast } from '@/lib/toast'

const FundWallet = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const requiredAmount = location.state?.requiredAmount
  const returnUrl = location.state?.returnUrl || '/wallet'

  useEffect(() => {
    if (requiredAmount) {
      setAmount(requiredAmount.toString())
    }
  }, [requiredAmount])

  // Check for payment success on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const paymentSuccess = urlParams.get('payment') === 'success'
    const reference = urlParams.get('reference')
    
    if (paymentSuccess && reference) {
      // Payment was successful, redirect back to returnUrl
      showToast.success('Payment Successful!', {
        description: 'Your wallet has been funded successfully.'
      })
      // Navigate back to the return URL (which is /tasks/create)
      navigate(returnUrl)
    }
  }, [location, navigate, returnUrl])

  const fundWalletMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await axiosInstance.post('/payments/initialize/', {
        amount: data.amount,
        payment_type: 'wallet_funding',
        metadata: {
          return_url: returnUrl,
        }
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url
      }
    },
    onError: (error: any) => {
      showToast.error('Payment Initialization Failed', {
        description: error.response?.data?.error || 'Please try again'
      })
    }
  })

  const handleFund = () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast.error('Invalid Amount', {
        description: 'Please enter a valid amount'
      })
      return
    }
    
    if (requiredAmount && amountNum < requiredAmount) {
      showToast.error('Insufficient Amount', {
        description: `You need to fund at least ₦${requiredAmount.toLocaleString()} to create your task`
      })
      return
    }
    
    fundWalletMutation.mutate({ amount: amountNum })
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(returnUrl)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Fund Your Wallet</CardTitle>
          {requiredAmount && (
            <p className="text-muted-foreground">
              You need at least ₦{requiredAmount.toLocaleString()} to create your task
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount (₦)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="bg-background border-border text-foreground"
            />
            {requiredAmount && (
              <p className="text-xs text-muted-foreground">
                Minimum: ₦{requiredAmount.toLocaleString()}
              </p>
            )}
          </div>

          <Button
            onClick={handleFund}
            disabled={fundWalletMutation.isPending || !amount}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {fundWalletMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You will be redirected to Paystack to complete your payment securely
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default FundWallet