import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';
import { createPortal } from 'react-dom';

export const modalStyles = cva(
  'fixed inset-0 z-50 flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
        '2xl': 'p-16',
        full: 'p-0',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const modalContentStyles = cva(
  'relative bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full',
        md: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        full: 'max-w-full w-full h-full',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const modalOverlayStyles = 'fixed inset-0 bg-black/50 backdrop-blur-sm';

const modalHeaderStyles = 'flex flex-col space-y-1.5 p-6 pb-4';
const modalTitleStyles = 'text-lg font-semibold leading-none tracking-tight';
const modalDescriptionStyles = 'text-sm text-muted-foreground';

const modalContentWrapperStyles = 'p-6 pt-0 overflow-y-auto max-h-[60vh]';
const modalFooterStyles =
  'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4';

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalStyles> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  titleId?: string;
  descriptionId?: string;
}

export interface ModalContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentStyles> {}

export interface ModalHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface ModalContentWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

// Focus trap hook with improved accessibility
function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const event = new CustomEvent('modal-escape');
        document.dispatchEvent(event);
      }
    };

    // Focus the first focusable element
    firstElement?.focus();

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);

      // Restore focus to the previously focused element
      previousActiveElement.current?.focus();
    };
  }, [active]);

  return containerRef;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      open = false,
      onOpenChange,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      titleId,
      descriptionId,
      children,
      ...props
    },
    ref,
  ) => {
    const [mounted, setMounted] = useState(false);
    const containerRef = useFocusTrap(open);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!open) return;

      const handleEscape = () => {
        if (closeOnEscape) {
          onOpenChange?.(false);
        }
      };

      document.addEventListener('modal-escape', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('modal-escape', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [open, closeOnEscape, onOpenChange]);

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnOverlayClick) {
          onOpenChange?.(false);
        }
      },
      [closeOnOverlayClick, onOpenChange],
    );

    if (!mounted || !open) return null;

    return createPortal(
      <div
        ref={ref}
        className={cn(modalStyles({ size }), className)}
        {...props}
      >
        <div className={modalOverlayStyles} onClick={handleOverlayClick} />
        <div
          ref={containerRef}
          className={cn(modalContentStyles({ size }), 'focus:outline-none')}
          role='dialog'
          aria-modal='true'
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          {children}
        </div>
      </div>,
      document.body,
    );
  },
);
Modal.displayName = 'Modal';

const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(modalContentStyles({ size }), className)}
      {...props}
    />
  ),
);
ModalContent.displayName = 'ModalContent';

const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(modalHeaderStyles, className)} {...props} />
  ),
);
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, id, ...props }, ref) => (
    <h2
      ref={ref}
      id={id}
      className={cn(modalTitleStyles, className)}
      {...props}
    >
      {props.children}
    </h2>
  ),
);
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = forwardRef<
  HTMLParagraphElement,
  ModalDescriptionProps
>(({ className, id, ...props }, ref) => (
  <p
    ref={ref}
    id={id}
    className={cn(modalDescriptionStyles, className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

const ModalContentWrapper = forwardRef<
  HTMLDivElement,
  ModalContentWrapperProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(modalContentWrapperStyles, className)}
    {...props}
  />
));
ModalContentWrapper.displayName = 'ModalContentWrapper';

const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(modalFooterStyles, className)} {...props} />
  ),
);
ModalFooter.displayName = 'ModalFooter';

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContentWrapper,
  ModalFooter,
};
