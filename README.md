# Atlas Neural · Playground de Deep Learning

Aplicação didática interativa, em português, para explorar redes neurais, CNN, Transformer, BERT, Vision Transformer, CLIP e modelos de linguagem.

## Abrir

Baixe este repositório e abra **index.html** em um navegador moderno. O arquivo já inclui o JavaScript necessário e não exige instalação ou servidor.

O percurso acompanha **entrada → camadas → saída → perda → gradientes**. Cada camada conecta o diagrama à entrada numérica, à equação, ao cálculo e à saída. Também há experimentos independentes, questões, narração opcional e retomada local do progresso.

## Desenvolver

Requisitos: Node.js 20 ou superior, npm e Python 3.

```sh
cd atlas-react
npm install
npm run build
```

O build atualiza `index.html` na raiz. Para servir localmente, execute na raiz:

```sh
python3 -m http.server 8000
```

Abra http://localhost:8000.

## Estrutura

- `index.html`: aplicação completa, pronta para uso.
- `atlas-react/src/Diagram.tsx`: componentes React e SVG tipados.
- `atlas-react/src/scenes.json`: desenhos declarativos das arquiteturas.
- `atlas-react/src/ux.js`: percurso de estudo e retomada de progresso.
- `atlas-react/src/diagram.css`: estilos e adaptação a telas pequenas.
- `atlas-react/template.html`: motor numérico, KaTeX, aulas e questões.
- `atlas-react/build.mjs`: empacotamento do HTML e do código baixável.

## Escopo e limitações

Os diagramas preservam a topologia das referências citadas no aplicativo. Os cálculos usam exemplos de dimensões reduzidas e pesos ilustrativos fixos; não executam modelos pré-treinados. A migração para React cobre os diagramas; o motor numérico e outras partes mantêm JavaScript existente.

React, ReactDOM e KaTeX estão incorporados. O estilo KaTeX pode carregar por CDN, com fallback MathML. A narração depende das vozes disponíveis no navegador. O progresso fica no armazenamento local do navegador. Os experimentos A/B são independentes do exemplo encadeado.

Os PDFs privados das aulas não são distribuídos. Artigos públicos estão ligados na interface. Licenças das dependências incorporadas: `THIRD_PARTY_NOTICES.txt`.

Validação da versão inicial: percursos completos nos sete tópicos, 252 seleções de módulos, retomada de exemplo, narração e exportação individual em DOM simulado. Isso não substitui testes visuais em navegadores reais.
