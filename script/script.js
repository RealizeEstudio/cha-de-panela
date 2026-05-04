var API_URL = "https://script.google.com/macros/s/AKfycbznlwiWGBUN95-W-xASinQE4A20R8VMncZNGOAJjsfluJ_-jxtQGhNH4mVFerMXmZff/exec";

var presenteAtualLinha = null;
var presenteAtualNome = null;

fetch(API_URL)
    .then(function (res) { return res.json(); })
    .then(function (dados) {
        var loading = document.getElementById("loading-state");
        if (loading) loading.style.display = "none";

        var taken = dados.filter(function (i) { return i[3]; }).length;
        var total = dados.length;
        var pct = total ? Math.round((taken / total) * 100) : 0;

        // Barra de progresso
        var progressWrap = document.getElementById("progress-wrap");
        if (progressWrap) {
            progressWrap.innerHTML =
                '<div class="progress-bar-wrap fade-in delay-2">' +
                '<div class="progress-labels">' +
                '<span>' + taken + ' de ' + total + ' presentes já escolhidos</span>' +
                '<span>' + pct + '%</span>' +
                '</div>' +
                '<div class="progress-track">' +
                '<div class="progress-fill" style="width:' + pct + '%"></div>' +
                '</div>' +
                '</div>';
        }

        // Cards
        var lista = document.getElementById("lista-presentes");
        dados.forEach(function (item, index) {
            var isTaken = !!item[3];
            var linha = index + 2;

            var div = document.createElement("div");
            div.className = "gift-card fade-in" + (isTaken ? " taken" : "");
            div.style.animationDelay = (index * 0.04) + "s";

            var linkHtml = item[2]
                ? '<a href="' + item[2] + '" target="_blank" class="gift-link">' +
                '<svg viewBox="0 0 16 16" fill="none" width="13">' +
                '<path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M9 2h5v5M14 2L8 8"' +
                ' stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
                'Sugestão de onde comprar' +
                '</a>'
                : "";

            var footerHtml = isTaken
                ? '<div class="taken-by"><span class="taken-heart">♥</span> Escolhido por <strong>' + item[3] + '</strong></div>'
                : '<button class="btn-escolher" onclick="abrirModal(' + linha + ', \'' + item[0].replace(/'/g, "\\'").replace(/\n/g, " ") + '\')">' +
                '<svg viewBox="0 0 20 20" fill="none" width="14">' +
                '<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
                '</svg>' +
                'Escolher este presente' +
                '</button>';

            div.innerHTML =
                '<div class="gift-img-wrap">' +
                '<img src="' + item[1] + '" alt="' + item[0].replace(/\n/g, " ") + '" loading="lazy">' +
                (isTaken ? '<div class="taken-badge">Escolhido ✓</div>' : '') +
                '</div>' +
                '<div class="gift-info">' +
                '<h3 class="gift-name">' + item[0].replace(/\n/g, "<br>") + '</h3>' +
                linkHtml +
                '<div class="gift-footer">' + footerHtml + '</div>' +
                '</div>';

            lista.appendChild(div);
        });
    })
    .catch(function (err) {
        var loading = document.getElementById("loading-state");
        if (loading) loading.innerHTML = '<p class="error-msg">Não foi possível carregar a lista. Tente novamente.</p>';
        console.error(err);
    });

function abrirModal(linha, nome) {
    presenteAtualLinha = linha;
    presenteAtualNome = nome;

    document.getElementById("modal-gift-label").textContent = nome;
    document.getElementById("modal-nome").value = "";

    var overlay = document.getElementById("modal-overlay");
    var modal = document.getElementById("confirm-modal");
    overlay.style.display = "block";
    modal.style.display = "flex";

    requestAnimationFrame(function () {
        modal.classList.add("open");
        overlay.classList.add("open");
    });

    setTimeout(function () {
        document.getElementById("modal-nome").focus();
    }, 200);
}

function fecharModal() {
    var modal = document.getElementById("confirm-modal");
    var overlay = document.getElementById("modal-overlay");
    modal.classList.remove("open");
    overlay.classList.remove("open");
    setTimeout(function () {
        modal.style.display = "none";
        overlay.style.display = "none";
    }, 280);
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fecharModal();
});

function confirmarEscolha() {
    var nome = document.getElementById("modal-nome").value.trim();
    if (!nome) {
        var input = document.getElementById("modal-nome");
        input.classList.add("shake");
        setTimeout(function () { input.classList.remove("shake"); }, 500);
        return;
    }

    var btn = document.getElementById("modal-btn-confirm");
    btn.classList.add("loading");
    btn.querySelector("span").textContent = "Confirmando...";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify([{ linha: presenteAtualLinha, nome: nome }])
    })
        .then(function () {
            fecharModal();
            localStorage.setItem("musica", "tocando");
            setTimeout(function () {
                window.location.href = "obrigado.html";
            }, 350);
        })
        .catch(function (err) {
            showToast("Ocorreu um erro. Tente novamente.");
            btn.classList.remove("loading");
            btn.querySelector("span").textContent = "Confirmar presente";
            console.error(err);
        });
}

function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    t.classList.add("show");
    setTimeout(function () {
        t.classList.remove("show");
        setTimeout(function () { t.style.display = "none"; }, 400);
    }, 3500);
}