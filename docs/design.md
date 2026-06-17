# Bolão 2026 - Design System

Este documento define o sistema de design a ser utilizado no Aplicativo do Bolão 2026, baseado na referência de layout do NLW Copa (Ignite) demonstrado nas imagens. O design adota uma estética vibrante focada em "Dark Mode" com destaques em amarelo e verde.

---

## 🎨 Cores (Paleta Principal)

### Fundos (Superfícies)
- **Background App:** `#09090A` (Preto profundo, fundo da tela)
- **Superfícies (Cards, Menus):** `#202024` (Cinza escuro para componentes)
- **Inputs e Áreas Internas:** `#121214` (Cinza mais intenso que os cards, usado para as caixas de placar)
- **Top Header:** `#121214` ou escurecimento suave a partir do background.

### Cores de Destaque (Brand Colors)
- **Amarelo Primário (Ações, Ícones, Linhas de card):** `#F7DD43`
- **Verde Sucesso (Botão Confirmar):** `#04D361`

### Tipografia (Textos)
- **Texto Principal (Branco):** `#FFFFFF` (Títulos, Nomes de jogadores e times, Placares)
- **Texto Secundário (Cinza Escuro):** `#8D8D99` (Datas de jogos, descrições menores)
- **Texto Terciário (Cinza Claro):** `#C4C4CC` (Textos auxiliares)

---

## ✍️ Tipografia e Estilos de Texto

**Família da Fonte:** `Roboto` (ou `Inter` padrão do Next.js). Fontes modernas, limpas e sem serifa.

- **Títulos (h1, h2):** Bold (Peso 700), tamanho `20px` a `24px`.
- **Nomes em Cards (Jogadores, Times):** Bold (Peso 700), tamanho `16px`. Ex: "Brasil vs. Argentina".
- **Datas dos Jogos:** Regular (Peso 400), tamanho `12px` a `14px`, cor secundária (Cinza).
- **Textos de Botões:** Uppercase (Caixa alta), Bold (Peso 700), com bastante tracking (espaçamento entre letras).

---

## 🧩 Componentes

### 1. Cards (Linhas do Ranking, Cartões de Jogos)
- **Background:** `#202024`
- **Border Radius:** `8px` (`rounded-lg` do Tailwind).
- **Variante de Destaque:** Para reforçar a ação, o card recebe uma borda inferior grossa em amarelo (`border-b-[4px] border-[#F7DD43]`). Nas imagens aparece tanto no Ranking quanto nos Jogos!

### 2. Caixas de Ponto/Placar (Inputs quadrados)
- **Background:** `#121214`
- **Tamanho:** Pequenos quadrados centrais alinhados entre as bandeiras.
- **Aspecto:** Sem bordas visíveis contra o cinza do card, com números grandes brancos centralizados.

### 3. Botões
#### Primário de Confirmação (Sucesso)
- **Fundo:** `#04D361` (Verde).
- **Texto:** Branco, Bold, Uppercase.
- **Canto:** `rounded-md` ou `rounded` pequeno (`4px`). Elevado dentro do card de cor de fundo `#202024`.

#### Secundário/Desativado ("Tempo Esgotado")
- **Fundo:** `#121214`
- **Texto:** `#8D8D99` (Cinza Escuro), Uppercase.

#### Navigation Bottom Bar (Menu Inferior)
- **Fundo total:** `#202024` com uma barra superior sutil.
- **Itens Ativos:** Ícone e Texto em **Amarelo** (`#F7DD43`).
- **Itens Inativos:** Cinza claro/médio.

### 4. Avatares e Posição
- **Imagens:** Totalmente arredondadas (`rounded-full`).
- **Top 1..3 Badges:** Cor de fundo `#F7DD43` e texto preto/escuro para o selo de pódio no ranking.
- **Top 4 em diante:** Fundo e cor em cinza muito escuro/apagado.

---

## 🛠️ Sugestão para o `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    // ...
  ],
  theme: {
    extend: {
      colors: {
        nlw: {
          bg: '#09090A',
          card: '#202024',
          input: '#121214',
          yellow: '#F7DD43',
          green: '#04D361',
          textHover: '#8D8D99',
          textMuted: '#C4C4CC'
        }
      }
    },
  },
  plugins: [],
}
export default config
```
