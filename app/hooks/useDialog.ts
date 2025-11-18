import { useState, useCallback } from 'react'

interface DialogState {
  open: boolean
  title: string
  description?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: 'default' | 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
}

const initialState: DialogState = {
  open: false,
  title: '',
  description: '',
  variant: 'default',
  confirmText: 'Confirm',
  cancelText: 'Cancel'
}

export function useDialog() {
  const [dialogState, setDialogState] = useState<DialogState>(initialState)

  const openDialog = useCallback((config: Omit<DialogState, 'open'>) => {
    setDialogState({
      ...initialState,
      ...config,
      open: true
    })
  }, [])

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, open: false }))
  }, [])

  const confirmDialog = useCallback(() => {
    dialogState.onConfirm?.()
    closeDialog()
  }, [dialogState.onConfirm, closeDialog])

  const cancelDialog = useCallback(() => {
    dialogState.onCancel?.()
    closeDialog()
  }, [dialogState.onCancel, closeDialog])

  return {
    dialogState,
    openDialog,
    closeDialog,
    confirmDialog,
    cancelDialog
  }
}

// Convenience functions for common dialog types
export function useConfirmDialog() {
  const { dialogState, openDialog, closeDialog, confirmDialog, cancelDialog } = useDialog()

  const confirm = useCallback((
    title: string,
    description?: string,
    onConfirm?: () => void,
    options?: {
      variant?: 'default' | 'danger' | 'warning' | 'info'
      confirmText?: string
      cancelText?: string
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      openDialog({
        title,
        description,
        variant: options?.variant || 'default',
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        onConfirm: () => {
          onConfirm?.()
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        }
      })
    })
  }, [openDialog])

  return {
    dialogState,
    closeDialog,
    confirmDialog,
    cancelDialog,
    confirm
  }
}

export function useSuccessDialog() {
  const { dialogState, openDialog, closeDialog, confirmDialog } = useDialog()

  const showSuccess = useCallback((
    title: string,
    description?: string,
    onConfirm?: () => void,
    confirmText?: string
  ) => {
    openDialog({
      title,
      description,
      confirmText: confirmText || 'Continue',
      onConfirm
    })
  }, [openDialog])

  return {
    dialogState,
    closeDialog,
    confirmDialog,
    showSuccess
  }
}
