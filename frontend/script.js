// ============================================================
// VESTIQ FRONTEND
// ============================================================

"use strict";

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------

const API_URL = "";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);

let previewUrl = null;

function userId() {

    let id = localStorage.getItem("vestiq_user_id");

    if (!id) {

        id =
            "guest-" +
            Math.random()
                .toString(36)
                .substring(2, 10);

        localStorage.setItem(
            "vestiq_user_id",
            id
        );
    }

    return id;
}

async function api(url, options = {}) {

    const response = await fetch(
        API_URL + url,
        options
    );

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            "Server returned an invalid response."
        );
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );
    }

    return data;
}

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------

function toast(message) {

    const element = $("#toast");

    if (!element) {
        alert(message);
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(
        window.vestiqToastTimer
    );

    window.vestiqToastTimer =
        setTimeout(() => {

            element.classList.remove(
                "show"
            );

        }, 3000);
}

// ------------------------------------------------------------
// MODAL
// ------------------------------------------------------------

function openModal(type) {

    const modal = $("#modal");
    const content = $("#modal-content");

    if (!modal || !content) {
        return;
    }

    if (type === "add") {

        content.innerHTML = `
            <div class="modal-heading">
                <p class="eyebrow">Your personal inventory</p>
                <h2>Add a <em>favourite.</em></h2>
            </div>

            <form id="clothingForm"
                  class="clothing-form"
                  enctype="multipart/form-data">

                <label class="upload-box" id="uploadBox">

                    <input
                        id="clothingImage"
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        hidden
                        required
                    >

                    <div class="upload-content">

                        <div class="upload-icon">
                            +
                        </div>

                        <strong id="uploadLabel">
                            Choose clothing image
                        </strong>

                        <small>
                            JPG, PNG or WEBP · Maximum 8 MB
                        </small>

                    </div>

                    <img
                        id="imagePreview"
                        alt="Selected clothing preview"
                    >

                </label>

                <div class="form-group">

                    <label for="clothingName">
                        Name
                    </label>

                    <input
                        id="clothingName"
                        name="name"
                        type="text"
                        placeholder="e.g. Black linen shirt"
                        required
                    >

                </div>

                <div class="form-group">

                    <label for="clothingCategory">
                        Category
                    </label>

                    <select
                        id="clothingCategory"
                        name="category"
                        required
                    >

                        <option value="Shirt">
                            Shirt
                        </option>

                        <option value="T-shirt">
                            T-shirt
                        </option>

                        <option value="Crop top">
                            Crop top
                        </option>

                        <option value="Pants">
                            Pants
                        </option>

                        <option value="Jeans">
                            Jeans
                        </option>

                        <option value="Skirt">
                            Skirt
                        </option>

                        <option value="Dress">
                            Dress
                        </option>

                        <option value="Jacket">
                            Jacket
                        </option>

                        <option value="Shoes">
                            Shoes
                        </option>

                        <option value="Accessory">
                            Accessory
                        </option>

                    </select>

                </div>

                <div class="form-group">

                    <label for="clothingColor">
                        Color / details
                    </label>

                    <input
                        id="clothingColor"
                        name="color"
                        type="text"
                        placeholder="e.g. Black · Oversized · Cotton"
                    >

                </div>

                <input
                    type="hidden"
                    name="userId"
                    value="${userId()}"
                >

                <div
                    id="clothingMsg"
                    class="form-message"
                ></div>

                <button
                    type="submit"
                    class="button dark full-button"
                >
                    Save piece ↗
                </button>

            </form>
        `;

        setupClothingForm();
    }

    else if (type === "profile") {

        loadProfileModal(content);
    }

    else if (type === "login") {

        content.innerHTML = `
            <div class="modal-heading">
                <p class="eyebrow">Welcome back</p>
                <h2>Sign <em>in.</em></h2>
            </div>

            <form id="loginForm">

                <div class="form-group">

                    <label>Email</label>

                    <input
                        type="email"
                        id="loginEmail"
                        required
                        placeholder="you@example.com"
                    >

                </div>

                <div class="form-group">

                    <label>Password</label>

                    <input
                        type="password"
                        id="loginPassword"
                        required
                        minlength="6"
                        placeholder="••••••••"
                    >

                </div>

                <button
                    type="submit"
                    class="button dark full-button"
                >
                    Sign in ↗
                </button>

                <p class="switch-auth">
                    New to VESTIQ?
                    <button
                        type="button"
                        id="registerSwitch"
                        class="link-button"
                    >
                        Create account
                    </button>
                </p>

            </form>
        `;

        $("#loginForm").addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                localStorage.setItem(
                    "vestiq_logged_in",
                    "true"
                );

                localStorage.setItem(
                    "vestiq_email",
                    $("#loginEmail").value
                );

                closeModal();

                toast("✓ Welcome back to VESTIQ.");

            }
        );

        $("#registerSwitch").addEventListener(
            "click",
            () => openModal("register")
        );
    }

    else if (type === "register") {

        content.innerHTML = `
            <div class="modal-heading">
                <p class="eyebrow">Join VESTIQ</p>
                <h2>Create an <em>account.</em></h2>
            </div>

            <form id="registerForm">

                <div class="form-group">

                    <label>Name</label>

                    <input
                        id="registerName"
                        type="text"
                        required
                        placeholder="Your name"
                    >

                </div>

                <div class="form-group">

                    <label>Email</label>

                    <input
                        id="registerEmail"
                        type="email"
                        required
                        placeholder="you@example.com"
                    >

                </div>

                <div class="form-group">

                    <label>Password</label>

                    <input
                        id="registerPassword"
                        type="password"
                        minlength="6"
                        required
                        placeholder="Minimum 6 characters"
                    >

                </div>

                <button
                    class="button dark full-button"
                    type="submit"
                >
                    Create account ↗
                </button>

                <p class="switch-auth">

                    Already have an account?

                    <button
                        type="button"
                        id="loginSwitch"
                        class="link-button"
                    >
                        Sign in
                    </button>

                </p>

            </form>
        `;

        $("#registerForm").addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const name =
                    $("#registerName").value.trim();

                const email =
                    $("#registerEmail").value.trim();

                localStorage.setItem(
                    "vestiq_logged_in",
                    "true"
                );

                localStorage.setItem(
                    "vestiq_name",
                    name
                );

                localStorage.setItem(
                    "vestiq_email",
                    email
                );

                closeModal();

                toast(
                    "✓ VESTIQ account created."
                );
            }
        );

        $("#loginSwitch").addEventListener(
            "click",
            () => openModal("login")
        );
    }

    modal.classList.add("open");
    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}

