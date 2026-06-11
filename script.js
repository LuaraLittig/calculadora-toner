let modelos = {};

const modeloSelect = document.getElementById("modelo");
const pesoInput = document.getElementById("peso");

const erroBox = document.getElementById("erro");
const resultadoBox = document.getElementById("resultadoBox");
const resultadoTexto = document.getElementById("resultado");
const statusTexto = document.getElementById("status");
const progressBar = document.getElementById("progressBar");

let ultimaPorcentagem = null;
let ultimoPeso = null;
let ultimoModelo = null;

async function carregarModelosDoBanco() {
    try {
        const snapshot = await db.collection("impressoras").get();
        const modelosCarregados = {};

        snapshot.forEach((doc) => {
            const item = doc.data();
            
            modelosCarregados[doc.id] = {
                nome: `${item.fabricante} - ${item.modelo} (${item.toner})`,
                cheio: Number(item.cheio),
                vazio: Number(item.vazio)
            };
        });

        modelos = modelosCarregados;

    } catch (erro) {
        console.error("Erro ao acessar o Firebase:", erro);
        mostrarErro("Erro ao carregar as impressoras do servidor.");
    }

    preencherSelectModelos();
    atualizarLimitePeso();
}


function preencherSelectModelos() {
    if (!modeloSelect) return;
    modeloSelect.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione uma impressora...";
    modeloSelect.appendChild(placeholder);

    for (let chave in modelos) {
        const option = document.createElement("option");
        option.value = chave;
        option.textContent = modelos[chave].nome;
        modeloSelect.appendChild(option);
    }
}

function mostrarErro(texto) {
    if (erroBox) {
        erroBox.style.display = "block";
        erroBox.innerText = texto;
    }
}

function limparErro() {
    if (erroBox) {
        erroBox.style.display = "none";
        erroBox.innerText = "";
    }
}


function atualizarLimitePeso() {
    if (!modeloSelect) return;
    const modelo = modeloSelect.value;
    const dados = modelos[modelo];

    if (!dados || !pesoInput) {
        if (pesoInput) {
            pesoInput.value = "";
            pesoInput.removeAttribute("min");
            pesoInput.removeAttribute("max");
        }
        if (resultadoBox) resultadoBox.style.display = "none";
        return;
    }

    pesoInput.max = dados.cheio;
    pesoInput.min = dados.vazio;
    if (resultadoBox) resultadoBox.style.display = "none";
}

function obterStatus(porcentagem) {
    if (porcentagem <= 5) return "Vazio ou quase vazio ⚠️";
    if (porcentagem <= 30) return "Baixo 🟠";
    if (porcentagem <= 70) return "Médio 🟡";
    return "Alto 🟢";
}


function calcular() {
    limparErro();

    const modelo = modeloSelect.value;
    const peso = parseFloat(pesoInput.value);

    if (!modelo) {
        mostrarErro("Por favor, selecione uma impressora primeiro.");
        return;
    }

    if (isNaN(peso)) {
        mostrarErro("Digite um peso válido.");
        return;
    }

    const dados = modelos[modelo];

    if (!dados) {
        mostrarErro("Modelo não encontrado.");
        return;
    }

    if (peso < dados.vazio || peso > dados.cheio) {
        mostrarErro(`Peso deve estar entre ${dados.vazio}g e ${dados.cheio}g`);
        return;
    }

    const porcentagem = ((peso - dados.vazio) / (dados.cheio - dados.vazio)) * 100;

    ultimaPorcentagem = porcentagem;
    ultimoPeso = peso;
    ultimoModelo = modelo;

    if (resultadoTexto) resultadoTexto.innerText = porcentagem.toFixed(2) + "%";
    if (statusTexto) statusTexto.innerText = "Status: " + obterStatus(porcentagem);
    if (progressBar) progressBar.style.width = porcentagem + "%";
    if (resultadoBox) resultadoBox.style.display = "block";

    
    salvarNoHistorico(dados.nome, peso, porcentagem);
}


