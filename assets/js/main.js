(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header on scroll: só alterna sozinho em páginas com hero de foto cheia (a home).
     Páginas sem esse hero (como produtos.html) já nascem com a classe "scrolled" fixa no HTML,
     porque o menu ali fica sobre fundo claro o tempo todo, então não pode perder essa classe. */
  var header = document.querySelector(".header");
  var temHeroDeFoto = !!document.querySelector(".hero-skanvi");
  if (header && temHeroDeFoto) {
    var onScrollHeader = function () {
      if (window.scrollY > 12) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* menu mobile */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".menu-mobile");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      toggle.classList.toggle("aberto", aberto);
      document.body.style.overflow = aberto ? "hidden" : "";
      document.body.classList.toggle("menu-aberto", aberto);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("aberto");
        toggle.classList.remove("aberto");
        document.body.style.overflow = "";
        document.body.classList.remove("menu-aberto");
      });
    });
  }

  /* hero: soltar a leve escala assim que a página carrega */
  var hero = document.querySelector(".hero-skanvi");
  if (hero) {
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add("loaded"); }, 80);
    });
  }

  /* barra de progresso: preenche da esquerda pra direita conforme a página rola */
  var barraProgresso = document.getElementById("barra-progresso-preenchimento");
  if (barraProgresso) {
    var tickingProgresso = false;
    function aplicarProgresso() {
      var alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      var progresso = alturaTotal > 0 ? (window.scrollY || 0) / alturaTotal : 0;
      progresso = Math.max(0, Math.min(1, progresso));
      barraProgresso.style.width = (progresso * 100) + "%";
      tickingProgresso = false;
    }
    window.addEventListener("scroll", function () {
      if (!tickingProgresso) {
        requestAnimationFrame(aplicarProgresso);
        tickingProgresso = true;
      }
    }, { passive: true });
    window.addEventListener("resize", aplicarProgresso, { passive: true });
    aplicarProgresso();
  }

  /* hero: parallax sutil na foto da fachada, nível de sussurro */
  var heroParallax = document.getElementById("hero-imagem-parallax");
  if (heroParallax && !reduceMotion) {
    var ticking = false;
    function aplicarParallax() {
      var y = window.scrollY || 0;
      var deslocamento = Math.min(y * 0.06, 40);
      heroParallax.style.transform = "translateY(" + deslocamento + "px)";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(aplicarParallax);
        ticking = true;
      }
    }, { passive: true });
    aplicarParallax();
  }

  /* reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal, .reveal-scale");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("on"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("on");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("on"); });
  }

  /* contagem dos números (30+ etc.), pode haver mais de um na página */
  document.querySelectorAll("[data-contagem]").forEach(function (numeroEl) {
    if (!("IntersectionObserver" in window)) return;
    var alvo = parseInt(numeroEl.getAttribute("data-contagem"), 10);
    var sufixo = numeroEl.getAttribute("data-sufixo") || "";
    var contado = false;
    var ioNum = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !contado) {
            contado = true;
            if (reduceMotion) {
              numeroEl.textContent = alvo + sufixo;
              return;
            }
            var inicio = null;
            var duracao = 1100;
            function passo(ts) {
              if (!inicio) inicio = ts;
              var progresso = Math.min((ts - inicio) / duracao, 1);
              var valor = Math.floor(progresso * alvo);
              numeroEl.textContent = valor + sufixo;
              if (progresso < 1) requestAnimationFrame(passo);
              else {
                numeroEl.textContent = alvo + sufixo;
                numeroEl.classList.add("contagem-flash");
              }
            }
            requestAnimationFrame(passo);
            ioNum.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    ioNum.observe(numeroEl);
  });

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-pergunta");
    var resposta = item.querySelector(".faq-resposta");
    btn.addEventListener("click", function () {
      var estaAberto = item.classList.contains("aberto");
      document.querySelectorAll(".faq-item.aberto").forEach(function (outro) {
        if (outro !== item) {
          outro.classList.remove("aberto");
          outro.querySelector(".faq-resposta").style.maxHeight = null;
          outro.querySelector(".faq-pergunta").setAttribute("aria-expanded", "false");
        }
      });
      if (estaAberto) {
        item.classList.remove("aberto");
        resposta.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("aberto");
        resposta.style.maxHeight = resposta.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* barra de busca do header: manda para a página de produtos já filtrada */
  document.querySelectorAll("[data-busca-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var termo = form.querySelector("input[name='busca']").value.trim();
      var destino = "produtos.html";
      if (termo) destino += "?busca=" + encodeURIComponent(termo);
      window.location.href = destino;
    });
  });

  /* ano no rodapé */
  var anoEl = document.querySelector("[data-ano]");
  if (anoEl) anoEl.textContent = new Date().getFullYear();
})();
