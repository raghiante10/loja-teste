const API = "http://localhost:4000/api";
let token = "";

// listas de subcategorias
const subcategorias = {
  homem: ["Camisas", "Calças", "Bermudas", "Sapatos", "Acessórios"],
  mulher: ["Vestidos", "Blusas", "Saias", "Sapatos", "Bolsas", "Acessórios"],
  promocao: [],
  novidade: []
};

// --------- utilidades ---------

function mostrarMensagem(texto, tipo = "sucesso") {
  const msg = document.getElementById("mensagem");
  if (!msg) return;
  msg.textContent = texto;
  msg.className = tipo;
  msg.style.display = "block";
  setTimeout(() => {
    msg.style.display = "none";
  }, 30000);
}

function atualizarSubcategorias() {
  const categoria = document.getElementById("categoria").value;
  const subSelect = document.getElementById("subcategoria");
  subSelect.innerHTML = "";

  if (!subcategorias[categoria] || subcategorias[categoria].length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sem subcategoria";
    subSelect.appendChild(opt);
    subSelect.disabled = true;
  } else {
    subSelect.disabled = false;
    subcategorias[categoria].forEach(sc => {
      const opt = document.createElement("option");
      opt.value = sc.toLowerCase();
      opt.textContent = sc;
      subSelect.appendChild(opt);
    });
  }
}

document.addEventListener("DOMContentLoaded", atualizarSubcategorias);

// --------- login ---------

async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    // Ajuste aqui caso o backend retorne accessToken em vez de token
    const receivedToken = data.token || data.accessToken;

    if (receivedToken) {
      token = receivedToken;
      localStorage.setItem("token", token);
      mostrarMensagem("Você está logado!", "sucesso");

      const status = document.getElementById("statusLogin");
      if (status) {
        status.textContent = "👤 Admin logado";
        status.style.color = "green";
        status.style.fontWeight = "bold";
      }

      carregar();
    } else {
      mostrarMensagem("Login falhou: " + (data.error || "Credenciais inválidas"), "erro");
    }
  } catch (err) {
    mostrarMensagem("Erro de conexão com servidor", "erro");
  }
}

// --------- novo fluxo: adicionar à lista ---------

// Converte File em base64 (data URL)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Adicionar produto na lista (pré-cadastro)
async function adicionarProdutoNaLista() {
  const nome = document.getElementById("nome").value.trim();
  const precoVal = document.getElementById("preco").value;
  const preco = parseFloat(precoVal);
  const categoria = document.getElementById("categoria").value;
  const subcategoria = document.getElementById("subcategoria").value;
  const imagemInput = document.getElementById("imagem");

  if (!nome || isNaN(preco) || !categoria) {
    mostrarMensagem("Preencha nome, preço e categoria.", "erro");
    return;
  }

  let imagemDataUrl = "";
  // Upload local: converte para base64
  if (imagemInput && imagemInput.files && imagemInput.files[0]) {
    try {
      imagemDataUrl = await fileToDataUrl(imagemInput.files[0]);
    } catch {
      mostrarMensagem("Falha ao processar a imagem selecionada.", "erro");
      return;
    }
  } else {
    // Caso seja URL digitada (se você mantiver input type="text")
    imagemDataUrl = imagemInput.value || "";
  }

  const lista = document.getElementById("lista");
  const tr = document.createElement("tr");

  // Guardamos os dados em data-* para não depender de texto renderizado
  tr.dataset.nome = nome;
  tr.dataset.preco = String(preco);
  tr.dataset.categoria = categoria;
  tr.dataset.subcategoria = subcategoria;
  tr.dataset.imagem = imagemDataUrl;

  tr.innerHTML = `
    <td>${nome}</td>
    <td>R$ ${preco.toFixed(2).replace('.', ',')}</td>
    <td>${categoria}</td>
    <td>${subcategoria}</td>
    <td><img src="${imagemDataUrl}" alt="${nome}" width="50"></td>
    <td>
      <button class="salvar-um">Salvar</button>
      <button class="excluir-linha">Excluir</button>
    </td>
  `;

  // Eventos dos botões da linha
  tr.querySelector(".salvar-um").addEventListener("click", async () => {
    await salvarProduto({
      nome: tr.dataset.nome,
      preco: parseFloat(tr.dataset.preco),
      categoria: tr.dataset.categoria,
      subcategoria: tr.dataset.subcategoria,
      imagem: tr.dataset.imagem,
      ativo: true
    });
  });

  tr.querySelector(".excluir-linha").addEventListener("click", () => {
    tr.remove();
  });

  lista.appendChild(tr);

  mostrarMensagem("Produto adicionado à lista. Salve individualmente ou use 'Salvar Todos'.", "sucesso");
}

