
document.addEventListener("DOMContentLoaded", async () => {
    const heading = document.getElementById("zipHeading");
    const results = document.getElementById("zipResults");
    if (!results) return;

    const zip = new URLSearchParams(window.location.search).get("ncapa_zip");

    // the URL is user-controlled, so check it before using it
    if (!zip || !/^\d{5}$/.test(zip)) {
        results.textContent = "Enter a 5-digit ZIP code.";
        return;
    }

    heading.textContent = `Representatives for ZIP ${zip}`;
    results.textContent = "Loading...";

    try {
        const res = await fetch(`${NCAPA.restUrl}zip/${zip}`);
        if (res.status === 404) {
            results.textContent = "No districts found for that ZIP code.";
            return;
        }
        if (!res.ok) throw new Error("Request failed: " + res.status);

        const data = await res.json();
        results.replaceChildren();

        if (data.members.length > 1) {
            const note = document.createElement("p");
            note.textContent =
                "This ZIP code spans more than one district. " +
                "Use your full street address to confirm which is yours.";
            results.appendChild(note);
        }

        data.members.forEach(m => {
            const card = document.createElement("div");
            card.className = "member-card";

            const info = document.createElement("div");
            info.className = "member-info";
            const img = document.createElement("img");
            img.className = "member-photo";
            img.alt = `${m.first_name} ${m.last_name}`;
            img.src = `https://unitedstates.github.io/images/congress/225x275/${m.bioguide_id}.jpg` || PLACEHOLDER_IMG;
            img.addEventListener("error", () => {
                img.src = PLACEHOLDER_IMG;
            }, { once: true });
            card.appendChild(img);

            const name = document.createElement("h3");
            name.textContent = `${m.first_name} ${m.last_name}`;
            info.appendChild(name);

            [
                `${m.state_code}-${m.district}`,
                m.phone ? `Phone: ${m.phone}` : "",
                m.office ? `Office: ${m.office}` : ""
            ].filter(Boolean).forEach(text => {
                const p = document.createElement("p");
                p.textContent = text;
                info.appendChild(p);
            });

            card.appendChild(info);
            results.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        results.textContent = "Could not look up that ZIP code.";
    }
});