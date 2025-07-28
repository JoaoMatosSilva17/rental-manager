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
            if (confirm(`Tens a certeza que queres remover a casa "${casa}"? Todas as estadias associadas serão apagadas.`)) {
                casas.splice(i, 1);
                estadias = estadias.filter(e => e.casa !== casa);
                guardarDados();
                atualizarCasas();
                atualizarEstadias();
            }
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
    const casa = houseSelect.value;
    const inicio = document.getElementById("start-date").value;
    const fim = document.getElementById("end-date").value;
    const valor = parseFloat(document.getElementById("value").value);

    if (casa && inicio && fim && !isNaN(valor)) {
        const sobrepoe = estadias.some(e =>
            e.casa === casa &&
            !(fim < e.inicio || inicio > e.fim)
        );

        if (sobrepoe) {
            alert("Já existe uma estadia registada para essa casa nestas datas.");
            return;
        }

        estadias.push({ casa, inicio, fim, valor });
        guardarDados();
        atualizarEstadias();

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

function atualizarEstadias() {
    historyTable.innerHTML = "";

    const criterio = document.getElementById("ordenar-por") ?.value || "insercao";

    let lista = [...estadias]; // Cópia da lista original

    if (criterio === "data") {
        // Ordena por data de início da estadia
        lista.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    } else if (criterio === "casa") {
        // Ordena por ordem alfabética do nome da casa
        lista.sort((a, b) => a.casa.localeCompare(b.casa));
    }
    // Se for "insercao", não faz nada (mantém ordem original)

    // Renderiza a tabela
    lista.forEach(e => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
      <td>${e.casa}</td>
      <td>${e.inicio}</td>
      <td>${e.fim}</td>
      <td>€${e.valor.toFixed(2)}</td>
    `;
        historyTable.appendChild(linha);
    });
}

function exportarDados() {
    const dados = {
        casas,
        estadias
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dados-arrendamentos.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importarDados(event) {
    const ficheiro = event.target.files[0];
    if (!ficheiro) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const dados = JSON.parse(e.target.result);
            casas = dados.casas || [];
            estadias = dados.estadias || [];
            guardarDados();
            atualizarCasas();
            atualizarEstadias();
            alert("Dados importados com sucesso.");
        } catch (err) {
            alert("Erro ao importar ficheiro.");
        }
    };
    reader.readAsText(ficheiro);
}

renderHouses();
renderBookings();