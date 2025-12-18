async function carregarProdutos(query, containerId) {
  try {
    const res = await fetch(`http://localhost:4000/api/produtos?${query}`);
    const produtos = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    produtos.forEach(p => {
      const card = document.createElement("div");
      card.className = "item";
      card.innerHTML = `
        <img src="${p.imagem || 'img/placeholder.jpg'}" alt="${p.nome}">
        <h3>${p.nome}</h3>
        ${
          p.precoOriginal
            ? `<p><s>R$ ${p.precoOriginal.toFixed(2).replace('.', ',')}</s> R$ ${p.preco.toFixed(2).replace('.', ',')}</p>`
            : `<p>R$ ${p.preco.toFixed(2).replace('.', ',')}</p>`
        }
        <button onclick="adicionarAoCarrinho('${p.nome.replace(/'/g, "\\'")}', ${p.preco})">Comprar</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}