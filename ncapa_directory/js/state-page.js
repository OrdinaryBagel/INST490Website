async function loadState() {

    const params = new URLSearchParams(window.location.search);
    const stateCode = params.get("ncapa_state")

    if (!stateCode || !/^[a-z]{2}$/i.test(stateCode)) {
        console.error("Invalid or missing state code");
        return;
    }

    try {
        const resp = await fetch(
            `/wp-json/ncapa/v1/states/${stateCode.toUpperCase()}`
        )

        if (!resp.ok) {
            throw new Error("Failed to retrieve state");
        }

        const data = await resp.json();

        document.getElementById("state-name").textContent = data.state.name;

        const senators = data.members.filter(
            member => member.chamber === "Senate"
        );

        const representatives = data.members.filter(
            member => member.chamber === "House"
        );

        document.getElementById("senator-count").textContent = senators.length;

        document.getElementById("rep-count").textContent = representatives.length;

        function renderMembers(containerId, members) {
            const container = document.getElementById(containerId);
            container.replaceChildren();

            members.forEach(member => {
                const card = document.createElement('article');
                card.className ="member-card";

                const photo = document.createElement("img");
                photo.src = `https://unitedstates.github.io/images/congress/225x275/${member.bioguide_id}.jpg`;
                photo.className = "member-photo"

                photo.onerror = () => {
                    photo.style.display = "none"
                };

                const name = document.createElement("h3");
                name.textContent = `${member.first_name} ${member.last_name}`

                const details = document.createElement("p");
                details.textContent = member.party;

                const term_start_end = document.createElement("p");

                const start_date = new Date(member.term_start);
                const state_date_formatted = start_date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZome: "UTC"
                })

                const end_date = new Date(member.term_end);

                const end_date_formatted = end_date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC"
                })
                term_start_end.textContent = `start date: ${state_date_formatted}, end date: ${end_date_formatted}`;

                const website = document.createElement("a");
                website.textContent = member.website;
                website.href = member.website;

                const phone = document.createElement("p");
                phone.textContent = member.phone

                card.append(photo, name, details, term_start_end, website, phone);
                container.appendChild(card);
            });
        }

        renderMembers("senators-list", senators);
        renderMembers("representatives-list", representatives)

        return data;
    } catch (error) {
        console.error(error)
    }
}

document.addEventListener('DOMContentLoaded', loadState);