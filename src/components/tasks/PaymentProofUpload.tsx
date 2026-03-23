import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { showToast } from '@/lib/toast'

interface PaymentProofUploadProps {
  taskId: number
  taskTitle: string
  taskBudget: number
  isPoster: boolean
  isAcceptedApplicant: boolean
}

const PaymentProofUpload = ({ taskId, taskBudget, isPoster, isAcceptedApplicant }: PaymentProofUploadProps) => {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [amount, setAmount] = useState(taskBudget.toString())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post(`/tasks/${taskId}/upload_payment_proof/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task-payment-proofs', taskId] })
      setOpen(false)
      resetForm()
      showToast.success('Payment Proof Uploaded', {
        description: 'Your payment proof has been uploaded and is pending verification'
      })
    },
    onError: (error: any) => {
      showToast.error('Upload Failed', {
        description: error.response?.data?.error || 'Failed to upload payment proof'
      })
    }
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      showToast.error('No File Selected', {
        description: 'Please select an image to upload'
      })
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum !== taskBudget) {
      showToast.error('Invalid Amount', {
        description: `Amount must match the task budget: ₦${taskBudget.toLocaleString()}`
      })
      return
    }

    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('caption', caption)
    formData.append('amount', amount)

    uploadMutation.mutate(formData)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreview(null)
    setCaption('')
    setAmount(taskBudget.toString())
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Only show upload button if user is either poster or accepted applicant
  if (!isPoster && !isAcceptedApplicant) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
          <Upload className="h-4 w-4" />
          Upload Payment Proof
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Payment Proof</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!preview ? (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Amount (₦)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Task budget: ₦${taskBudget.toLocaleString()}`}
              className="bg-background border-border text-foreground"
            />
            {parseFloat(amount) !== taskBudget && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Amount must match the task budget: ₦{taskBudget.toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Caption (Optional)</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a note about this payment..."
              rows={3}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending || parseFloat(amount) !== taskBudget}
              className="flex-1"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Proof'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentProofUpload