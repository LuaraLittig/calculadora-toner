// Verifica se o admin está logado localmente
if (localStorage.getItem("admLogado") !== "true") {
    window.location.href = "admin.html";
}

// Guarda o ID do documento que está sendo editado no momento
let idEditando = null;

// BUSCAR DO BANCO: Lista as impressoras direto da nuvem
async function listarImpressoras() {
    const div = document.getElementById("listaImpressoras");
    if (!div) return;

    div.innerHTML = "<p style='text-align:center;'>Carregando impressoras...</p>";

    try {
        const snapshot = await fbGetDocs(
    fbCollection(db, "impressoras")
);

        if (snapshot.empty) {
            div.innerHTML = "<p style='text-align:center;'>Nenhuma impressora cadastrada.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const item = doc.data();
            const id = doc.id; // ID único do Firebase

            div.innerHTML += `
                <div class="item-toner">
                    <strong>${item.modelo}</strong><br>
                    <span>Fabricante: ${item.fabricante}</span><br>
                    <span>Toner: ${item.toner}</span>
                    <span>Peso Cheio: ${item.cheio}g | Vazio: ${item.vazio}g</span>

                    <div class="acoes">
                        <button class="btn-editar" 
                            onclick="editarImpressora('${id}', '${item.fabricante}', '${item.modelo}', '${item.toner}', ${item.cheio}, ${item.vazio})">
                            Editar
                        </button>
                        <button class="btn-excluir" 
                            onclick="excluirImpressora('${id}')">
                            Excluir
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (erro) {
        console.error("Erro ao listar do Firebase:", erro);
        div.innerHTML = "<p style='text-align:center; color:red;'>Erro ao carregar os dados. ❌</p>";
    }
}

// SALVAR NO BANCO: Adiciona um novo documento na nuvem
async function salvarImpressora() {
    const fabricante = document.getElementById("fabricante").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const toner = document.getElementById("toner").value.trim();
    const cheio = parseFloat(document.getElementById("cheio").value);
    const vazio = parseFloat(document.getElementById("vazio").value);

    if (!fabricante || !modelo || !toner || isNaN(cheio) || isNaN(vazio)) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        await fbAddDoc(
    fbCollection(db, "impressoras"),
    {
        fabricante,
        modelo,
        toner,
        cheio,
        vazio
    }
);

        limparFormulario();
        listarImpressoras();
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        alert("Erro ao salvar no banco de dados.");
    }
}

// Prepara o formulário com os dados da linha clicada
function editarImpressora(id, fabricante, modelo, toner, cheio, vazio) {
    idEditando = id;

    document.getElementById("fabricante").value = fabricante;
    document.getElementById("modelo").value = modelo;
    document.getElementById("toner").value = toner;
    document.getElementById("cheio").value = cheio;
    document.getElementById("vazio").value = vazio;

    document.getElementById("btnSalvar").style.display = "none";
    document.getElementById("btnAtualizar").style.display = "block";
}

// ATUALIZAR NO BANCO: Salva as alterações feitas em um registro existente
async function atualizarImpressora() {
    if (!idEditando) return;

    const fabricante = document.getElementById("fabricante").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const toner = document.getElementById("toner").value.trim();
    const cheio = parseFloat(document.getElementById("cheio").value);
    const vazio = parseFloat(document.getElementById("vazio").value);

    if (!fabricante || !modelo || !toner || isNaN(cheio) || isNaN(vazio)) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        await db.collection("impressoras").doc(idEditando).set({
            fabricante,
            modelo,
            toner,
            cheio,
            vazio
        });

        limparFormulario();
        listarImpressoras();
    } catch (erro) {
        console.error("Erro ao atualizar:", erro);
        alert("Erro ao atualizar dados.");
    }
}

// EXCLUIR DO BANCO: Remove o documento usando o ID único
async function excluirImpressora(id) {
    if (!confirm("Deseja realmente excluir esta impressora?")) {
        return;
    }

    try {
        await db.collection("impressoras").doc(id).delete();
        listarImpressoras();
    } catch (erro) {
        console.error("Erro ao deletar:", erro);
        alert("Erro ao excluir do banco de dados.");
    }
}

function limparFormulario() {
    document.getElementById("fabricante").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("toner").value = "";
    document.getElementById("cheio").value = "";
    document.getElementById("vazio").value = "";

    idEditando = null;

    document.getElementById("btnSalvar").style.display = "block";
    document.getElementById("btnAtualizar").style.display = "none";
}

function logout() {
    localStorage.removeItem("admLogado");
    window.location.href = "admin.html";
}

// Executa automaticamente assim que a página abre
document.addEventListener("DOMContentLoaded", listarImpressoras);