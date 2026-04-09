import "./alertService.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { consumeLastApiResponseData } from "../helpers/api_helper";

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

export const showSuccess = (messageOrResponse = "Success!") => {
    const isResponseObject = typeof messageOrResponse === "object" && messageOrResponse !== null;
    const responseData = isResponseObject ? messageOrResponse : consumeLastApiResponseData();

    if (responseData?.isConfirm === false) {
        return Promise.resolve({ isConfirmed: true, value: true });
    }

    const message = isResponseObject
        ? messageOrResponse?.message || "Success!"
        : messageOrResponse;

    toast.success(message, {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });

    return Promise.resolve({ isConfirmed: true, value: true });
};

export const showError = (message = "Something went wrong!") => {
    toast.error(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });

    return Promise.resolve({ isConfirmed: true, value: true });
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
