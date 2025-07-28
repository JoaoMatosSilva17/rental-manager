const houseList = document.getElementById("house-list");
const houseSelect = document.getElementById("house-select");
const historyTable = document.querySelector("#history-table tbody");

let houses = JSON.parse(localStorage.getItem("houses")) || [];
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

function saveData() {
    localStorage.setItem("houses", JSON.stringify(houses));
    localStorage.setItem("bookings", JSON.stringify(bookings));
}

function renderHouses() {
    houseList.innerHTML = "";
    houseSelect.innerHTML = "";

    houses.forEach((house, i) => {
        const li = document.createElement("li");
        li.textContent = house;
        const btn = document.createElement("button");
        btn.textContent = "Remove";
        btn.onclick = () => {
            houses.splice(i, 1);
            bookings = bookings.filter(b => b.house !== house);
            saveData();
            renderHouses();
            renderBookings();
        };
        li.appendChild(btn);
        houseList.appendChild(li);

        const opt = document.createElement("option");
        opt.value = house;
        opt.textContent = house;
        houseSelect.appendChild(opt);
    });
}

function addHouse() {
    const name = document.getElementById("house-name").value.trim();
    if (name && !houses.includes(name)) {
        houses.push(name);
        saveData();
        renderHouses();
        document.getElementById("house-name").value = "";
    }
}

function addBooking() {
    const house = houseSelect.value;
    const start = document.getElementById("start-date").value;
    const end = document.getElementById("end-date").value;
    const value = parseFloat(document.getElementById("value").value);

    if (house && start && end && !isNaN(value)) {
        bookings.push({ house, start, end, value });
        saveData();
        renderBookings();

        document.getElementById("start-date").value = "";
        document.getElementById("end-date").value = "";
        document.getElementById("value").value = "";
    }
}

function renderBookings() {
    historyTable.innerHTML = "";
    bookings.forEach(b => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${b.house}</td><td>${b.start}</td><td>${b.end}</td><td>€${b.value.toFixed(2)}</td>`;
        historyTable.appendChild(row);
    });
}

renderHouses();
renderBookings();