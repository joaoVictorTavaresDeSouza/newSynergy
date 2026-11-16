/* === CARREGAMENTO  DO LOADER AO ENTRAR === */

const MIN_TIME = 1350;
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    const startTime = performance.timing.navigationStart;
    const elapsed = Date.now() - startTime;
    const remaining = MIN_TIME - elapsed;

    setTimeout(() => {
        document.body.classList.add("loaded");

        setTimeout(() => {
            if (loader) loader.style.display = "none";
        }, 800);
    }, remaining > 0 ? remaining : 0);
});

// === MENU HAMBURGUER === //

const hamburger = document.getElementById('hamburguer');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
}

// === LOGIN / CADASTRO === //

async function enviarFormulario(endpoint, payload, mensagemSucesso) {
    const resposta = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao processar a solicitação.');
    }

    if (mensagemSucesso) {
        alert(mensagemSucesso);
    }

    return dados;
}

const formLogin = document.querySelector('.formularioLogin');
if (formLogin && document.getElementById('senha') && !document.getElementById('confirmar-senha')) {
    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email')?.value?.trim();
        const senha = document.getElementById('senha')?.value ?? '';

        if (!email || !senha) {
            alert('Preencha e-mail e senha.');
            return;
        }

        try {
            await enviarFormulario('/api/entrar', { email, senha }, 'Login realizado com sucesso!');
            window.location.href = '../../index.html';
        } catch (erro) {
            alert(erro.message);
        }
    });
}

const formCadastro = document.getElementById('confirmar-senha')?.closest('form');
if (formCadastro) {
    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();
        const senha = document.getElementById('senha')?.value ?? '';
        const confirmarSenha = document.getElementById('confirmar-senha')?.value ?? '';

        if (!nome || !email || !senha || !confirmarSenha) {
            alert('Preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            alert('As senhas não conferem.');
            return;
        }

        try {
            await enviarFormulario('/api/cadastro', { nome, email, senha }, 'Cadastro realizado com sucesso!');
            window.location.href = './login.html';
        } catch (erro) {
            alert(erro.message);
        }
    });
}