// ------------------------------------------------------------
// CLOSE MODAL
// ------------------------------------------------------------

function closeModal() {

    const modal = $("#modal");

    if (!modal) return;

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}

// ------------------------------------------------------------
// PROFILE MODAL
// ------------------------------------------------------------

async function loadProfileModal(content) {

    const name =
        localStorage.getItem(
            "vestiq_name"
        ) || "VESTIQ User";

    const email =
        localStorage.getItem(
            "vestiq_email"
        ) || "guest@vestiq.local";

    content.innerHTML = `
        <div class="modal-heading">
            <p class="eyebrow">
                Your VESTIQ profile
            </p>

            <h2>
                Hello, <em>${escapeHTML(name)}</em>
            </h2>
        </div>

        <div class="profile-card">

            <div class="profile-avatar">
                ${escapeHTML(
                    name
                        .charAt(0)
                        .toUpperCase()
                )}
            </div>

            <div>
                <strong>
                    ${escapeHTML(name)}
                </strong>

                <p>
                    ${escapeHTML(email)}
                </p>
            </div>

        </div>

        <div class="profile-stats">

            <div>
                <strong id="profileWardrobeCount">
                    —
                </strong>
                <span>Pieces</span>
            </div>

            <div>
                <strong>7</strong>
                <span>Planner days</span>
            </div>

            <div>
                <strong>V</strong>
                <span>Style ID</span>
            </div>

        </div>

        <button
            id="logoutBtn"
            class="button dark full-button"
        >
            Sign out
        </button>
    `;

    try {

        const data =
            await api("/api/wardrobe");

        $("#profileWardrobeCount").textContent =
            data.items.length;

    } catch {
        $("#profileWardrobeCount").textContent =
            "0";
    }

    $("#logoutBtn").addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "vestiq_logged_in"
            );

            closeModal();

            toast("Signed out.");

        }
    );

}

