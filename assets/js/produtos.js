(function () {
  "use strict";

  var grid = document.getElementById("produtos-grid");
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card-produto"));
  var selCategoria = document.getElementById("filtro-categoria");
  var selMarca = document.getElementById("filtro-marca");
  var inputBusca = document.getElementById("filtro-busca");
  var contagemEl = document.getElementById("filtros-contagem");
  var vazioEl = document.getElementById("produtos-vazio");

  var rotulosCategoria = {
    sala: "Sala", quarto: "Quarto", cozinha: "Cozinha",
    lavanderia: "Lavanderia", celulares: "Celulares"
  };

  function normalizar(texto) {
    return (texto || "").toString().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* mapa marca-slug -> rótulo visível, lido direto dos cards */
  var marcaLabels = {};
  cards.forEach(function (card) {
    var slug = card.getAttribute("data-marca");
    var label = card.querySelector(".tag-marca");
    if (slug && label && !marcaLabels[slug]) marcaLabels[slug] = label.textContent.trim();
  });

  function marcasDaCategoria(categoria) {
    var set = {};
    cards.forEach(function (card) {
      if (categoria === "todas" || card.getAttribute("data-categoria") === categoria) {
        set[card.getAttribute("data-marca")] = true;
      }
    });
    return Object.keys(set).sort(function (a, b) {
      return marcaLabels[a].localeCompare(marcaLabels[b], "pt-BR");
    });
  }

  function atualizarOpcoesMarca() {
    var categoria = selCategoria.value;
    var marcaAtual = selMarca.value;
    var marcas = marcasDaCategoria(categoria);
    selMarca.innerHTML = '<option value="todas">Todas as marcas</option>' +
      marcas.map(function (slug) {
        return '<option value="' + slug + '">' + marcaLabels[slug] + "</option>";
      }).join("");
    selMarca.value = marcas.indexOf(marcaAtual) > -1 ? marcaAtual : "todas";
  }

  function aplicarFiltros() {
    var categoria = selCategoria.value;
    var marca = selMarca.value;
    var busca = normalizar(inputBusca.value.trim());
    var visiveis = 0;

    cards.forEach(function (card) {
      var okCategoria = categoria === "todas" || card.getAttribute("data-categoria") === categoria;
      var okMarca = marca === "todas" || card.getAttribute("data-marca") === marca;
      var okBusca = true;
      if (busca) {
        var texto = normalizar(card.querySelector("h3").textContent + " " + card.querySelector(".tag-marca").textContent);
        okBusca = texto.indexOf(busca) > -1;
      }
      var mostrar = okCategoria && okMarca && okBusca;
      card.hidden = !mostrar;
      if (mostrar) visiveis++;
    });

    contagemEl.textContent = visiveis + (visiveis === 1 ? " produto" : " produtos");
    vazioEl.hidden = visiveis > 0;
  }

  selCategoria.addEventListener("change", function () {
    atualizarOpcoesMarca();
    aplicarFiltros();
  });
  selMarca.addEventListener("change", aplicarFiltros);
  inputBusca.addEventListener("input", aplicarFiltros);

  /* categoria vinda pela URL, ex: produtos.html?categoria=sala */
  var params = new URLSearchParams(window.location.search);
  var categoriaUrl = params.get("categoria");
  if (categoriaUrl && rotulosCategoria[categoriaUrl]) {
    selCategoria.value = categoriaUrl;
  }

  /* busca vinda pela URL, ex: produtos.html?busca=sofa (barra de busca do header) */
  var buscaUrl = params.get("busca");
  if (buscaUrl) {
    inputBusca.value = buscaUrl;
  }

  atualizarOpcoesMarca();
  aplicarFiltros();

  /* lightbox: clicar na foto do produto abre em tamanho maior */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector(".lightbox-imagem-wrap img");
    var lightboxLegenda = lightbox.querySelector(".lightbox-legenda");
    var lightboxFechar = lightbox.querySelector(".lightbox-fechar");
    var focoAnterior = null;

    function abrirLightbox(src, alt) {
      focoAnterior = document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightboxLegenda.textContent = alt || "";
      lightbox.classList.add("aberto");
      lightboxFechar.focus();
      document.body.style.overflow = "hidden";
    }

    function fecharLightbox() {
      lightbox.classList.remove("aberto");
      document.body.style.overflow = "";
      if (focoAnterior) focoAnterior.focus();
    }

    cards.forEach(function (card) {
      var media = card.querySelector(".produto-media");
      if (!media) return;
      var img = media.querySelector("img");
      if (!img) return; // cards sem foto (ícone) não abrem lightbox
      media.addEventListener("click", function () {
        abrirLightbox(img.src, img.alt);
      });
    });

    lightboxFechar.addEventListener("click", fecharLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) fecharLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("aberto")) fecharLightbox();
    });
  }
})();
