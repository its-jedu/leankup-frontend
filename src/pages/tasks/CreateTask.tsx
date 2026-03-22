import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import axiosInstance from '../../lib/axios'
import { ArrowLeft, AlertCircle, Wallet, CheckCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'

const taskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['cleaning', 'delivery', 'moving', 'repair', 'tutoring', 'other']),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  location: z.string().min(3, 'Location is required'),
})

type TaskFormData = z.infer<typeof taskSchema>

const CreateTask = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [showInsufficientFundsDialog, setShowInsufficientFundsDialog] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isCreatingAfterPayment, setIsCreatingAfterPayment] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      category: 'other',
    },
  })

  // Check for payment success on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const paymentSuccess = urlParams.get('payment') === 'success'
    const reference = urlParams.get('reference')
    
    if (paymentSuccess && reference) {
      // Payment was successful, check if we have pending task data
      const pendingTaskData = sessionStorage.getItem('pending_task_data')
      if (pendingTaskData) {
        const taskData = JSON.parse(pendingTaskData)
        // Restore form data
        reset(taskData)
        // Clear pending data
        sessionStorage.removeItem('pending_task_data')
        // Show success message
        showToast.success('Payment Successful!', {
          description: 'Your wallet has been funded. You can now create your task.'
        })
        // Remove payment params from URL without reloading
        window.history.replaceState({}, '', '/tasks/create')
      }
    }
  }, [location, reset])

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => axiosInstance.post('/tasks/', data),
    onSuccess: (response) => {
      // Clear any stored task data
      sessionStorage.removeItem('pending_task_data')
      // Task created successfully with escrow
      if (response.data.escrow) {
        showToast.success('Task Created!', {
          description: `Your task has been created and ₦${response.data.task.budget.toLocaleString()} has been moved to escrow.`
        })
      }
      navigate(`/tasks/${response.data.task.id}`)
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      
      if (errorData?.requires_payment) {
        // User has insufficient funds - store task data and show payment dialog
        const currentFormData = watch()
        // Store task data in session storage
        sessionStorage.setItem('pending_task_data', JSON.stringify(currentFormData))
        setPaymentData(errorData)
        setShowInsufficientFundsDialog(true)
      } else {
        setError(errorData?.detail || 'Failed to create task')
        showToast.error('Failed to Create Task', {
          description: errorData?.detail || 'Please try again'
        })
      }
    },
  })

  const handleFundWallet = () => {
    const formData = watch()
    // Store task data in session storage before navigating
    sessionStorage.setItem('pending_task_data', JSON.stringify(formData))
    // Navigate to wallet funding page with task data
    navigate('/wallet/fund', { 
      state: { 
        requiredAmount: paymentData?.required_amount,
        returnUrl: '/tasks/create',
      }
    })
  }

  const handlePayNow = async () => {
    setIsProcessingPayment(true)
    try {
      const formData = watch()
      // Store task data in session storage
      sessionStorage.setItem('pending_task_data', JSON.stringify(formData))
      
      const response = await axiosInstance.post('/payments/initialize/', {
        amount: formData.budget,
        payment_type: 'wallet_funding',
        metadata: {
          return_url: '/tasks/create',
          task_data: formData
        }
      })
      
      if (response.data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      }
    } catch (error: any) {
      showToast.error('Payment Error', {
        description: error.response?.data?.error || 'Failed to initialize payment'
      })
      // Clear stored data on error
      sessionStorage.removeItem('pending_task_data')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleCreateAfterFunding = async () => {
    setIsCreatingAfterPayment(true)
    try {
      const pendingTaskData = sessionStorage.getItem('pending_task_data')
      if (pendingTaskData) {
        const taskData = JSON.parse(pendingTaskData)
        // Create the task with the stored data
        await createTaskMutation.mutateAsync(taskData)
      } else {
        showToast.error('No Task Data Found', {
          description: 'Please fill in the task details again.'
        })
      }
    } catch (error) {
      console.error('Error creating task after funding:', error)
    } finally {
      setIsCreatingAfterPayment(false)
    }
  }

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data)
  }

  // Check if we have pending task data and should auto-create after payment
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const paymentSuccess = urlParams.get('payment') === 'success'
    const pendingTaskData = sessionStorage.getItem('pending_task_data')
    
    if (paymentSuccess && pendingTaskData && !isCreatingAfterPayment) {
      handleCreateAfterFunding()
    }
  }, [location.search])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition">
        <ArrowLeft className="h-4 w-4" />
        Back to Tasks
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Post a New Task</CardTitle>
          <p className="text-muted-foreground">Fill in the details below to create your task listing</p>
          <div className="mt-2 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 inline mr-1" />
              Note: The task budget will be held in escrow until the task is completed.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Task Title</label>
              <Input
                {...register('title')}
                placeholder="e.g., Need help moving furniture"
                className="bg-background border-border text-foreground"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Describe the task in detail..."
                rows={5}
                className="bg-background border-border text-foreground"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select onValueChange={(value: any) => setValue('category', value)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="moving">Moving</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Budget (₦)</label>
                <Input
                  type="number"
                  {...register('budget', { valueAsNumber: true })}
                  placeholder="1000"
                  className="bg-background border-border text-foreground"
                />
                {errors.budget && (
                  <p className="text-sm text-destructive">{errors.budget.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input
                {...register('location')}
                placeholder="e.g., New York, NY"
                className="bg-background border-border text-foreground"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={createTaskMutation.isPending || isCreatingAfterPayment}
              >
                {createTaskMutation.isPending || isCreatingAfterPayment ? 'Creating...' : 'Post Task'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Insufficient Funds Dialog */}
      <Dialog open={showInsufficientFundsDialog} onOpenChange={setShowInsufficientFundsDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Insufficient Wallet Balance
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You don't have enough funds in your wallet to create this task.
            </DialogDescription>
          </DialogHeader>
          
          {paymentData && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Task Budget:</span>
                  <span className="font-semibold text-foreground">₦{parseFloat(paymentData.required_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-semibold text-foreground">₦{parseFloat(paymentData.current_balance).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">Shortfall:</span>
                  <span className="font-semibold text-destructive">₦{parseFloat(paymentData.shortfall).toLocaleString()}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {paymentData.message}
              </p>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleFundWallet}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Fund Wallet
                </Button>
                <Button 
                  onClick={handlePayNow}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Processing...' : 'Pay Now with Card'}
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowInsufficientFundsDialog(false)
                sessionStorage.removeItem('pending_task_data')
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateTask