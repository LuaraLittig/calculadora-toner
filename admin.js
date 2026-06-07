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
   
    const email = document.getElementById("usuario").value.trim(); 
    const Glen = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    
    firebase.auth().signInWithEmailAndPassword(email, senha)
        .then((userCredential) => {
    
            localStorage.setItem("admLogado", "true");
            window.location.href = "impressoras.html";
        })
        .catch((error) => {
            console.error("Erro ao logar:", error.message);
            alert("E-mail ou senha incorretos! ❌");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    
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
