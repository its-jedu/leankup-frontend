import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react'
import axiosInstance from '@/lib/axios'
import { showToast } from '@/lib/toast'

interface PaymentProof {
  id: number
  image_url: string
  caption: string
  amount: string
  status: 'pending' | 'verified' | 'rejected'
  sender_username: string
  receiver_username: string
  created_at: string
  verified_at: string | null
}

interface PaymentProofListProps {
  taskId: number
  taskTitle: string
  isPoster: boolean
  isAcceptedApplicant: boolean
}

const PaymentProofList = ({ taskId, taskTitle, isPoster, isAcceptedApplicant }: PaymentProofListProps) => {
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null)
  const [verifyNotes, setVerifyNotes] = useState('')
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)
  const [verifyAction, setVerifyAction] = useState<'verify' | 'reject'>('verify')
  const queryClient = useQueryClient()

  const { data: paymentProofs, isLoading } = useQuery({
    queryKey: ['task-payment-proofs', taskId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tasks/${taskId}/payment_proofs/`)
      return response.data || []
    },
    enabled: !!taskId,
  })

  const verifyMutation = useMutation({
    mutationFn: ({ proofId, status, notes }: { proofId: number; status: 'verified' | 'rejected'; notes?: string }) =>
      axiosInstance.post(`/tasks/${taskId}/verify_payment_proof/`, {
        proof_id: proofId,
        status,
        notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-payment-proofs', taskId] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      setIsVerifyOpen(false)
      setVerifyNotes('')
      setSelectedProof(null)
      showToast.success('Payment Proof Verified', {
        description: 'The payment proof has been processed'
      })
    },
    onError: (error: any) => {
      showToast.error('Verification Failed', {
        description: error.response?.data?.error || 'Failed to verify payment proof'
      })
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Verified</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const handleVerify = (proof: PaymentProof, action: 'verify' | 'reject') => {
    setSelectedProof(proof)
    setVerifyAction(action)
    setVerifyNotes('')
    setIsVerifyOpen(true)
  }

  const submitVerification = () => {
    if (selectedProof) {
      verifyMutation.mutate({
        proofId: selectedProof.id,
        status: verifyAction === 'verify' ? 'verified' : 'rejected',
        notes: verifyNotes
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentProofs || paymentProofs.length === 0) {
    return null
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Payment Proofs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentProofs.map((proof: PaymentProof) => (
          <div key={proof.id} className="border border-border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(proof.status)}
                <span className="font-medium text-foreground">{proof.sender_username}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(proof.created_at).toLocaleDateString()}
                </span>
              </div>
              {getStatusBadge(proof.status)}
            </div>

            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="w-20 h-20 bg-muted rounded-lg cursor-pointer overflow-hidden">
                    <img
                      src={proof.image_url}
                      alt="Payment proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Payment Proof</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img
                      src={proof.image_url}
                      alt="Payment proof full size"
                      className="w-full rounded-lg"
                    />
                    {proof.caption && (
                      <p className="text-muted-foreground">{proof.caption}</p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount: ₦{parseFloat(proof.amount).toLocaleString()}</span>
                      <span className="text-muted-foreground">Uploaded by: {proof.sender_username}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.open(proof.image_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex-1">
                {proof.caption && (
                  <p className="text-sm text-muted-foreground mb-2">{proof.caption}</p>
                )}
                <p className="text-sm">
                  <span className="font-medium text-foreground">Amount:</span>{' '}
                  <span className="text-primary font-semibold">₦{parseFloat(proof.amount).toLocaleString()}</span>
                </p>
                {proof.verified_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Verified on {new Date(proof.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Verification actions - only visible to receiver */}
            {proof.status === 'pending' && isPoster && (
              <div className="mt-3 flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={() => handleVerify(proof, 'verify')}
                >
                  <CheckCircle className="h-3 w-3" />
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => handleVerify(proof, 'reject')}
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>

      {/* Verification Dialog */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {verifyAction === 'verify' ? 'Verify Payment Proof' : 'Reject Payment Proof'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProof && (
              <>
                <div className="border border-border rounded-lg p-3">
                  <img
                    src={selectedProof.image_url}
                    alt="Payment proof"
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Amount:</span> ₦{parseFloat(selectedProof.amount).toLocaleString()}
                  </p>
                  {selectedProof.caption && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedProof.caption}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Notes (Optional)</label>
                  <Textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    placeholder="Add any notes about this verification..."
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsVerifyOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitVerification}
                    className={`flex-1 ${verifyAction === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    disabled={verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? 'Processing...' : verifyAction === 'verify' ? 'Verify & Release Payment' : 'Reject Payment'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default PaymentProofList