// ------------------------------------------------------------
// ESCAPE HTML
// ------------------------------------------------------------

function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// ------------------------------------------------------------
// CLOTHING FORM
// ------------------------------------------------------------

function setupClothingForm() {

    const form =
        $("#clothingForm");

    const fileInput =
        $("#clothingImage");

    const preview =
        $("#imagePreview");

    const uploadBox =
        $("#uploadBox");

    const uploadLabel =
        $("#uploadLabel");

    if (!form || !fileInput) {
        return;
    }

    // Image preview
    fileInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                toast(
                    "Please choose an image."
                );

                fileInput.value = "";

                return;
            }

            if (
                file.size >
                8 * 1024 * 1024
            ) {

                toast(
                    "Image must be smaller than 8 MB."
                );

                fileInput.value = "";

                return;
            }

            if (previewUrl) {

                URL.revokeObjectURL(
                    previewUrl
                );
            }

            previewUrl =
                URL.createObjectURL(file);

            preview.src =
                previewUrl;

            preview.style.display =
                "block";

            uploadBox.classList.add(
                "previewing"
            );

            uploadLabel.textContent =
                file.name;

        }
    );

    // Submit
    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const file =
                fileInput.files?.[0];

            if (!file) {

                $("#clothingMsg").textContent =
                    "Please choose an image.";

                toast(
                    "Please choose an image."
                );

                return;
            }

            const button =
                form.querySelector(
                    "button[type='submit']"
                );

            const originalText =
                button.textContent;

            const formData =
                new FormData(form);

            formData.set(
                "userId",
                userId()
            );

            button.disabled = true;
            button.textContent =
                "Uploading...";

            $("#clothingMsg").textContent =
                "";

            try {

                const result =
                    await api(
                        "/api/wardrobe",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                console.log(
                    "UPLOAD SUCCESS:",
                    result
                );

                form.reset();

                preview.removeAttribute(
                    "src"
                );

                preview.style.display =
                    "none";

                uploadBox.classList.remove(
                    "previewing"
                );

                uploadLabel.textContent =
                    "Choose clothing image";

                if (previewUrl) {

                    URL.revokeObjectURL(
                        previewUrl
                    );

                    previewUrl = null;
                }

                closeModal();

                toast(
                    "✓ Clothing added to wardrobe."
                );

                await loadWardrobe();

            } catch (error) {

                console.error(
                    "UPLOAD ERROR:",
                    error
                );

                $("#clothingMsg").textContent =
                    error.message;

                toast(
                    "Upload failed: " +
                    error.message
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    originalText;
            }

        }
    );
}

// ------------------------------------------------------------
// LOAD WARDROBE
// ------------------------------------------------------------

