# Gerador de PDF - Cadastro de Novo Local de Entrega

Uma aplicação web desenvolvida em HTML, CSS e JavaScript puro para gerar automaticamente o documento de **Cadastro de Novo Local de Entrega** em formato PDF. O sistema foi projetado para a Distribuidora São Paulo, permitindo que os clientes preencham seus dados e gerem um documento pronto para ser assinado digitalmente através da plataforma gov.br.

## 🚀 Funcionalidades

*   **Formulário Dinâmico:** Estrutura de dados baseada em um schema (`SCHEMA` no JavaScript) que facilita a adição ou remoção de campos no futuro.
*   **Geração de PDF *Client-Side*:** Utiliza a biblioteca `jsPDF` para desenhar e exportar o documento PDF diretamente no navegador do usuário, garantindo rapidez e adequação à LGPD (os dados não são enviados para nenhum servidor).
*   **Validação Inteligente:** Validação algorítmica de CPF e CNPJ integradas.
*   **Máscaras de Input:** Formatação automática em tempo real para CEP, CPF e CNPJ, melhorando a experiência do usuário.
*   **Auto-Ajuste de PDF:** Algoritmo que redimensiona a escala do documento para tentar encaixar todo o conteúdo em uma única página A4.
*   **Interface Responsiva:** Design limpo, moderno e adaptável para dispositivos móveis, com suporte automático a *Light* e *Dark Mode*.

## 🛠️ Tecnologias Utilizadas

*   **HTML5:** Estruturação semântica.
*   **CSS3:** Estilização com variáveis (Custom Properties) e design responsivo.
*   **JavaScript (ES6+):** Lógica do formulário, máscaras, validações e manipulação do DOM.
*   **[jsPDF](https://github.com/parallax/jsPDF):** Biblioteca externa usada para a criação estruturada do arquivo `.pdf`.

## 📂 Estrutura do Projeto

```text
/
├── index.html        # Estrutura principal da página
├── style.css         # Folha de estilos (Light/Dark mode)
├── script.js         # Lógica da aplicação, máscaras, validação e renderização do PDF
└── assets/
    ├── logo.png      # Logo principal (usada na interface e no PDF)
    └── logo-mini.ico # Favicon do site
```

## ⚙️ Como Usar

1.  **Clone o repositório** ou faça o download dos arquivos.
2.  Certifique-se de que a pasta `assets` contém os arquivos de imagem necessários (`logo.png`).
3.  **Abra o arquivo `index.html`** em qualquer navegador web moderno (Chrome, Edge, Firefox, Safari). *Nota: Devido a restrições de CORS ao carregar imagens locais em um canvas (para o PDF), é recomendado rodar o projeto através de um servidor local (como a extensão "Live Server" do VS Code) para que a logo seja renderizada corretamente no PDF.*
4.  Preencha os campos obrigatórios marcados com `*`.
5.  Clique em **"Gerar PDF"**. O documento será baixado automaticamente com o nome padronizado.

## 🔒 Privacidade e LGPD

Este projeto foi construído pensando na privacidade. Todos os dados inseridos nos campos do formulário são processados **exclusivamente no navegador do usuário** (localmente) no momento da geração do PDF. Nenhuma informação é transmitida, salva em banco de dados em nuvem ou monitorada.

## 👨‍💻 Desenvolvedor

Desenvolvido por **Renaldo Petlim**.

*   [LinkedIn](https://www.linkedin.com/in/renaldopetlim/)
*   [GitHub](https://github.com/renaldopetlim)
*   [Instagram](https://www.instagram.com/renaldopetlim/)

---
© 2026 Distribuidora São Paulo - Setor Logístico