import { toast } from 'sonner'

interface ToastOptions {
  description?: string
  duration?: number
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      description: options?.description,
      duration: options?.duration || 2000,
      position: 'top-right',
    })
  },
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      description: options?.description,
      duration: options?.duration || 2000,
      position: 'top-right',
    })
  },
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, {
      description: options?.description,
      duration: options?.duration || 2000,
      position: 'top-right',
    })
  },
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 2000,
      position: 'top-right',
    })
  },
}