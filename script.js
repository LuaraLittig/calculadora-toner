const modelosPadrao = {
    kyocera3182: { nome: "Kyocera TK-3182", cheio: 800, vazio: 200 },
    brother3492: { nome: "Brother TN-3492", cheio: 1100, vazio: 500 }
};


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
                nome: item.modelo + " - " + item.toner,
                cheio: Number(item.cheio),
                vazio: Number(item.vazio)
            };
        });

        
        if (Object.keys(modelosCarregados).length === 0) {
            modelos = modelosPadrao;
        } else {
            modelos = modelosCarregados;
        }

    } catch (erro) {
        console.error("Erro ao acessar o Firebase, usando modelos padrões locais:", erro);
        modelos = modelosPadrao;
    }

   
    preencherSelectModelos();
    atualizarLimitePeso();
}

function preencherSelectModelos() {
    if (!modeloSelect) return;
    modeloSelect.innerHTML = "";

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

    if (!dados || !pesoInput) return;

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
}

function imprimirEtiqueta() {
    if (ultimaPorcentagem === null) {
        alert("Calcule antes de imprimir.");
        return;
    }

    const nomeToner = modelos[ultimoModelo].nome;
    const janela = window.open("", "_blank");

    janela.document.write(`
        <html>
        <head>
            <title>Etiqueta</title>
        </head>
        <body style="font-family:Arial;padding:20px;">
            <h2>${nomeToner}</h2>
            <p>Peso: ${ultimoPeso} g</p>
            <p>Resultado: ${ultimaPorcentagem.toFixed(2)}%</p>
        </body>
        </html>
    `);

    janela.document.close();

    janela.onload = () => {
        janela.print();
    };
}


document.addEventListener("DOMContentLoaded", () => {
  
    carregarModelosDoBanco();

  
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
