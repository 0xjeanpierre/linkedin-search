"use strict";

/* Tooltips de ajuda para cada parâmetro da URL.
   Cada entrada: seletor do elemento onde o "?" entra -> { p: parâmetro, t: explicação }. */
const TIPS = [
  ["label[for=kw]",    "keywords",   "Termo principal da busca. O LinkedIn aceita OR, NOT e aspas para frases exatas."],
  ["label[for=kwOr]",  "keywords",   "Termos alternativos. A página liga todos com OR ao termo principal. Termos com espaço ganham aspas."],
  ["label[for=kwNot]", "keywords",   "Termos que a vaga não deve conter. Cada um vira NOT termo na busca."],
  ["label[for=geo]",   "geoId",      "ID numérico do local no LinkedIn (Brasil = 106057199). \"Sem filtro\" não envia local. \"Outro geoId\" abre um campo para colar o seu."],
  ["label[for=geoC]",  "geoId",      "Cole aqui um geoId copiado da URL de uma busca do LinkedIn com o local desejado."],
  ["label[for=loc]",   "location",   "Local em texto livre, por exemplo Recife. O LinkedIn interpreta o nome. Combina com o geoId."],
  ["label[for=dist]",  "distance",   "Raio de busca em milhas ao redor do local. 1 milha equivale a cerca de 1,6 km."],
  ["label[for=tpr]",   "f_TPR",      "Período de publicação. O valor é \"r\" mais a quantidade de segundos (r86400 = 24 horas). \"Personalizado\" deixa você digitar os segundos."],
  [".li-q-label:not([for])", "f_WT", "Modalidade de trabalho: 1 = presencial, 2 = remoto, 3 = híbrido. Marcando mais de uma, os valores são combinados (por exemplo 1,2)."],
  ["label[for=sort]",  "sortBy",     "Ordem dos resultados: DD = mais recentes, R = mais relevantes."],
  ["label[for=easy]",  "f_AL",       "Só vagas com candidatura simplificada (Easy Apply). Enviado como f_AL=true."],
  ["label[for=fea]",   "f_EA",       "Vagas com poucos candidatos até o momento. Enviado como f_EA=true."],
  ["label[for=fvj]",   "f_VJ",       "Apenas vagas verificadas pelo LinkedIn. Enviado como f_VJ=true."],
  ["label[for=fjiyn]", "f_JIYN",     "Vagas em empresas onde você tem conexões. Enviado como f_JIYN=true."],
  ["label[for=sal]",   "f_SB2",      "Faixa salarial mínima, de 1 (US$ 40 mil+) a 9 (US$ 200 mil+). Funciona melhor com vagas dos EUA. O LinkedIn também usa o f_SAL em outro formato, ainda não mapeado aqui."],
  ["label[for=start]", "start",      "Deslocamento dos resultados. Cada página tem 25 vagas: 0 é a primeira, 25 a segunda, 50 a terceira."],
  ["label[for=fc]",    "f_C",        "ID da empresa no LinkedIn. Vários IDs, separados por vírgula. Aplique o filtro de empresa no LinkedIn e copie os números depois de f_C= na URL."],
  ["label[for=fi]",    "f_I",        "ID do setor (indústria). Aplique o filtro de setor no LinkedIn e copie o número depois de f_I= na URL."],
  ["label[for=fjc]",   "f_JC",       "ID da função (área de atuação). Aplique o filtro no LinkedIn e copie o número depois de f_JC= na URL."],
  ["label[for=fpp]",   "f_PP",       "ID da cidade. Aplique o filtro no LinkedIn e copie o número depois de f_PP= na URL."],
];

// Títulos dos cards: o botão do acordeão recebe o tooltip inteiro.
const CARD_TIPS = [
  ["#c-nivel",    "f_E",  "Nível de experiência, numerado de 1 a 6 na ordem exibida: estágio, júnior, pleno, sênior, diretor e executivo. Marcando mais de um, os valores são combinados."],
  ["#c-contrato", "f_JT", "Tipo de contrato: F = tempo integral, P = meio período, C = contrato, T = temporário, I = estágio, V = voluntário, O = outro. Várias opções são combinadas."],
];

const tipOptions = { customClass: "li-tooltip", placement: "top", trigger: "hover focus", container: "body" };

function tipText(param, text) {
  return `${param}: ${text}`;
}

function addTip(host, param, text) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "li-tip";
  b.textContent = "?";
  b.setAttribute("aria-label", `Ajuda sobre ${param}`);
  b.title = tipText(param, text);
  // Dentro de <label>, o clique não deve marcar/focar o campo.
  b.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); });
  host.appendChild(b);
  new bootstrap.Tooltip(b, tipOptions);
}

TIPS.forEach(([sel, param, text]) => {
  document.querySelectorAll(sel).forEach(el => {
    // O rótulo "Modalidade" é o único .li-q-label sem "for" que recebe tooltip de f_WT.
    if (sel.startsWith(".li-q-label") && el.textContent.trim() !== "Modalidade") return;
    addTip(el, param, text);
  });
});

CARD_TIPS.forEach(([target, param, text]) => {
  const btn = document.querySelector(`[data-bs-target="${target}"]`);
  if (!btn) return;
  const mark = document.createElement("span");
  mark.className = "li-tip li-tip-static";
  mark.textContent = "?";
  mark.setAttribute("aria-hidden", "true");
  btn.firstChild.after(mark);
  btn.title = tipText(param, text);
  new bootstrap.Tooltip(btn, { ...tipOptions, placement: "bottom" });
});
