# Filtros para buscar vagas no LinkedIn

🌐 **Acesse online:** [https://0xjeanpierre.github.io/linkedin-search/](https://0xjeanpierre.github.io/linkedin-search/)

Página estática para montar filtros e gerar a URL de uma busca de vagas no LinkedIn. Você marca as opções, copia o link pronto e abre a busca no LinkedIn. Tudo roda no navegador, sem backend, sem login e sem rastreamento.

## Recursos

- Palavra-chave principal, alternativas ligadas por OR e termos excluídos com NOT. Termos com espaço recebem aspas automaticamente.
- Localização por `geoId` (Brasil, sem filtro ou personalizado), por texto e por raio.
- Data de publicação: 30 minutos, 1 hora, 24 horas, semana, mês, qualquer momento ou um valor personalizado em segundos.
- Modalidade (presencial, remoto, híbrido), nível de experiência e tipo de contrato.
- Candidatura simplificada, poucos candidatos, vagas verificadas e vagas com conexões na empresa.
- Faixa salarial, página de resultados e ordenação (mais recentes ou mais relevantes).
- Filtros por ID: empresa, setor, função e cidade.
- Tema claro e escuro, com botão para alternar. O padrão é o claro, e a escolha fica salva no navegador.

## Salvamento

Nada é enviado a servidor. Os dados ficam no `localStorage` do navegador.

- **Rascunho automático:** o último estado dos filtros é restaurado ao reabrir a página.
- **Buscas salvas:** guarde combinações de filtros com um nome, carregue ou exclua depois.
- **Link da busca:** o botão "Copiar link desta busca" gera um endereço com os filtros codificados após o `#`. Quem abrir o link vê os mesmos filtros.
- **Exportar e importar:** baixe as buscas salvas em `buscas-linkedin.json` e importe em outro navegador ou aparelho.

O `localStorage` é separado por navegador e por endereço. Para levar suas buscas a outro lugar, use o link ou o arquivo exportado.

## Como usar

Abra o `index.html` no navegador. Se preferir um servidor local:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Executar com Docker

A imagem usa o nginx para servir os arquivos estáticos. É preciso ter o Docker e o Docker Compose instalados.

Com Docker Compose:

```bash
docker compose up -d --build
```

Acesse `http://localhost:8080`. O `--build` reconstrói a imagem para incluir alterações nos arquivos. O `-d` deixa o contêiner rodando em segundo plano.

Para parar e remover o contêiner:

```bash
docker compose down
```

Sem Compose, só com Docker:

```bash
docker build -f docker/Dockerfile -t linkedin-search .
docker run -d --name linkedin-search -p 8080:80 linkedin-search
```

Para usar outra porta, troque o primeiro número em `8080:80`, no `compose.yaml` ou no comando `docker run`. O Bootstrap continua vindo do CDN, então o navegador precisa de acesso à internet.

## Publicar no GitHub Pages

1. Envie `index.html`, `css/` e `js/` para a raiz do repositório.
2. Em **Settings > Pages**, escolha a branch principal e a pasta raiz como origem.
3. Acesse o endereço que o GitHub mostrar. Os caminhos são relativos, então funciona também em repositório com subpasta.

## Estrutura

```
.
├── index.html        Marcação da página
├── favicon.svg       Ícone da aba (logo "Is")
├── compose.yaml      Serviço Docker Compose (porta 8080)
├── docker/Dockerfile Imagem nginx com os arquivos da página
├── css/style.css     Identidade visual sobre o Bootstrap
├── js/app.js         Montagem da URL, salvamento, tema e ações
└── js/tips.js        Tooltips de ajuda de cada parâmetro
```

## Tecnologias

- HTML, CSS e JavaScript puro, sem etapa de build.
- Bootstrap 5.3.3 e Bootstrap Icons 1.11.3, carregados por CDN (jsDelivr). A página precisa de internet para o estilo aparecer.

## Limitações

- Os parâmetros de URL do LinkedIn não são documentados oficialmente e podem mudar. Se algum filtro parar de funcionar, ele precisa ser reavaliado a partir de uma URL real.
- A faixa salarial funciona melhor em vagas dos Estados Unidos.
- Para filtros por ID (empresa, setor, função, cidade), aplique o filtro no LinkedIn e copie o número que aparece na URL.

## Aviso

Projeto independente, sem vínculo com o LinkedIn. LinkedIn é marca de seus respectivos titulares.
