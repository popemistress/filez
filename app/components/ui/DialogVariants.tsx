'use client'

import { Fragment } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { AlertTriangle, X, Check, Info, Trash2 } from 'lucide-react'

// Base Dialog Props Interface
interface BaseDialogProps {
  open: boolean
  onClose: (value: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode
}

// Success Dialog - Centered with single action
interface SuccessDialogProps extends BaseDialogProps {
  onConfirm?: () => void
  confirmText?: string
}

export function SuccessDialog({ 
  open, 
  onClose, 
  title, 
  description, 
  onConfirm, 
  confirmText = "Continue" 
}: SuccessDialogProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose(false)
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-center shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100">
                <Check aria-hidden="true" className="size-6 text-green-600" />
              </div>
              <div className="mt-3 sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {confirmText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

// Confirmation Dialog - Two actions (Cancel/Confirm)
interface ConfirmationDialogProps extends BaseDialogProps {
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function ConfirmationDialog({ 
  open, 
  onClose, 
  title, 
  description, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = 'default'
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onClose(false)
  }

  const isDanger = variant === 'danger'

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-center shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div>
              <div className={`mx-auto flex size-12 items-center justify-center rounded-full ${
                isDanger ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {isDanger ? (
                  <AlertTriangle aria-hidden="true" className="size-6 text-red-600" />
                ) : (
                  <Info aria-hidden="true" className="size-6 text-blue-600" />
                )}
              </div>
              <div className="mt-3 sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-start-2 ${
                  isDanger 
                    ? 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600' 
                    : 'bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

// Alert Dialog - Left-aligned content with right-aligned buttons
interface AlertDialogProps extends BaseDialogProps {
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'danger' | 'info'
}

export function AlertDialog({ 
  open, 
  onClose, 
  title, 
  description, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = 'warning'
}: AlertDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onClose(false)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-500',
          Icon: Trash2
        }
      case 'info':
        return {
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-500',
          Icon: Info
        }
      default:
        return {
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-500',
          Icon: AlertTriangle
        }
    }
  }

  const { bgColor, iconColor, buttonColor, Icon } = getVariantStyles()

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${bgColor} sm:mx-0 sm:size-10`}>
                <Icon aria-hidden="true" className={`size-6 ${iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleConfirm}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs ${buttonColor} sm:ml-3 sm:w-auto`}
              >
                {confirmText}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {cancelText}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

// Dismissible Dialog - With X button in top-right
interface DismissibleDialogProps extends BaseDialogProps {
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'danger' | 'info'
  showActions?: boolean
}

export function DismissibleDialog({ 
  open, 
  onClose, 
  title, 
  description, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = 'warning',
  showActions = true,
  children
}: DismissibleDialogProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onClose(false)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-500',
          Icon: Trash2
        }
      case 'info':
        return {
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-500',
          Icon: Info
        }
      default:
        return {
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-500',
          Icon: AlertTriangle
        }
    }
  }

  const { bgColor, iconColor, buttonColor, Icon } = getVariantStyles()

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
          >
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
              >
                <span className="sr-only">Close</span>
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            
            {children ? (
              <div className="mt-3">
                {children}
              </div>
            ) : (
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${bgColor} sm:mx-0 sm:size-10`}>
                  <Icon aria-hidden="true" className={`size-6 ${iconColor}`} />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                    {title}
                  </DialogTitle>
                  {description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showActions && onConfirm && (
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs ${buttonColor} sm:ml-3 sm:w-auto`}
                >
                  {confirmText}
                </button>
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    {cancelText}
                  </button>
                )}
              </div>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

// Custom Dialog - For complex content
interface CustomDialogProps extends BaseDialogProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  dismissible?: boolean
}

export function CustomDialog({ 
  open, 
  onClose, 
  title, 
  children, 
  maxWidth = 'lg',
  dismissible = true
}: CustomDialogProps) {
  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md', 
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl'
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className={`relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full ${maxWidthClasses[maxWidth]} sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95`}
          >
            {dismissible && (
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
                >
                  <span className="sr-only">Close</span>
                  <X aria-hidden="true" className="size-6" />
                </button>
              </div>
            )}
            
            <div className={dismissible ? 'pr-8' : ''}>
              <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-4">
                {title}
              </DialogTitle>
              {children}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
