const form = document.getElementById("carrierForm");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

const API_URL = "http://localhost:5000/api/carriers";

if (!form || !submitBtn || !message) {
    console.error("Missing required DOM elements");
}

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = type; // injects error or success styles
}

function clearMessage() {
    message.textContent = "";
    message.className = "";
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10;
}

function formatPhone(input) {
    let digits = input.value.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) {
        input.value = digits;
    } else if (digits.length < 7) {
        input.value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
        input.value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
}

const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener("input", () => {
        formatPhone(phoneInput);
    });
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    const formData = new FormData(form);

    const data = {
        fullName: (formData.get("fullName") || "").trim(),
        email: (formData.get("email") || "").trim(),
        phone: (formData.get("phone") || "").trim(),
        trailerType: formData.get("trailerType") || null,
        maxWeight: formData.get("maxWeight") || null,
        trailerLength: formData.get("trailerLength") || null,
        currentCity: formData.get("currentCity") || null,
        currentState: formData.get("currentState") || null,
        destinationCity: formData.get("destinationCity") || null,
        destinationState: formData.get("destinationState") || null,
        weeklyTarget: formData.get("weeklyTarget") || null,
        availableDate: formData.get("availableDate") || null,
        timeWindow: formData.get("timeWindow") || null
    };

    if (!data.fullName) {
        return showMessage("Full name is required.", "error");
    }
    if (!validateEmail(data.email)) {
        return showMessage("Invalid email address.", "error");
    }
    if (!validatePhone(data.phone)) {
        return showMessage("Phone must be 10 digits.", "error");
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        let result;
        try {
            result = await res.json();
        } catch {
            throw new Error("Invalid server response");
        }

        if (!res.ok) {
            throw new Error(result.message || "Submission failed");
        }

        showMessage("✓ Submitted successfully. A dispatcher will contact you soon.", "success");
        form.reset();

    } catch (err) {
        console.error("Submission error:", err);
        showMessage(err.message || "Network error. Please try again.", "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "FIND MY NEXT LOAD →";
    }
});

const weeklyTarget = document.getElementById('weeklyTarget');
if (weeklyTarget) {
    weeklyTarget.addEventListener("blur", () => {
        let value = weeklyTarget.value.replace(/[^\d]/g, "");
        if (!value) return;
        weeklyTarget.value = `$${Number(value).toLocaleString("en-US")}`;
    });
} 