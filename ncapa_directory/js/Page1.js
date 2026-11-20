const ncapaState = {
    currentState: null,
    members: [],
};
const SVG_NS = "http://www.w3.org/2000/svg";
const LABEL_OVERRIDES = {
    MI: { x: 762, y: 180 },                         
    FL: { x: 830, y: 468 },                          
    AK: { x: 105, y: 505 },
    HI: { x: 365, y: 528 },
    ME: { x: 957, y: 80 },
    VT: { size: 8 },
    NH: { size: 8 },
    MA: { x: 985, y: 134, size: 9, leader: true },
    RI: { x: 985, y: 152, size: 9, leader: true },
    CT: { x: 975, y: 172, size: 9, leader: true },
    NJ: { x: 938, y: 198, size: 9, leader: true },
    DE: { x: 932, y: 218, size: 9, leader: true },
    MD: { x: 930, y: 238, size: 9, leader: true },
    DC: { x: 925, y: 258, size: 9, leader: true },
};
function addStateLabels() {
    const layer = document.createElementNS(SVG_NS, "g");
    layer.id = "state-labels";
    svg.appendChild(layer);
    svg.querySelectorAll("path.state").forEach(path => {
        const box = path.getBBox();
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const o = LABEL_OVERRIDES[path.id] || {};
        const x = o.x ?? cx;
        const y = o.y ?? cy;
        if (o.leader) {
            const line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("class", "state-leader");
            line.setAttribute("x1", cx);
            line.setAttribute("y1", cy);
            line.setAttribute("x2", x - 8);
            line.setAttribute("y2", y);
            layer.appendChild(line);
        }
        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("class", "state-label");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        if (o.size) text.style.fontSize = o.size + "px";
        text.textContent = path.id;
        layer.appendChild(text);
    });
}

const PLACEHOLDER_IMG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<rect width="100" height="100" fill="#d0d0d8"/>' +
        '<circle cx="50" cy="38" r="18" fill="#9a9aa8"/>' +
        '<path d="M14 100c0-22 16-36 36-36s36 14 36 36z" fill="#9a9aa8"/>' +
        '</svg>'
    );

document.addEventListener("DOMContentLoaded", () => {
    const states = document.querySelectorAll(".state");
    states.forEach(state => {
        state.addEventListener("click", () => {

            showStateSenators(state.id);
        });
    });
});

async function showStateSenators(stateAbv) {
    const splitPage = document.getElementById("splitPage");
    const heading = document.getElementById("Stateabv");
    ncapaState.currentState = stateAbv;
    splitPage.classList.add("split");

    try {
        document.getElementById("memberList").textContent = "Loading...";
        const res = await fetch(`${NCAPA.restUrl}states/${stateAbv}`);
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        heading.textContent = data.state.name;
        ncapaState.members = data.members;
        renderSenateMembers(data.members);
    } catch (err) {
        console.error(err);
    }
}

function collapse(){
    const splitPage = document.getElementById("splitPage");
    splitPage.classList.remove("split");
}


function renderHouseMembers(allMembers) {
    setActiveTab("house");
    const list = document.getElementById("memberList");
    list.replaceChildren();   // clear previous state's results
    const members = allMembers.filter(
        m => (m.chamber || "").toLowerCase() === "house"
    ).sort((a, b) => {
        const da = a.district_number === null || a.district_number === undefined || a.district_number === ""
            ? Infinity : Number(a.district_number);
        const db = b.district_number === null || b.district_number === undefined || b.district_number === ""
            ? Infinity : Number(b.district_number);

        if (da !== db) return da - db;                  
        return (a.last_name || "").localeCompare(b.last_name || "");
    });

    if (!members.length) {
        list.textContent = "No House members found.";
        return;
    }

    members.forEach(m => {
        const card = document.createElement("div");
        card.className = "member-card";

        const img = document.createElement("img");
        img.className = "member-photo";
        img.alt = `${m.first_name} ${m.last_name}`;
        img.src = m.photo_url || PLACEHOLDER_IMG;
        img.addEventListener("error", () => {
            img.src = PLACEHOLDER_IMG;
        }, { once: true });
        card.appendChild(img);

        const name = document.createElement("h3");
        name.textContent = `${m.first_name} ${m.last_name}`;
        card.appendChild(name);

        const details = [
            `${m.chamber}${m.district_number ? " - District " + m.district_number : ""}`,
            m.party ? `Party: ${m.party}` : "",
            m.phone ? `Phone: ${m.phone}` : ""
        ];

        details.filter(Boolean).forEach(text => {
            const p = document.createElement("p");
            p.textContent = text;
            card.appendChild(p);
        });

        if (m.website) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = m.website;
            a.textContent = "Website";
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            p.appendChild(a);
            card.appendChild(p);
        }

        list.appendChild(card);
    });
}

function renderSenateMembers(allMembers) {
    setActiveTab("senators");
    const list = document.getElementById("memberList");
    list.replaceChildren();   // clear previous state's results
    const members = allMembers.filter(
        m => (m.chamber || "").toLowerCase() === "senate"
    );

    if (!members.length) {
        list.textContent = "No House members found.";
        return;
    }

    members.forEach(m => {
        const card = document.createElement("div");
        card.className = "member-card";

        const img = document.createElement("img");
        img.className = "member-photo";
        img.alt = `${m.first_name} ${m.last_name}`;
        img.src = m.photo_url || PLACEHOLDER_IMG;
        img.addEventListener("error", () => {
            img.src = PLACEHOLDER_IMG;
        }, { once: true });
        card.appendChild(img);

        const name = document.createElement("h3");
        name.textContent = `${m.first_name} ${m.last_name}`;
        card.appendChild(name);

        const details = [
            `${m.chamber}${m.district_number ? " - District " + m.district_number : ""}`,
            m.party ? `Party: ${m.party}` : "",
            m.phone ? `Phone: ${m.phone}` : ""
        ];

        details.filter(Boolean).forEach(text => {
            const p = document.createElement("p");
            p.textContent = text;
            card.appendChild(p);
        });

        if (m.website) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = m.website;
            a.textContent = "Website";
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            p.appendChild(a);
            card.appendChild(p);
        }

        list.appendChild(card);
    });
}

async function renderPop(code) {
    setActiveTab("population");
    const list = document.getElementById("memberList");
    list.textContent = "Loading...";
    try {
        const res = await fetch(`${NCAPA.restUrl}states/${code}/population`);
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        list.replaceChildren();
        if (!Array.isArray(data.population) || data.population.length === 0) {
            list.textContent = "No population data for this state.";
            return;
        }
        const pop = data.population;
        pop.forEach(r => {
            const card = document.createElement("div");
            card.className = "member-card";
            const totalpop = document.createElement("h3");
            if(r.population_percentage !== null){
            totalpop.textContent = `${r.demographic_group}: ${r.population_count} - ${r.population_percentage}%`;
            }
            else{
            totalpop.textContent = `${r.demographic_group}: ${r.population_count}`
            }
            card.appendChild(totalpop);

            const source = document.createElement("p");
            source.textContent = `Data Source: ${r.data_source}`;
            card.appendChild(source);
            list.appendChild(card);
        });
    }catch (err) {
        console.error(err);
        list.textContent = "Population data is unavailable: " + err.message;
    }

}
function setActiveTab(view) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        const isActive = btn.dataset.view === view;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
    });
}