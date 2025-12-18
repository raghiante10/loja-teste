const API = "http://localhost:4000/api";

// Carregar produtos
async function carregarControle() {
  const res = await fetch(`${API}/produtos`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });
  const produtos = await res.json();

  const lista = document.getElementById("lista-controle");
  lista.innerHTML = "";

  produtos.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>R$ ${p.preco.toFixed(2).replace('.', ',')}</td>
      <td>${p.categoria}</td>
      <td>${p.subcategoria}</td>
      <td><img src="${p.imagem}" alt="${p.nome}" width="50"></td>
      <td>
        <button onclick="apagarProduto('${p._id}')">Excluir</button>
      </td>
    `;
    lista.appendChild(tr);
  });
}

// Apagar produto
async function apagarProduto(id) {
  const res = await fetch(`${API}/produtos/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  if (res.ok) {
    alert("Produto removido com sucesso!");
    carregarControle();
  } else {
    alert("Erro ao remover produto");
  }
}

// Carregar lista ao abrir controle.html
document.addEventListener("DOMContentLoaded", carregarControle);