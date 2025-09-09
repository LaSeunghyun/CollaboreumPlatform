import React, { useState } from "react"
import { Button } from "./Button"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalContentWrapper,
    ModalFooter
} from "./Modal"

export function ModalExample() {
    const [open, setOpen] = useState(false)
    const [openLarge, setOpenLarge] = useState(false)

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Modal Examples</h3>

            <div className="space-x-2">
                <Button onClick={() => setOpen(true)}>
                    Open Small Modal
                </Button>

                <Button onClick={() => setOpenLarge(true)} variant="outline">
                    Open Large Modal
                </Button>
            </div>

            {/* Small Modal */}
            <Modal
                open={open}
                onOpenChange={setOpen}
                size="sm"
                titleId="small-modal-title"
                descriptionId="small-modal-description"
            >
                <ModalHeader>
                    <ModalTitle id="small-modal-title">
                        Confirm Action
                    </ModalTitle>
                    <ModalDescription id="small-modal-description">
                        Are you sure you want to perform this action? This cannot be undone.
                    </ModalDescription>
                </ModalHeader>

                <ModalContentWrapper>
                    <p className="text-sm text-muted-foreground">
                        This is a small modal example with proper accessibility features.
                    </p>
                </ModalContentWrapper>

                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        tone="danger"
                        onClick={() => setOpen(false)}
                    >
                        Confirm
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Large Modal */}
            <Modal
                open={openLarge}
                onOpenChange={setOpenLarge}
                size="lg"
                titleId="large-modal-title"
                descriptionId="large-modal-description"
            >
                <ModalHeader>
                    <ModalTitle id="large-modal-title">
                        Detailed Information
                    </ModalTitle>
                    <ModalDescription id="large-modal-description">
                        This is a larger modal with more content and scrollable area.
                    </ModalDescription>
                </ModalHeader>

                <ModalContentWrapper>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This modal demonstrates the scrollable content area and proper focus management.
                        </p>

                        <div className="space-y-2">
                            <h4 className="font-medium">Features:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                <li>Focus trap with Tab navigation</li>
                                <li>Escape key to close</li>
                                <li>Click outside to close</li>
                                <li>Proper ARIA attributes</li>
                                <li>Scrollable content area</li>
                                <li>Responsive design</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Accessibility:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                <li>aria-modal="true"</li>
                                <li>role="dialog"</li>
                                <li>aria-labelledby and aria-describedby</li>
                                <li>Focus restoration on close</li>
                                <li>Keyboard navigation support</li>
                            </ul>
                        </div>
                    </div>
                </ModalContentWrapper>

                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpenLarge(false)}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => setOpenLarge(false)}
                    >
                        Save Changes
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