async function loadWardrobe() {

    const grid =
        $("#wardrobe-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML =
        `<div class="loading">
            Loading your wardrobe...
        </div>`;

    try {

        const data =
            await api(
                "/api/wardrobe"
            );

        renderWardrobe(
            data.items || []
        );

    } catch (error) {

        console.error(
            error
        );

        grid.innerHTML =
            `<div class="empty-state">
                <h3>Could not load wardrobe.</h3>
                <p>
                    Make sure the VESTIQ server is running.
                </p>
                <button
                    class="button dark"
                    id="retryWardrobe"
                >
                    Try again
                </button>
            </div>`;

        $("#retryWardrobe")?.addEventListener(
            "click",
            loadWardrobe
        );
    }
}

// ------------------------------------------------------------
// RENDER WARDROBE
// ------------------------------------------------------------

function renderWardrobe(items) {

    const grid =
        $("#wardrobe-grid");

    if (!items.length) {

        grid.innerHTML =
            `
            <div class="empty-state">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Your wardrobe is waiting.
                </h3>

                <p>
                    Add your first favourite piece
                    to start building your personal edit.
                </p>

                <button
                    class="button dark"
                    id="emptyAddBtn"
                >
                    + Add clothing
                </button>

            </div>
            `;

        $("#emptyAddBtn").addEventListener(
            "click",
            () => openModal("add")
        );

        return;
    }

    grid.innerHTML =
        items.map(item => {

            return `
                <article
                    class="wardrobe-card"
                    data-id="${escapeHTML(item.id)}"
                >

                    <div class="wardrobe-image">

                        <img
                            src="${escapeHTML(item.image)}"
                            alt="${escapeHTML(item.name)}"
                            loading="lazy"
                            onerror="this.src='https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80'"
                        >

                        <button
                            class="delete-item"
                            data-delete="${escapeHTML(item.id)}"
                            title="Delete clothing"
                        >
                            ×
                        </button>

                    </div>

                    <div class="wardrobe-info">

                        <span class="wardrobe-category">
                            ${escapeHTML(item.category)}
                        </span>

                        <h3>
                            ${escapeHTML(item.name)}
                        </h3>

                        ${
                            item.color
                            ?
                            `<p>
                                ${escapeHTML(item.color)}
                            </p>`
                            :
                            ""
                        }

                        <small>
                            Added
                            ${formatDate(item.dateAdded)}
                        </small>

                    </div>

                </article>
            `;

        }).join("");

    $$("[data-delete]").forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    deleteWardrobeItem(
                        button.dataset.delete
                    )
            );

        }
    );
}

// ------------------------------------------------------------
// DELETE
// ------------------------------------------------------------

