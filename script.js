const listaCasas = document.getElementById("lista-casas");
const seletorCasa = document.getElementById("seletor-casa");
const tabelaHistorico = document.querySelector("#tabela-historico tbody");

let casas = JSON.parse(localStorage.getItem("casas")) || [];
let estadias = JSON.parse(localStorage.getItem("estadias")) || [];

function guardarDados() {
    localStorage.setItem("casas", JSON.stringify(casas));
    localStorage.setItem("estadias", JSON.stringify(estadias));
}

function atualizarCasas() {
    listaCasas.innerHTML = "";
    seletorCasa.innerHTML = "";

    casas.forEach((casa, i) => {
        const li = document.createElement("li");
        li.textContent = casa;

        const btn = document.createElement("button");
        btn.textContent = "Remover";
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
        listaCasas.appendChild(li);

        const opt = document.createElement("option");
        opt.value = casa;
        opt.textContent = casa;
        seletorCasa.appendChild(opt);
    });
}

function adicionarCasa() {
    const nome = document.getElementById("nome-casa").value.trim();
    if (nome && !casas.includes(nome)) {
        casas.push(nome);
        guardarDados();
        atualizarCasas();
        document.getElementById("nome-casa").value = "";
    }
}

function adicionarEstadia() {
    const casa = seletorCasa.value;
    const inicio = document.getElementById("data-inicio").value;
    const fim = document.getElementById("data-fim").value;
    const valor = parseFloat(document.getElementById("valor").value);

    if (inicio < fim) {

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

            document.getElementById("data-inicio").value = "";
            document.getElementById("data-fim").value = "";
            document.getElementById("valor").value = "";
        }
    } else {
        alert("A data de fim não pode ser anterior à data de início!")
    }
}

function atualizarEstadias() {
    tabelaHistorico.innerHTML = "";

    const elemento = document.getElementById("ordenar-por");
    const criterio = elemento ? elemento.value : "insercao";
    console.log(criterio);
    let lista = [...estadias];

    if (criterio === "Data da estadia") {
        lista.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    } else if (criterio === "Nome da casa") {
        lista.sort((a, b) => {
            const comparaCasa = a.casa.localeCompare(b.casa);
            if (comparaCasa !== 0) return comparaCasa;
            return new Date(a.inicio) - new Date(b.inicio);
        });
    }

    lista.forEach((e, index) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
      <td>${e.casa}</td>
      <td>${e.inicio}</td>
      <td>${e.fim}</td>
      <td>€${e.valor.toFixed(2)}</td>
      <td><button onclick="removerEstadia(${index})">Remover</button></td>
    `;
        tabelaHistorico.appendChild(linha);
    });

    const total = lista.reduce((soma, e) => soma + e.valor, 0);

    const linhaTotal = document.createElement("tr");
    linhaTotal.innerHTML = `
    <td><strong>Total</strong></td>
    <td></td>
    <td></td>
    <td><strong>€${total.toFixed(2)}</strong></td>
    <td></td>
  `;
    tabelaHistorico.appendChild(linhaTotal);
}

function removerEstadia(index) {
    if (confirm("Tens a certeza que queres remover esta estadia?")) {
        // Apaga a estadia com base na posição na lista ordenada
        const elemento = document.getElementById("ordenar-por");
        const criterio = elemento ? elemento.value : "insercao";

        // Recriar lista ordenada igual à que se mostra
        let lista = [...estadias];
        if (criterio === "data") {
            lista.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
        } else if (criterio === "casa") {
            lista.sort((a, b) => a.casa.localeCompare(b.casa));
        }

        const estadiaARemover = lista[index];

        // Encontrar o índice verdadeiro no array original
        const indexOriginal = estadias.findIndex(e =>
            e.casa === estadiaARemover.casa &&
            e.inicio === estadiaARemover.inicio &&
            e.fim === estadiaARemover.fim &&
            e.valor === estadiaARemover.valor
        );

        if (indexOriginal !== -1) {
            estadias.splice(indexOriginal, 1);
            guardarDados();
            atualizarEstadias();
        }
    }
}

function exportarDados() {
    const dados = { casas, estadias };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dados-arrendamentos.json";
    a.click();
    URL.revokeObjectURL(url);
}

function importarDados(evento) {
    const ficheiro = evento.target.files[0];
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
        } catch (erro) {
            alert("Erro ao importar ficheiro.");
        }
    };
    reader.readAsText(ficheiro);
}

// Inicialização
atualizarCasas();
atualizarEstadias();