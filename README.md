# 🎬 Netflix Enhanced

Suíte avançada e completa para Netflix: Picture-in-Picture nativo, Filtros de Vídeo em tempo real (GPU Shaders), Atalhos de Teclado, Pular Abertura/Resumo/Contagem de Próximo Episódio, Controle horizontal de volume, Velocidade persistente com ajuste via scroll e Nomes reais de episódios de One Piece com Zero Delay (Motor de 0ms–1ms rAF).

---

## ⚡ Como Usar com Atualização Automática (Recomendado)

Você só precisa instalar o **Loader** uma vez no Tampermonkey. A partir daí, qualquer alteração que for enviada para este repositório será aplicada automaticamente no seu navegador!

### Passo a Passo:
1. Abra o Tampermonkey no seu navegador.
2. Clique no link do instalador automático abaixo:
   👉 **[Instalar netflix-loader.user.js](https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/netflix-loader.user.js)**
3. Clique em **Instalar**.
4. Abra ou recarregue a Netflix (`netflix.com`).

> 💡 **Como o Loader funciona:**
> - Ele executa instantaneamente com cache local (sem atraso na abertura do site).
> - Em segundo plano, ele checa se houve novos commits neste repositório.
> - Se houver código novo, ele baixa e atualiza o cache para a próxima execução.

---

## 📦 Instalação Direta (Sem Loader)

Se preferir o script completo diretamente sem o intermediário do loader:

👉 **[Instalar NETFLIXeditor.user.js](https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/NETFLIXeditor.user.js)**

*Esse método utiliza a checagem nativa de versões do Tampermonkey via `@updateURL`.*

---

## 🛠️ Recursos do Netflix Enhanced

- 🖼️ **Picture-in-Picture (PiP):** Botão direto na barra de controles do player e atalho de teclado `P` para assistir em janela flutuante enquanto faz outras tarefas.
- 🎬 **Filtros de Vídeo em Tempo Real:** Ajuste fino de Brilho (60–150%), Contraste (60–150%) e Saturação (0–200%) via GPU shaders nativos, sem consumo de CPU.
- ⌨️ **Atalhos Rápidos de Teclado:**
  - `[` / `]`: Diminuir / Aumentar velocidade de reprodução com feedback visual no HUD.
  - `S`: Alternar esticar tela (Fill) ou manter proporção original (Contain).
  - `P`: Alternar Picture-in-Picture (PiP).
  - *Guarda inteligente:* Nunca interfere quando você estiver digitando no campo de pesquisa da Netflix.
- ⚡ **Velocidade Persistente & Wheel Control:** Salva sua taxa de reprodução entre episódios e permite ajuste rápido usando a roda do mouse (scroll) sobre o botão de velocidade.
- ⏭️ **Auto Skip Completo:** Pula abertura, resumo e bypassa a contagem regressiva de 10s para o próximo episódio.
- 🔊 **Volume Horizontal com Scroll:** Barra horizontal suave com suporte a rolagem do mouse.
- 📺 **Modo Tela Cheia & Esticar Tela:** Elimina barras pretas em monitores ultrawide ou 16:10.
- 🚀 **Motor Ultra-Fast de 0ms–1ms (rAF):** Alinhado à taxa de atualização do seu monitor (60Hz, 120Hz, 144Hz) via `requestAnimationFrame`, com zero layout reflows e varredura de episódios cacheada em $O(1)$.
- 🏴‍☠️ **One Piece:** Todos os 885 episódios integrados com títulos originais e zero delay na troca de telas.
