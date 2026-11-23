# Atlas Neural — diagramas React + TypeScript

Abra `index.html` no navegador. Não precisa de servidor. React e ReactDOM estão incorporados; a matemática mantém KaTeX incorporado com fallback MathML. O CSS KaTeX pode ser carregado via CDN. Os exemplos têm pesos didáticos, não modelos pré-treinados.

## Reconstruir

Node.js 20+, npm e Python 3:

```
cd atlas-react
npm install
npm run build
```

O resultado fica em `../index.html`. O botão “Código React + TS” baixa este projeto diretamente do HTML. O build transpila TSX com TypeScript e empacota os módulos de produção React; não requer CDN React nem servidor em execução.

## Organização

- `src/Diagram.tsx`: componentes tipados Architecture, Layer, Edge e Shapes. Navegação por etapas, zoom, teclado, controle de movimento. O adaptador AtlasDiagram integra a seleção com o motor numérico existente.
- `src/scenes.json`: primitivas SVG declarativas e metadados das sete arquiteturas nos modos artigo/aula. Posições e conexões preservam os desenhos anteriores; não há strings HTML nos componentes SVG.
- `src/diagram.css`: tema, responsividade, foco visível e preferência de movimento reduzido.
- `template.html`: aplicação e motor didático existentes, KaTeX, autodiferenciação, exemplos, aula e questões. Marcadores recebem o bundle e o CSS durante o build.

O percurso é uma ordem didática; as setas do desenho definem as dependências, inclusive bifurcações, residuais e atenção cruzada. A animação indica direção do fluxo, não tempo de processamento ou magnitude de gradiente. A navegação de gradientes inverte o percurso; as contas são calculadas pelo motor numérico, não pela animação.

A refatoração cobre os diagramas das arquiteturas nas duas vistas. Experimentos, questões e motor numérico mantêm sua implementação existente. Não é uma migração de toda a aplicação para React.

Validação automática em DOM simulado: 252 seleções de módulos, sete tópicos, duas vistas e dois sentidos, renderização matemática sem erros. Não substitui inspeção visual em navegadores reais.

## Fluxo de estudo

A tela inicial apresenta a entrada numérica. Um único percurso conduz pelas camadas, saída, objetivo escalar e gradientes. O inspetor recebe a entrada antes da fórmula e da substituição numérica. Experimentos são explicitamente independentes. O progresso e a escolha de exemplo são salvos localmente por arquitetura; o botão Retomar aparece quando há progresso. Em telas pequenas, Diagrama e Cálculo alternam na mesma etapa.

`src/ux.js` coordena esse percurso com o motor e com os componentes React. Os testes em DOM simulado cobrem o percurso completo nas sete arquiteturas e as 252 seleções de módulos.
