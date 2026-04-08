import "./alertService.css";

let activeOverlay = null;
let activeResolve = null;
let activeTimer = null;
let activeKeyHandler = null;

const closeActivePopup = (isConfirmed = false, value = undefined) => {
    if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
    }

    if (activeKeyHandler) {
        document.removeEventListener("keydown", activeKeyHandler);
        activeKeyHandler = null;
    }

    if (activeOverlay) {
        activeOverlay.remove();
        activeOverlay = null;
    }

    const resolve = activeResolve;
    activeResolve = null;

    if (resolve) {
        resolve({ isConfirmed, value });
    }
};

const buildPopup = ({
    type,
    title,
    message,
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = false,
    autoCloseMs = 0,
}) => {
    if (typeof document === "undefined") {
        return Promise.resolve({ isConfirmed: false, value: undefined });
    }

    closeActivePopup(false);

    return new Promise((resolve) => {
        activeResolve = resolve;

        const overlay = document.createElement("div");
        overlay.className = "pop-show-overlay";

        const popup = document.createElement("div");
        popup.className = `pop-show-popup pop-show-${type}`;
        popup.setAttribute("role", "dialog");
        popup.setAttribute("aria-modal", "true");

        const icon = document.createElement("div");
        icon.className = `pop-show-icon pop-show-icon-${type}`;
        icon.textContent = type === "success" ? "✓" : type === "error" ? "!" : "?";

        const titleNode = document.createElement("h2");
        titleNode.className = "pop-show-title";
        titleNode.textContent = title;

        const messageNode = document.createElement("div");
        messageNode.className = "pop-show-message";
        messageNode.textContent = message;

        const actions = document.createElement("div");
        actions.className = "pop-show-actions";

        const confirmBtn = document.createElement("button");
        confirmBtn.type = "button";
        confirmBtn.className = "pop-show-btn pop-show-confirm-btn";
        confirmBtn.textContent = confirmText;
        confirmBtn.addEventListener("click", () => closeActivePopup(true, true));

        actions.appendChild(confirmBtn);

        if (showCancel) {
            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.className = "pop-show-btn pop-show-cancel-btn";
            cancelBtn.textContent = cancelText;
            cancelBtn.addEventListener("click", () => closeActivePopup(false, false));
            actions.appendChild(cancelBtn);
        }

        popup.appendChild(icon);
        popup.appendChild(titleNode);
        if (message) {
            popup.appendChild(messageNode);
        }
        popup.appendChild(actions);
        overlay.appendChild(popup);

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeActivePopup(false, false);
            }
        });

        activeKeyHandler = (event) => {
            if (event.key === "Escape") {
                closeActivePopup(false, false);
            }
        };
        document.addEventListener("keydown", activeKeyHandler);

        document.body.appendChild(overlay);
        activeOverlay = overlay;

        requestAnimationFrame(() => {
            overlay.classList.add("is-visible");
            popup.classList.add("is-visible");
        });

        if (autoCloseMs > 0) {
            activeTimer = setTimeout(() => {
                closeActivePopup(true, true);
            }, autoCloseMs);
        }

        setTimeout(() => confirmBtn.focus(), 0);
    });
};

export const showSuccess = (message = "Success!") => {
    return buildPopup({
        type: "success",
        title: message,
        message: "",
        confirmText: "OK",
        showCancel: false,
        autoCloseMs: 1800,
    });
};

export const showError = (message = "Something went wrong!") => {
    return buildPopup({
        type: "error",
        title: "Error",
        message,
        confirmText: "OK",
        showCancel: false,
        autoCloseMs: 0,
    });
};

export const showConfirm = async (
    message,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
) => {
    const result = await buildPopup({
        type: "confirm",
        title: "Please Confirm",
        message,
        confirmText: confirmButtonText,
        cancelText: cancelButtonText,
        showCancel: true,
        autoCloseMs: 0,
    });

    return result.isConfirmed;
};
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./alertService.css";

const customClass = {
    popup: "custom-swal-popup",
    title: "swal2-title",
    htmlContainer: "swal2-html-container",
    confirmButton: "custom-swal-confirm-btn",
    cancelButton: "custom-swal-cancel-btn",
};

const baseOptions = {
    customClass,
    buttonsStyling: false,
    background: "#ffffff",
    showClass: {
        popup: "swal2-show",
    },
    hideClass: {
        popup: "swal2-hide",
    },
};

export const showSuccess = (message = "Success!") => {
    return Swal.fire({
        ...baseOptions,
        icon: "success",
        title: message,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
    });
};

export const showError = (message = "Something went wrong!") => {
    return Swal.fire({
        ...baseOptions,
        icon: "error",
        title: message,
        confirmButtonText: "OK",
        allowOutsideClick: true,
        allowEscapeKey: true,
        focusConfirm: true,
        reverseButtons: false,
    });
};

export const showConfirm = async (
    message,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
    confirmButtonColor = "#3085d6",
    cancelButtonColor = "#d33"
) => {
    const result = await Swal.fire({
        ...baseOptions,
        icon: "warning",
        title: message,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        confirmButtonColor,
        cancelButtonColor,
        allowOutsideClick: false,
        allowEscapeKey: true,
        focusConfirm: true,
    });

    return result.isConfirmed;
};
