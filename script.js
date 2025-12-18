// ===== Util =====
const moedaBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function obterCarrinho() {
  try {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
  } catch {
    return [];
  }
}

function salvarCarrinho(carrinho) {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// ===== API Global =====
window.adicionarAoCarrinho = function (nome, preco) {
  const carrinho = obterCarrinho();
  // Se já existe, só incrementa quantidade
  const idx = carrinho.findIndex(i => i.nome === nome);
  if (idx >= 0) {
    carrinho[idx].qtd += 1;
  } else {
    carrinho.push({ nome, preco: Number(preco), qtd: 1 });
  }
  salvarCarrinho(carrinho);
  renderCarrinho(); // atualiza visual se a página tem carrinho
};

window.removerDoCarrinho = function (nome) {
  let carrinho = obterCarrinho();
  carrinho = carrinho.filter(i => i.nome !== nome);
  salvarCarrinho(carrinho);
  renderCarrinho();
};

window.diminuirQuantidade = function (nome) {
  const carrinho = obterCarrinho();
  const idx = carrinho.findIndex(i => i.nome === nome);
  if (idx >= 0) {
    carrinho[idx].qtd -= 1;
    if (carrinho[idx].qtd <= 0) {
      carrinho.splice(idx, 1);
    }
    salvarCarrinho(carrinho);
    renderCarrinho();
  }
};

window.aumentarQuantidade = function (nome) {
  const carrinho = obterCarrinho();
  const idx = carrinho.findIndex(i => i.nome === nome);
  if (idx >= 0) {
    carrinho[idx].qtd += 1;
    salvarCarrinho(carrinho);
    renderCarrinho();
  }
};

// ===== Render =====
function renderCarrinho() {
  const lista = document.getElementById('lista-carrinho');
  const totalEl = document.getElementById('total');

  // Se a página não tem carrinho, não faz nada
  if (!lista || !totalEl) return;

  const carrinho = obterCarrinho();

  // Limpa e recria
  lista.innerHTML = '';

  let total = 0;
  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.nome}</span>
      <span>
        ${moedaBRL.format(item.preco)} × ${item.qtd}
        <button style="margin-left:8px" onclick="diminuirQuantidade('${item.nome.replace(/'/g, "\\'")}')">−</button>
        <button onclick="aumentarQuantidade('${item.nome.replace(/'/g, "\\'")}')">+</button>
        <button style="margin-left:8px" onclick="removerDoCarrinho('${item.nome.replace(/'/g, "\\'")}')">Remover</button>
      </span>
    `;
    lista.appendChild(li);
    total += item.preco * item.qtd;
  });

  totalEl.textContent = total.toFixed(2).replace('.', ',');
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderCarrinho();
});