async function deleteWardrobeItem(id) {

    const confirmed =
        confirm(
            "Remove this clothing item from your wardrobe?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await api(
            `/api/wardrobe/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        toast(
            "Clothing removed."
        );

        await loadWardrobe();

    } catch (error) {

        toast(
            error.message
        );
    }
}

// ------------------------------------------------------------
// DATE
// ------------------------------------------------------------

function formatDate(date) {

    if (!date) {
        return "";
    }

    try {

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    } catch {

        return "";
    }
}

// ------------------------------------------------------------
// STYLE MATCH
// ------------------------------------------------------------

async function findMyMatch() {

    const result =
        $("#match-result");

    const button =
        $("#match-btn");

    if (!result) {
        return;
    }

    button.disabled = true;
    button.innerHTML =
        "Styling...";

    result.innerHTML =
        `
        <div class="loading">
            VESTIQ is composing your look...
        </div>
        `;

    try {

        const data =
            await api(
                "/api/style-match",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        userId: userId()
                    })
                }
            );

        if (!data.outfit?.length) {

            result.innerHTML =
                `
                <div class="empty-state">
                    <h3>
                        Add more pieces first.
                    </h3>
                    <p>
                        VESTIQ needs clothing to create a match.
                    </p>
                </div>
                `;

            return;
        }

        renderMatch(data);

    } catch (error) {

        result.innerHTML =
            `
            <div class="empty-state">
                <h3>Style matcher unavailable.</h3>
                <p>
                    ${escapeHTML(error.message)}
                </p>
            </div>
            `;

    } finally {

        button.disabled =
            false;

        button.innerHTML =
            "Find my match <span>→</span>";
    }
}

// ------------------------------------------------------------
// RENDER MATCH
// ------------------------------------------------------------

function renderMatch(data) {

    const result =
        $("#match-result");

    result.innerHTML =
        `
        <div class="match-box">

            <div class="match-heading">

                <p class="eyebrow">
                    Your VESTIQ match
                </p>

                <h3>
                    ${escapeHTML(
                        data.title ||
                        "Complete look"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        data.description ||
                        "Styled from your wardrobe."
                    )}
                </p>

            </div>

            <div class="outfit-visual">

                ${
                    data.outfit.map(item =>
                        `
                        <div class="outfit-piece">

                            <img
                                src="${escapeHTML(item.image)}"
                                alt="${escapeHTML(item.name)}"
                            >

                            <span>
                                ${escapeHTML(item.name)}
                            </span>

                        </div>
                        `
                    ).join("")
                }

            </div>

        </div>
        `;
}

// ------------------------------------------------------------
// PLANNER
// ------------------------------------------------------------

async function buildPlanner() {

    const grid =
        $("#planner-grid");

    const button =
        $("#planner-btn");

    button.disabled = true;

    button.innerHTML =
        "Building your week...";

    grid.innerHTML =
        `
        <div class="loading">
            Creating seven complete looks...
        </div>
        `;

    try {

        const data =
            await api(
                "/api/planner",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        userId: userId()
                    })
                }
            );

        if (!data.days?.length) {

            grid.innerHTML =
                `
                <div class="planner-empty">

                    <h3>
                        Your wardrobe is empty.
                    </h3>

                    <p>
                        Add some clothes first,
                        then build your week.
                    </p>

                </div>
                `;

            return;
        }

        renderPlanner(
            data.days
        );

    } catch (error) {

        grid.innerHTML =
            `
            <div class="planner-empty">

                <h3>
                    Planner unavailable.
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
            `;

    } finally {

        button.disabled =
            false;

        button.innerHTML =
            "Build my week <span>↗</span>";
    }
}

// ------------------------------------------------------------
// RENDER PLANNER
// ------------------------------------------------------------

function renderPlanner(days) {

    const grid =
        $("#planner-grid");

    grid.innerHTML =
        days.map(day => {

            return `
                <article class="day-card">

                    <div class="day-title">
                        ${escapeHTML(day.day)}
                    </div>

                    <div class="day-outfit">

                        ${
                            day.outfit.map(item =>
                                `
                                <div class="day-piece">

                                    <img
                                        src="${escapeHTML(item.image)}"
                                        alt="${escapeHTML(item.name)}"
                                        loading="lazy"
                                    >

                                    <span>
                                        ${escapeHTML(item.name)}
                                    </span>

                                </div>
                                `
                            ).join("")
                        }

                    </div>

                </article>
            `;

        }).join("");
}

// ------------------------------------------------------------
// NAVIGATION
// ------------------------------------------------------------

function setupNavigation() {

    $$("nav a").forEach(link => {

        link.addEventListener(
            "click",
            function () {

                const target =
                    document.querySelector(
                        this.getAttribute("href")
                    );

                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }
            }
        );

    });

}

// ------------------------------------------------------------
// MOBILE MENU
// ------------------------------------------------------------

function setupMobileMenu() {

    const menu =
        $(".menu");

    const nav =
        document.querySelector(
            ".nav nav"
        );

    if (!menu || !nav) {
        return;
    }

    menu.addEventListener(
        "click",
        () => {

            nav.classList.toggle(
                "mobile-open"
            );

        }
    );

}

// ------------------------------------------------------------
// MODAL EVENTS
// ------------------------------------------------------------

function setupModalEvents() {

    $$("[data-modal]").forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    openModal(
                        button.dataset.modal
                    )
            );

        }
    );

    $(".modal-close")?.addEventListener(
        "click",
        closeModal
    );

    $("#modal")?.addEventListener(
        "click",
        function (event) {

            if (
                event.target === this
            ) {

                closeModal();

            }

        }
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }

        }
    );

}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "VESTIQ frontend loaded."
        );

        setupNavigation();
        setupMobileMenu();
        setupModalEvents();

        $("#match-btn")?.addEventListener(
            "click",
            findMyMatch
        );

        $("#planner-btn")?.addEventListener(
            "click",
            buildPlanner
        );

        loadWardrobe();

    }
);