import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const lista = document.getElementById("lista-presentes");
const loading = document.getElementById("loading-state");

let presentesMap = [];

async function carregarPresentes() {
    try {
        const querySnapshot = await getDocs(collection(db, "presentes"));

        if (loading) loading.style.display = "none";

        lista.innerHTML = "";

        let taken = 0;
        let total = 0;

        querySnapshot.forEach((docSnap, index) => {
            const item = docSnap.data();
            total++;

            const isTaken = !!item.escolhidoPor;
            if (isTaken) taken++;

            presentesMap.push({
                id: docSnap.id,
                ...item
            });

            const div = document.createElement("div");
            div.className = "gift-card fade-in" + (isTaken ? " taken" : "");

            div.innerHTML = `
                <div class="gift-img-wrap">
                    <img src="${item.imagem}" alt="${item.nome}">
                    ${isTaken ? '<div class="taken-badge">Escolhido ✓</div>' : ""}
                </div>

                <div class="gift-info">
                    <h3 class="gift-name">${item.nome}</h3>

                    ${item.linkCompra
                    ? `<a href="${item.linkCompra}" target="_blank" class="gift-link">
                            Sugestão de onde comprar
                          </a>`
                    : ""
                }

                    <div class="gift-footer">
                        ${isTaken
                    ? `<div class="taken-by">Escolhido por <strong>${item.escolhidoPor}</strong></div>`
                    : `<div class="input-wrap">
                                <input
                                    type="text"
                                    placeholder="Seu nome aqui"
                                    data-id="${docSnap.id}"
                                >
                               </div>`
                }
                    </div>
                </div>
            `;

            lista.appendChild(div);
        });

        const progress = Math.round((taken / total) * 100);

        lista.insertAdjacentHTML("beforebegin", `
            <div class="progress-bar-wrap fade-in">
                <div class="progress-labels">
                    <span>${taken} de ${total} presentes já escolhidos</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            </div>
        `);

    } catch (error) {
        console.error(error);
    }
}

carregarPresentes();

window.confirmarPresentes = async function () {
    const inputs = document.querySelectorAll("input[data-id]");
    const updates = [];

    inputs.forEach(input => {
        if (input.value.trim()) {
            updates.push({
                id: input.dataset.id,
                nome: input.value.trim()
            });
        }
    });

    if (updates.length === 0) {
        showToast("Digite seu nome em pelo menos um presente");
        return;
    }

    try {
        for (const item of updates) {
            const ref = doc(db, "presentes", item.id);

            await updateDoc(ref, {
                escolhidoPor: item.nome
            });
        }

        window.location.href = "obrigado.html";
    } catch (error) {
        console.error(error);
        showToast("Erro ao confirmar");
    }
};

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.display = "block";
    t.classList.add("show");

    setTimeout(() => {
        t.classList.remove("show");
        setTimeout(() => t.style.display = "none", 400);
    }, 3000);
}