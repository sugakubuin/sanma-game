
import { X } from 'lucide-react'
import './BaseModal.css'

interface BaseModalProps {
    title: string
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    footer?: React.ReactNode
}

export const BaseModal: React.FC<BaseModalProps> = ({ title, isOpen, onClose, children, footer }) => {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <footer className="modal-footer">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    )
}
