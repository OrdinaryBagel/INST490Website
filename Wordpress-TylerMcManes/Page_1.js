document.addEventListener("DOMContentLoaded", () => {
    const states = document.querySelectorAll("path.state");
    const results = document.getElementById("congress-results");

    states.forEach(state => {
        state.addEventListener("click", () => {
            // Remove previous selection
            states.forEach(s => {
                s.classList.remove("selected");
            });

            // Highlight clicked state
            state.classList.add("selected");

            // Load congressional members
            showStateSenators(state.id);
        });
    });

    let requestNumber = 0;

    async function showStateSenators(StateAbv) {
        if (!results || !window.congressAjax) {
            console.error("Congress directory is not configured.");
            return;
        }

        const currentRequest = ++requestNumber;
        results.textContent = "Loading congressional members...";

        const data = new URLSearchParams({
            action: "load_congress_members",
            state: StateAbv,
            nonce: window.congressAjax.nonce
        });

        try {
            const response = await fetch(window.congressAjax.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: data.toString()
            });

            if (!response.ok) {
                throw new Error("Request failed");
            }

            const html = await response.text();

            // Ignore older responses if another state was clicked
            if (currentRequest === requestNumber) {
                results.innerHTML = html;
            }
        } catch (error) {
            if (currentRequest === requestNumber) {
                results.textContent =
                    "Unable to load congressional members.";
            }
            console.error(error);
        }
    }
});