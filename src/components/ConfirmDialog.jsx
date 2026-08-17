import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel,
    onConfirm,
    onCancel,
}) {
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;
        const previouslyFocused = document.activeElement;
        const timeout = setTimeout(() => cancelRef.current?.focus(), 0);

        function handleKeyDown(event) {
            if (event.key === "Escape") onCancel();
            if (event.key !== "Tab") return;

            const buttons = [...(dialogRef.current?.querySelectorAll("button") ?? [])];
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener("keydown", handleKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="modalBackdrop confirmBackdrop" role="presentation">
            <section
                ref={dialogRef}
                className="confirmDialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-description"
            >
                <span className="confirmIcon" aria-hidden="true">
                    <AlertTriangle size={22} />
                </span>
                <h2 id="confirm-title">{title}</h2>
                <p id="confirm-description">{description}</p>
                <div className="confirmActions">
                    <button ref={cancelRef} type="button" onClick={onCancel}>
                        Abbrechen
                    </button>
                    <button className="dangerButton" type="button" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
}
