const USUARIO_CORRETO = "admin";
const SENHA_CORRETA = "toner";

function mostrarErroLogin(texto) {
    const erroBox = document.getElementById("erroLogin");

    if (erroBox) {
        erroBox.style.display = "block";
        erroBox.innerText = texto;
    }
}

function limparErroLogin() {
    const erroBox = document.getElementById("erroLogin");

    if (erroBox) {
        erroBox.style.display = "none";
        erroBox.innerText = "";
    }
}

function login() {
    // IMPORTANTE: O campo "usuario" do seu HTML agora deve receber o E-MAIL que você criou no Firebase
    const email = document.getElementById("usuario").value.trim(); 
    const Glen = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

document.addEventListener("DOMContentLoaded", () => {
    // Força a desconexão sempre que entrar na página de login.
    // Assim, o usuário DEVE digitar a senha novamente.
    localStorage.removeItem("admLogado");

    const senhaInput = document.getElementById("senha");

    if (senhaInput) {
        senhaInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                login();
            }
        });
    }
});
