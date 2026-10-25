
document.addEventListener("DOMContentLoaded", () => {
    const states = document.querySelectorAll(".state");
    states.forEach(state => {
        state.addEventListener("click", () => {

            showStateSenators(state.id);
        });
    });
});

function showStateSenators(StateAbv) {
    const splitPage = document.getElementById("splitPage");
    const heading = document.getElementById("Stateabv");
    splitPage.classList.add("split");
    heading.textContent = String(StateAbv);
    }


