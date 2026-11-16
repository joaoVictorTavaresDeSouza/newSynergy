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

/* === CONTROLE DE SESSÃO E PERFIL === */

const API_BASE = 'http://localhost:8080';

async function recuperarPerfil() {
    try {
        const resposta = await fetch(`${API_BASE}/api/painel`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!resposta.ok) return null;
        const dados = await resposta.json();
        return dados.nome || 'Usuário';
    } catch {
        return null;
    }
}

async function trocarLoginPorPerfil() {
    const nome = await recuperarPerfil();
    if (!nome) return;

    const loginLinks = [...document.querySelectorAll('a[href*="login.html"], a.login, .login')];
    const linkLogin = loginLinks.find((link) => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        return href.includes('login.html') || href === './login.html' || href === '/login.html';
    }) || loginLinks[0];

    if (!linkLogin) return;

    const li = linkLogin.closest('li') || linkLogin.parentElement;
    if (!li) return;

    const perfilHref = window.location.pathname.includes('/src/pages/')
        ? './perfil.html'
        : './src/pages/perfil.html';

    const nomeCurto = nome.trim().split(' ')[0];
    const perfil = document.createElement('a');
    perfil.href = perfilHref;
    perfil.className = 'login perfilUsuario';
    perfil.innerHTML = `<strong>👤 ${nomeCurto}</strong>`;
    perfil.title = `Perfil de ${nome}`;

    li.innerHTML = '';
    li.appendChild(perfil);
}

window.addEventListener('load', async () => {
    await trocarLoginPorPerfil();
    const paginaPerfil = document.body.dataset.page === 'perfil';
    if (!paginaPerfil) return;

    const nomeEl = document.getElementById('nomeUsuario');
    const emailEl = document.getElementById('emailUsuario');
    const logoutBtn = document.getElementById('logoutBtn');

    const nome = await recuperarPerfil();
    if (nomeEl) nomeEl.textContent = nome || 'Usuário';
    if (emailEl) {
        emailEl.textContent = 'Carregando...';
        try {
            const resposta = await fetch(`${API_BASE}/api/painel`, {
                method: 'GET',
                credentials: 'include',
            });
            const dados = await resposta.json().catch(() => ({}));
            emailEl.textContent = dados.email || 'E-mail não informado';
        } catch {
            emailEl.textContent = 'E-mail não informado';
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch(`${API_BASE}/api/sair`, {
                    method: 'POST',
                    credentials: 'include',
                });
            } finally {
                window.location.href = './login.html';
            }
        });
    }
});