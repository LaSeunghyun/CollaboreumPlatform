import React from 'react'
import { CheckCircle } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from './Modal'
import { Button } from './Button'

interface SuccessModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    onConfirm?: () => void
    confirmText?: string
    showConfirmButton?: boolean
}

export function SuccessModal({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = '확인',
    showConfirmButton = true
}: SuccessModalProps) {
    const handleConfirm = () => {
        onConfirm?.()
        onOpenChange(false)
    }

    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            size="sm"
            titleId="success-modal-title"
            descriptionId="success-modal-description"
        >
            <ModalHeader>
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-success-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
                <ModalTitle id="success-modal-title" className="text-center">
                    {title}
                </ModalTitle>
                {description && (
                    <ModalDescription id="success-modal-description" className="text-center">
                        {description}
                    </ModalDescription>
                )}
            </ModalHeader>

            <ModalFooter>
                {showConfirmButton && (
                    <Button
                        onClick={handleConfirm}
                        className="w-full"
                        tone="success"
                    >
                        {confirmText}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    )
}
