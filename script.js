
// ==========================================
// CONSCIENTE+
// ==========================================


// NAVEGAÇÃO
function abrirPagina(nome) {
    document.querySelectorAll(".pagina").forEach(function(pagina) {
        pagina.hidden = true;
    });

    const pagina = document.getElementById(nome);

    if (pagina) {
        pagina.hidden = false;
    }

    if (nome === "relatorios") {
        mostrarGrafico();
    }

    if (nome === "despesas") {
        mostrarDespesas();
    }
}

function voltarInicio() {
    abrirPagina("inicio");
}


// ==========================================
// MINHAS DESPESAS
// ==========================================

let despesas = JSON.parse(localStorage.getItem("despesas") || "[]");
let indiceEdicao = null;

function salvarDespesas() {
    localStorage.setItem("despesas", JSON.stringify(despesas));
}

function adicionarDespesa() {
    const descricao = document.getElementById("descricao").value.trim();
    const valorDigitado = document.getElementById("valor").value;
    const valor = Number(valorDigitado);
    const categoria = document.getElementById("categoria").value;
    const data = document.getElementById("data").value;

    if (!descricao || valorDigitado === "" || valor <= 0 || !data || !categoria) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const despesa = {
        descricao: descricao,
        valor: valor,
        categoria: categoria,
        data: data
    };

    if (indiceEdicao !== null) {
        despesas[indiceEdicao] = despesa;
        indiceEdicao = null;
    } else {
        despesas.push(despesa);
    }

    salvarDespesas();
    mostrarDespesas();

    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("data").value = "";

    alert("Despesa salva com sucesso!");
}

function mostrarDespesas() {
    const lista = document.getElementById("listaDespesas");
    if (!lista) return;

    lista.innerHTML = "";

    const filtro = document.getElementById("filtroCategoria");
    const categoriaFiltro = filtro ? filtro.value : "Todas";

    const filtradas = despesas.filter(function(despesa) {
        return categoriaFiltro === "Todas" ||
            categoriaFiltro === "Todas as categorias" ||
            despesa.categoria === categoriaFiltro;
    });

    filtradas.forEach(function(despesa) {
        const indice = despesas.indexOf(despesa);

        const item = document.createElement("div");
        item.className = "item-despesa";

        const titulo = document.createElement("p");
        titulo.textContent = despesa.descricao;

        const detalhes = document.createElement("p");
        detalhes.textContent =
            "R$ " + Number(despesa.valor).toFixed(2) +
            " | " + despesa.categoria +
            " | " + despesa.data;

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.type = "button";
        editar.style.backgroundColor = "#269568";
        editar.style.color = "#ffffff";
        editar.onclick = function() {
            editarDespesa(indice);
        };

        const excluir = document.createElement("button");
        excluir.textContent = "Excluir";
        excluir.type = "button";
        excluir.style.backgroundColor = "#dc3545";
        excluir.style.color = "#ffffff";
        excluir.onclick = function() {
            excluirDespesa(indice);
        };

        item.append(titulo, detalhes, editar, excluir);
        lista.appendChild(item);
    });

    const total = despesas.reduce(function(soma, despesa) {
        return soma + Number(despesa.valor);
    }, 0);

    const campoTotal = document.getElementById("totalDespesas");

    if (campoTotal) {
        campoTotal.textContent = "R$ " + total.toFixed(2);
    }
}

function editarDespesa(indice) {
    const despesa = despesas[indice];

    document.getElementById("descricao").value = despesa.descricao;
    document.getElementById("valor").value = despesa.valor;
    document.getElementById("categoria").value = despesa.categoria;
    document.getElementById("data").value = despesa.data;

    indiceEdicao = indice;

    alert("Altere os dados e clique em salvar.");
}

function excluirDespesa(indice) {
    if (!confirm("Deseja realmente excluir esta despesa?")) {
        return;
    }

    despesas.splice(indice, 1);

    salvarDespesas();
    mostrarDespesas();
}
document.addEventListener("DOMContentLoaded", function() {
    const formulario = document.querySelector("#despesas form");

    if (formulario) {
        formulario.addEventListener("submit", function(evento) {
            evento.preventDefault();
            adicionarDespesa();
        });
    }
});

// ==========================================
// RELATÓRIOS
// ==========================================

let relatorios = JSON.parse(localStorage.getItem("relatorios") || "[]");

function salvarRelatorios() {
    localStorage.setItem("relatorios", JSON.stringify(relatorios));
}

function adicionarRelatorio() {
    const campoMes = document.getElementById("mesRelatorio");
    const campoValor = document.getElementById("valorRelatorio");

    if (!campoMes || !campoValor) {
        alert("Não encontrei os campos do relatório.");
        return;
    }

    const mes = campoMes.value;
    const valorDigitado = campoValor.value;
    const valor = Number(valorDigitado);

    if (!mes || valorDigitado === "" || !Number.isFinite(valor) || valor <= 0) {
        alert("Informe o mês e um valor maior que zero.");
        return;
    }

    const existente = relatorios.find(function(item) {
        return item.mes === mes;
    });

    if (existente) {
        existente.valor = valor;
    } else {
        relatorios.push({
            mes: mes,
            valor: valor
        });
    }

    relatorios.sort(function(a, b) {
        return a.mes.localeCompare(b.mes);
    });

    salvarRelatorios();
    mostrarGrafico();

    campoValor.value = "";

    alert("Relatório salvo com sucesso!");
}

