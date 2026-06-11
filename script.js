
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
            <title>Imprimir Etiqueta</title>
            <style>
               
                @page {
                    size: 60mm 40mm; 
                    margin: 0;       
                }
                
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    margin: 0;
                    padding: 4mm; /* Espaçamento interno para o texto não colar na borda */
                    width: 60mm;
                    height: 40mm;
                    background: #fff;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                /* Topo da etiqueta */
                .header {
                    font-size: 9px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 2px;
                    text-align: center;
                }

                /* Nome do modelo/toner centralizado e em destaque */
                .modelo-titulo {
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                    margin: 4px 0;
                    line-height: 1.2;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Informações de peso e dados extras */
                .dados {
                    font-size: 10px;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2px;
                }

                /* Destaque visual grande para a porcentagem */
                .resultado-bloco {
                    background: #000;
                    color: #fff;
                    text-align: center;
                    padding: 3px 0;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 3px;
                    text-transform: uppercase;
                }

                .status-texto {
                    font-size: 8px;
                    text-align: center;
                    font-weight: normal;
                    margin-top: 1px;
                    color: #fff;
                }
            </style>
        </head>
        <body>

            <div class="header">
                Supriservice • Controle de Qualidade
            </div>

            <div class="modelo-titulo">
                ${nomeToner}
            </div>

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
        
        setTimeout(() => {
            janela.close();
        }, 500);
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
