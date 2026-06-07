// ==========================================
// 1. PROTEÇÃO DE TELA (NATIVO DO FIREBASE)
// ==========================================
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        localStorage.removeItem("admLogado");
        window.location.href = "admin.html";
    } else {
        listarImpressoras(); // Carrega os dados se o usuário estiver logado
    }
});

let indiceEditandoId = null;

function limparFormulario() {
    document.getElementById("fabricante").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("toner").value = "";
    document.getElementById("cheio").value = "";
    document.getElementById("vazio").value = "";

    indiceEditandoId = null;

    if(document.getElementById("btnSalvar")) document.getElementById("btnSalvar").style.display = "block";
    if(document.getElementById("btnAtualizar")) document.getElementById("btnAtualizar").style.display = "none";
}

// ==========================================
// 2. FUNÇÃO: SALVAR IMPRESSORA
// ==========================================
async function salvarImpressora() {
    const fabricante = document.getElementById("fabricante").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const toner = document.getElementById("toner").value.trim();
    const cheio = parseFloat(document.getElementById("cheio").value);
    const vazio = parseFloat(document.getElementById("vazio").value);

    if (!fabricante || !modelo || !toner || isNaN(cheio) || isNaN(vazio)) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    try {
        await db.collection("impressoras").add({
            fabricante,
            modelo,
            toner,
            cheio,
            vazio,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });

        limparFormulario();
        listarImpressoras();
    } catch (erro) {
        console.error("Erro ao salvar no Firebase:", erro);
        alert("Erro ao salvar os dados.");
    }
}

// ==========================================
// 3. OUTRAS FUNÇÕES DE GERENCIAMENTO
// ==========================================
async function editarImpressora(id) {
    try {
        const doc = await db.collection("impressoras").doc(id).get();
        if (!doc.exists) return;

        const item = doc.data();
        document.getElementById("fabricante").value = item.fabricante;
        document.getElementById("modelo").value = item.modelo;
        document.getElementById("toner").value = item.toner;
        document.getElementById("cheio").value = item.cheio;
        document.getElementById("vazio").value = item.vazio;

        indiceEditandoId = id;

        if(document.getElementById("btnSalvar")) document.getElementById("btnSalvar").style.display = "none";
        if(document.getElementById("btnAtualizar")) document.getElementById("btnAtualizar").style.display = "block";
    } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
    }
}

async function atualizarImpressora() {
    if (!indiceEditandoId) return;

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
        await db.collection("impressoras").doc(indiceEditandoId).update({
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
    }
}

async function excluirImpressora(id) {
    if (!confirm("Deseja realmente excluir esta impressora?")) return;

    try {
        await db.collection("impressoras").doc(id).delete();
        listarImpressoras();
    } catch (erro) {
        console.error("Erro ao excluir:", erro);
    }
}

async function listarImpressoras() {
    const div = document.getElementById("listaImpressoras");
    if (!div) return;
    div.innerHTML = "";

    try {
        const snapshot = await db.collection("impressoras").get();

        if (snapshot.empty) {
            div.innerHTML = "<p style='text-align:center;'>Nenhuma impressora cadastrada.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const item = doc.data();
            const id = doc.id;

            div.innerHTML += `
                <div class="item-toner">
                    <strong>${item.modelo}</strong><br>
                    <span>Fabricante: ${item.fabricante}</span><br>
                    <span>Toner: ${item.toner}</span>
                    <div class="acoes">
                        <button class="btn-editar" onclick="editarImpressora('${id}')">Editar</button>
                        <button class="btn-excluir" onclick="excluirImpressora('${id}')">Excluir</button>
                    </div>
                </div>
            `;
        });
    } catch (erro) {
        console.error("Erro ao listar:", erro);
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
        localStorage.removeItem("admLogado");
        window.location.href = "admin.html";
    });
}

// ==========================================
// 4. BLINDAGEM FORÇADA DE ESCOPO GLOBAL
// ==========================================
window.salvarImpressora = salvarImpressora;
window.listarImpressoras = listarImpressoras;
window.editarImpressora = editarImpressora;
window.atualizarImpressora = atualizarImpressora;
window.excluirImpressora = excluirImpressora;
window.logout = logout;