function salvarNoHistorico(nomeToner, peso, porcentagem) {
    let historico = JSON.parse(localStorage.getItem("historicoPesagens")) || [];

    const novaPesagem = {
        data: new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
        toner: nomeToner,
        peso: peso,
        porcentagem: porcentagem.toFixed(2),
        status: obterStatus(porcentagem)
    };

   
    historico.unshift(novaPesagem);

    
    if (historico.length > 10) {
        historico.pop();
    }

    localStorage.setItem("historicoPesagens", JSON.stringify(historico));
    renderizarHistorico();
}

function renderizarHistorico() {
    const lista = document.getElementById("listaHistorico");
    const box = document.getElementById("historicoBox");
    if (!lista || !box) return;

    let historico = JSON.parse(localStorage.getItem("historicoPesagens")) || [];

    if (historico.length === 0) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";
    lista.innerHTML = "";

    
    historico.forEach((item) => {
        lista.innerHTML += `
            <div class="item-toner" style="margin-top: 10px; padding: 10px; font-size: 13px; text-align: left;">
                <span style="font-size: 11px; color: #94a3b8; float: right;">${item.data}</span>
                <strong>${item.toner}</strong><br>
                <span style="margin-top: 5px; display: block;">Peso: <b>${item.peso}g</b></span>
                <span style="display: block;">Resultado: <b style="color: #38bdf8;">${item.porcentagem}%</b> (${item.status})</span>
            </div>
        `;
    });
}

function limparHistorico() {
    if (confirm("Deseja apagar todo o histórico de pesagens recente?")) {
        localStorage.removeItem("historicoPesagens");
        renderizarHistorico();
    }
}


function imprimirEtiqueta() {
    if (ultimaPorcentagem === null) {
        alert("Calcule antes de imprimir.");
        return;
    }

    const nomeToner = modelos[ultimoModelo].nome;
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const statusToner = obterStatus(ultimaPorcentagem);

    const janela = window.open("", "_blank");

    janela.document.write(`
        <html>
        <head>
            <title>Etiqueta</title>
            <style>
                @page {
                    size: 60mm 40mm;
                    margin: 0;
                }
                * { box-sizing: border-box; }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 4mm;
                    width: 60mm;
                    height: 40mm;
                    background: #fff;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .header {
                    font-size: 9px;
                    font-weight: bold;
                    text-transform: uppercase;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 2px;
                    text-align: center;
                }
                .modelo-titulo {
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                    margin: 4px 0;
                    line-height: 1.2;
                }
                .dados {
                    font-size: 10px;
                    display: flex;
                    justify-content: space-between;
                }
                .resultado-bloco {
                    background: #000;
                    color: #fff;
                    text-align: center;
                    padding: 3px 0;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 3px;
                }
                .status-texto {
                    font-size: 8px;
                    font-weight: normal;
                    margin-top: 1px;
                }
            </style>
        </head>
        <body>
            <div class="header">Supriservice • Controle</div>
            <div class="modelo-titulo">${nomeToner}</div>
            <div class="dados">
                <span><b>Peso:</b> ${ultimoPeso}g</span>
                <span>${dataAtual} - ${horaAtual}</span>
            </div>
            <div class="resultado-bloco">
                ${ultimaPorcentagem.toFixed(1)}%
                <div class="status-texto">${statusToner.replace(/🟢|🟡|🟠|⚠️/g, '')}</div>
            </div>
        </body>
        </html>
    `);

    janela.document.close();
    janela.onload = () => {
        janela.print();
        setTimeout(() => { janela.close(); }, 500);
    };
}


document.addEventListener("DOMContentLoaded", () => {
    carregarModelosDoBanco();
    renderizarHistorico(); 

    if (modeloSelect) {
        modeloSelect.addEventListener("change", atualizarLimitePeso);
    }

    if (pesoInput) {
        pesoInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                calcular();
            }
        });
    }
});