// Salvar um produto da lista
async function salvarProduto(produto) {
  try {
    const res = await fetch(`${API}/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(produto)
    });

    if (res.ok) {
      mostrarMensagem("Produto salvo com sucesso!", "sucesso");
      // Opcional: recarregar lista do backend para refletir estado real
      await carregar();
    } else {
      const errText = await res.text();
      mostrarMensagem("Erro ao salvar produto: " + errText, "erro");
    }
  } catch (err) {
    mostrarMensagem("Erro de conexão com servidor", "erro");
  }
}

// Salvar todos os produtos da lista
async function salvarTodos() {
  const linhas = document.querySelectorAll("#lista tr");
  if (!linhas.length) {
    mostrarMensagem("Nenhum produto na lista para salvar.", "erro");
    return;
  }

  const produtos = Array.from(linhas).map(tr => ({
    nome: tr.dataset.nome,
    preco: parseFloat(tr.dataset.preco),
    categoria: tr.dataset.categoria,
    subcategoria: tr.dataset.subcategoria,
    imagem: tr.dataset.imagem,
    ativo: true
  }));

  try {
    const res = await fetch(`${API}/produtos/lote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(produtos)
    });

    if (res.ok) {
      mostrarMensagem("Todos os produtos foram salvos!", "sucesso");
      await carregar();
    } else {
      const errText = await res.text();
      mostrarMensagem("Erro ao salvar todos: " + errText, "erro");
    }
  } catch (err) {
    mostrarMensagem("Erro de conexão com servidor", "erro");
  }
}

// --------- listar e excluir do backend ---------

async function carregar() {
  const lista = document.getElementById("lista");
  if (!localStorage.getItem("token")) {
    if (lista) lista.innerHTML = "<tr><td colspan='6'>Faça login para ver os produtos</td></tr>";
    return;
  }

  try {
    const res = await fetch(`${API}/produtos`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    const produtos = await res.json();

    lista.innerHTML = "";

    // Render dos produtos já salvos no backend
    produtos.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>R$ ${Number(p.preco).toFixed(2).replace('.', ',')}</td>
        <td>${p.categoria}</td>
        <td>${p.subcategoria}</td>
        <td><img src="${p.imagem}" alt="${p.nome}" width="50"></td>
        <td>
          <button onclick="excluir('${p._id}')">Excluir</button>
        </td>
      `;
      lista.appendChild(tr);
    });
  } catch (err) {
    mostrarMensagem("Erro ao carregar produtos", "erro");
  }
}

async function excluir(id) {
  try {
    const res = await fetch(`${API}/produtos/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (res.ok) {
      mostrarMensagem("Produto removido!", "sucesso");
      carregar();
    } else {
      const errText = await res.text();
      mostrarMensagem("Erro ao remover produto: " + errText, "erro");
    }
  } catch (err) {
    mostrarMensagem("Erro de conexão com servidor", "erro");
  }
}

// --------- cadastro em lote (form secundário) ---------

function adicionarLinha() {
  const div = document.createElement("div");
  div.className = "lote-row";
  div.innerHTML = `
    <input placeholder="Nome">
    <input type="number" step="0.01" placeholder="Preço">
    <select onchange="atualizarSubcategoriasLote(this)">
      <option value="homem">Homem</option>
      <option value="mulher">Mulher</option>
      <option value="promocao">Promoções</option>
      <option value="novidade">Novidades</option>
    </select>
    <select class="subcategoria"></select>
    <input placeholder="URL da Imagem">
  `;
  document.getElementById("lote").appendChild(div);
  atualizarSubcategoriasLote(div.querySelector("select"));
}

function atualizarSubcategoriasLote(select) {
  const categoria = select.value;
  const subSelect = select.parentElement.querySelector(".subcategoria");
  subSelect.innerHTML = "";

  if (!subcategorias[categoria] || subcategorias[categoria].length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sem subcategoria";
    subSelect.appendChild(opt);
    subSelect.disabled = true;
  } else {
    subSelect.disabled = false;
    subcategorias[categoria].forEach(sc => {
      const opt = document.createElement("option");
      opt.value = sc.toLowerCase();
      opt.textContent = sc;
      subSelect.appendChild(opt);
    });
  }
}

async function salvarLote() {
  const linhas = document.querySelectorAll(".lote-row");
  const produtos = [];

  linhas.forEach(linha => {
    const [nomeInput, precoInput, categoriaSelect, subSelect, imagemInput] = linha.querySelectorAll("input, select");
    produtos.push({
      nome: nomeInput.value,
      preco: parseFloat(precoInput.value),
      categoria: categoriaSelect.value,
      subcategoria: subSelect.value,
      imagem: imagemInput.value,
      ativo: true
    });
  });

  try {
    const res = await fetch(`${API}/produtos/lote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(produtos)
    });

    if (res.ok) {
      mostrarMensagem("Produtos cadastrados em lote com sucesso!", "sucesso");
      carregar();
    } else {
      const errText = await res.text();
      mostrarMensagem("Erro ao cadastrar em lote: " + errText, "erro");
    }
  } catch (err) {
    mostrarMensagem("Erro de conexão com servidor", "erro");
  }
}

// --------- inicialização ---------

document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("token");
  if (saved) {
    token = saved;
    const status = document.getElementById("statusLogin");
    if (status) {
      status.textContent = "👤 Admin logado";
      status.style.color = "green";
      status.style.fontWeight = "bold";
    }
    carregar();
  }
});