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
    limparErroLogin();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (usuario === USUARIO_CORRETO && senha === SENHA_CORRETA) {
        localStorage.setItem("admLogado", "true");
        window.location.href = "impressoras.html";
    } else {
        mostrarErroLogin("Usuário ou senha inválidos ❌");
    }
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