window.adicionarRelatorio = adicionarRelatorio;


// EDITAR RELATÓRIO
function editarRelatorio(mes) {
    const relatorio = relatorios.find(function(item) {
        return item.mes === mes;
    });

    if (!relatorio) return;

    document.getElementById("mesRelatorio").value = relatorio.mes;
    document.getElementById("valorRelatorio").value = relatorio.valor;

    document.getElementById("mesRelatorio").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


// EXCLUIR RELATÓRIO
function excluirRelatorio(mes) {
    if (!confirm("Deseja excluir este mês do relatório?")) {
        return;
    }

    relatorios = relatorios.filter(function(item) {
        return item.mes !== mes;
    });

    salvarRelatorios();
    mostrarGrafico();
}


// ==========================================
// GRÁFICO DE LINHAS ANIMADO
// ==========================================

function mostrarGrafico() {
    const area = document.getElementById("graficoDespesas");

    if (!area) return;

    area.innerHTML = "";

    if (relatorios.length === 0) {
        area.textContent = "Cadastre seus gastos mensais para visualizar o gráfico.";
        return;
    }

    const largura = Math.max(320, relatorios.length * 90);
    const altura = 230;
    const margemEsquerda = 45;
    const margemDireita = 20;
    const margemSuperior = 25;
    const margemInferior = 40;

    const maiorValor = Math.max(
        ...relatorios.map(function(item) {
            return Number(item.valor);
        })
    );

    const limite = maiorValor * 1.2;
    const areaUtil = altura - margemSuperior - margemInferior;
    const espacamento = (largura - margemEsquerda - margemDireita) /
        Math.max(1, relatorios.length - 1);

    const pontos = relatorios.map(function(item, indice) {
        const x = relatorios.length === 1
            ? largura / 2
            : margemEsquerda + indice * espacamento;

        const y = margemSuperior +
            areaUtil * (1 - Number(item.valor) / limite);

        return { x: x, y: y, item: item };
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("viewBox", "0 0 " + largura + " " + altura);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", altura);
    svg.style.overflow = "visible";

    // Linhas horizontais de referência
    for (let i = 0; i < 4; i++) {
        const y = margemSuperior + i * (areaUtil / 3);

        const linhaFundo = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

        linhaFundo.setAttribute("x1", margemEsquerda);
        linhaFundo.setAttribute("x2", largura - margemDireita);
        linhaFundo.setAttribute("y1", y);
        linhaFundo.setAttribute("y2", y);
        linhaFundo.setAttribute("stroke", "#cccccc");
        linhaFundo.setAttribute("stroke-dasharray", "4 4");

        svg.appendChild(linhaFundo);
    }

    // Desenho da linha do gráfico
    const caminho = pontos.map(function(ponto, indice) {
        return (indice === 0 ? "M " : "L ") +
            ponto.x + " " + ponto.y;
    }).join(" ");

    const linha = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    linha.setAttribute("d", caminho);
    linha.setAttribute("fill", "none");
    linha.setAttribute("stroke", "#269568");
    linha.setAttribute("stroke-width", "3");
    linha.setAttribute("stroke-linecap", "round");
    linha.setAttribute("stroke-linejoin", "round");

    const comprimento = pontos.length > 1
        ? pontos.length * 100
        : 1;

    linha.style.strokeDasharray = comprimento;
    linha.style.strokeDashoffset = comprimento;
    linha.style.transition = "stroke-dashoffset 1.5s ease";

    svg.appendChild(linha);

    // Pontos, valores e meses
    pontos.forEach(function(ponto) {
        const circulo = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        circulo.setAttribute("cx", ponto.x);
        circulo.setAttribute("cy", ponto.y);
        circulo.setAttribute("r", "5");
        circulo.setAttribute("fill", "#269568");

        const textoValor = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        textoValor.setAttribute("x", ponto.x);
        textoValor.setAttribute("y", ponto.y - 12);
        textoValor.setAttribute("text-anchor", "middle");
        textoValor.setAttribute("font-size", "11");
        textoValor.setAttribute("fill", "currentColor");
        textoValor.textContent =
            "R$ " + Number(ponto.item.valor).toFixed(0);

        const textoMes = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );

        textoMes.setAttribute("x", ponto.x);
        textoMes.setAttribute("y", altura - 12);
        textoMes.setAttribute("text-anchor", "middle");
        textoMes.setAttribute("font-size", "11");
        textoMes.setAttribute("fill", "currentColor");

        const partes = ponto.item.mes.split("-");
        textoMes.textContent = partes[1] + "/" + partes[0];

        svg.append(circulo, textoValor, textoMes);
    });

    area.appendChild(svg);

    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            linha.style.strokeDashoffset = "0";
        });
    });

    // Lista para editar e excluir os meses
    const lista = document.createElement("div");
    lista.style.marginTop = "20px";

    relatorios.forEach(function(item) {
        const registro = document.createElement("div");

        registro.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 8px;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 8px;
            background: #f1f5f2;
            color: #222222;
            flex-wrap: wrap;
        `;

        const partes = item.mes.split("-");

        const informacao = document.createElement("span");
        informacao.textContent =
            partes[1] + "/" + partes[0] +
            " — R$ " + Number(item.valor).toFixed(2);

        const botoes = document.createElement("div");

        const editar = document.createElement("button");
        editar.textContent = "Editar";
        editar.type = "button";
        editar.style.cssText =
            "background:#269568;color:white;margin:3px;";
        editar.onclick = function() {
            editarRelatorio(item.mes);
        };

        const excluir = document.createElement("button");
        excluir.textContent = "Excluir";
        excluir.type = "button";
        excluir.style.cssText =
            "background:#dc3545;color:white;margin:3px;";
        excluir.onclick = function() {
            excluirRelatorio(item.mes);
        };

        botoes.append(editar, excluir);
        registro.append(informacao, botoes);
        lista.appendChild(registro);
    });

    area.appendChild(lista);
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    mostrarDespesas();
    mostrarGrafico();
});

// ===================================
// MINHAS METAS
// ===================================

let metas = JSON.parse(localStorage.getItem("metas")) || [];

function salvarMetas() {
    localStorage.setItem("metas", JSON.stringify(metas));
}

function adicionarMeta() {
    const nome = document.getElementById("nomeMeta").value.trim();
    const valor = Number(document.getElementById("valorMeta").value);
    const guardado = Number(document.getElementById("valorGuardado").value);

    if (!nome || valor <= 0 || guardado < 0 || guardado > valor) {
        alert("Confira o nome e os valores da sua meta.");
        return;
    }

    metas.push({
        nome: nome,
        valor: valor,
        guardado: guardado
    });

    salvarMetas();
    mostrarMetas();

    document.getElementById("nomeMeta").value = "";
    document.getElementById("valorMeta").value = "";
    document.getElementById("valorGuardado").value = "";
}

function mostrarMetas() {
    const lista = document.getElementById("listaMetas");

    if (!lista) return;

    lista.innerHTML = "";

    metas.forEach((meta, indice) => {
        const porcentagem = Math.min(
            100,
            Math.round((meta.guardado / meta.valor) * 100)
        );

        const falta = Math.max(0, meta.valor - meta.guardado);
        const concluida = porcentagem >= 100;

        lista.innerHTML += `
            <div class="meta-card">

                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <h3>🎯 ${meta.nome}</h3>

                    <span class="meta-status">
                        ${concluida ? "Concluída" : "Em andamento"}
                    </span>
                </div>

                <div class="meta-porcentagem">
                    ${porcentagem}%
                </div>

                <div class="meta-barra-fundo">
                    <div class="meta-barra-progresso"
                         style="width:${porcentagem}%;">
                    </div>
                </div>

                <div class="meta-valores">
                    <span>R$ ${meta.guardado.toFixed(2)} guardados</span>
                    <span>Meta: R$ ${meta.valor.toFixed(2)}</span>
                </div>

                ${
                    concluida
                    ? `<div class="meta-concluida">🏆 Parabéns! Meta alcançada!</div>`
                    : `
                        <p style="color:#174c35; font-weight:bold; margin-top:14px;">
                            Faltam R$ ${falta.toFixed(2)}
                        </p>

                        <label>Adicionar dinheiro guardado:</label>

                        <input
                            type="number"
                            id="aporte-${indice}"
                            min="0"
                            step="0.01"
                            placeholder="Quanto você guardou?"
                        >

                        <button onclick="adicionarValorMeta(${indice})">
                            + Adicionar dinheiro
                        </button>
                    `
                }

                <button onclick="excluirMeta(${indice})">
                    Excluir meta
                </button>

            </div>
        `;
    });
}


function adicionarValorMeta(indice) {
    const campo = document.getElementById("aporte-" + indice);
    const valor = Number(campo.value);

    if (!Number.isFinite(valor) || valor <= 0) {
        alert("Digite um valor válido.");
        return;
    }

    if (metas[indice].guardado + valor > metas[indice].valor) {
        alert("Esse valor ultrapassa o objetivo da sua meta.");
        return;
    }

    metas[indice].guardado += valor;

    salvarMetas();
    mostrarMetas();
}

function excluirMeta(indice) {
    if (confirm("Deseja realmente excluir esta meta?")) {
        metas.splice(indice, 1);
        salvarMetas();
        mostrarMetas();
    }
}

document.addEventListener("DOMContentLoaded", mostrarMetas);
