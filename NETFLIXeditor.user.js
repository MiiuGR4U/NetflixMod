// ==UserScript==
// @name         Netflix Enhanced
// @namespace    https://github.com/MiiuGR4U/NetflixMod
// @version      19.0
// @description  Suíte completa para Netflix: Picture-in-Picture, Filtros de Vídeo, Atalhos de Teclado, Pular Abertura/Resumo/Créditos, Volume horizontal, Playback persistente e Nomes reais dos episódios com Zero Delay.
// @author       MiiuGR4U
// @match        *://*.netflix.com/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      onepiecelistas.blogspot.com
// @updateURL    https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/NETFLIXeditor.user.js
// @downloadURL  https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/NETFLIXeditor.user.js
// ==/UserScript==

(function () {
    'use strict';

    // ==========================================
    // 0. DESBLOQUEIO GLOBAL DO PICTURE-IN-PICTURE (BYPASS NETFLIX DRM RESTRICTION)
    // ==========================================
    try {
        Object.defineProperty(HTMLVideoElement.prototype, 'disablePictureInPicture', {
            get: () => false,
            set: () => {},
            configurable: true
        });
    } catch (e) {}


    const DEFAULT_CONFIG = {
        theme: {
            primary: '#0084ff',
            hover: '#66b2ff',
            menuBg: 'rgba(13, 17, 23, 0.95)'
        },
        filters: {
            brightness: 100,
            contrast: 100,
            saturate: 100
        },
        texts: {
            panelTitle: 'Netflix Enhanced',
            saveBtn: 'Salvar Configurações',
            stretchBtnTitle: 'Esticar Tela (S)',
            pipBtnTitle: 'Picture-in-Picture (P)',
            volumeSliderTitle: 'Volume',
            lblColorPrimary: 'Cor de Destaque',
            lblColorHover: 'Cor Hover / Foco',
            lblGlow: 'Efeito Neon Glow',
            lblTheme: 'Tema Netflix Enhanced',
            lblLayout: 'Layout Cinema Dribbble',
            lblHouse: 'Bypass Residência Netflix',
            lblStretch: 'Botão Esticar Tela (S)',
            lblPip: 'Botão Picture-in-Picture (P)',
            lblShortcuts: 'Atalhos de Teclado ([ ] S P)',
            lblGlobalWheel: 'Volume por Scroll em Qualquer Lugar',
            lblHudToasts: 'Notificações HUD na Tela',
            lblHoverScale: 'Animação Aumentar no Hover',
            lblVolumeHoriz: 'Barra de Volume Horizontal',
            lblAutoSkip: 'Pular Aberturas, Resumos e Créditos',
            lblSpeedBtn: 'Velocidade de Reprodução Persistente',
            lblOpRenamer: 'Nomes Reais de Episódios (One Piece)',
            lblFiltersSec: 'Filtros de Vídeo (Tempo Real)',
            lblBrightness: 'Brilho',
            lblContrast: 'Contraste',
            lblSaturate: 'Saturação',
            lblTextsSec: 'Textos & Legendas',
            tabStyle: 'Estilo & Vídeo',
            tabFeatures: 'Recursos',
            tabTexts: 'Textos'
        },
        features: {
            enableTheme: true,
            studioLayout: true,
            spoofEdge: true,
            disableHousehold: true,
            enableStretchBtn: true,
            enablePipBtn: true,
            enableShortcuts: true,
            enableGlobalVolumeScroll: true,
            enableHudToasts: true,
            enableGlow: true,
            enableHoverScale: false,
            enableHorizontalVolume: true,
            autoSkip: true,
            enableSpeedBtn: true,
            enableOnePieceRenamer: true
        }
    };

    let appConfig = {
        theme: { ...DEFAULT_CONFIG.theme, ...(GM_getValue('nfb_theme', {})) },
        filters: { ...DEFAULT_CONFIG.filters, ...(GM_getValue('nfb_filters', {})) },
        texts: { ...DEFAULT_CONFIG.texts, ...(GM_getValue('nfb_texts', {})) },
        features: { ...DEFAULT_CONFIG.features, ...(GM_getValue('nfb_features', {})) }
    };

    // Memoização de alta performance do elemento <video>
    let cachedVideo = null;
    function getVideoEl() {
        if (cachedVideo && cachedVideo.isConnected) return cachedVideo;
        cachedVideo = document.querySelector('video');
        return cachedVideo;
    }

    let currentActiveTab = 'nfb-tab-style';

    const windowCtx = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    // ==========================================
    // 1. SPOOF E BYPASS
    // ==========================================
    if (appConfig.features.spoofEdge) {
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0";
        try {
            Object.defineProperty(navigator, "userAgent", { get: () => ua, configurable: true });
            Object.defineProperty(navigator, "appVersion", { get: () => ua, configurable: true });
            Object.defineProperty(navigator, "vendor", { get: () => "Google Inc.", configurable: true });
        } catch (e) { }
    }

    if (appConfig.features.disableHousehold) {
        const originFetch = windowCtx.fetch;
        windowCtx.fetch = async (...arg) => {
            let url = typeof arg[0] === "object" ? arg[0].url : arg[0];
            if (url.includes('graphql') && typeof arg[1] === "object" && arg[1].body) {
                try {
                    let body = JSON.parse(arg[1].body);
                    if (body.operationName && body.operationName.includes("CLCSInterstitial")) {
                        return new Response(JSON.stringify({ data: { "body.operationName": null } }));
                    }
                } catch (e) { }
            }
            return originFetch(...arg);
        };
    }

    // ==========================================
    // 2. CSS MASTER: THE 100% POLISH
    // ==========================================
    function injectMasterCSS() {
        let styleEl = document.getElementById('nfb-master-css');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'nfb-master-css';
            document.documentElement.appendChild(styleEl);
        }

        let glowValue = appConfig.features.enableGlow ? `0 0 10px ${appConfig.theme.primary}80 !important` : 'none !important';
        let css = `
            :root {
                --nfb-primary: ${appConfig.theme.primary} !important;
                --nfb-hover: ${appConfig.theme.hover} !important;
                --nfb-glow: ${glowValue};
                --nfb-bg: ${appConfig.theme.menuBg} !important;
                --nfb-hover-bg: rgba(255, 255, 255, 0.1) !important; /* Fundo de hover padrão redondo */
            }

            /* --- DOMINANDO AS BARRAS BASE E PROGRESSO --- */
            [data-uia="timeline-bar"] > div > div:first-child, [data-uia="scrubber-rail"] {
                background-color: rgba(255, 255, 255, 0.3) !important;
                background-image: none !important;
            }
            [data-uia="timeline-bar"] > div > div[role="presentation"],
            [data-uia="volume-current"], [data-uia="scrubber-rail-filled"], [data-uia="scrubber-knob"] {
                background-color: var(--nfb-primary) !important;
                background-image: none !important;
                box-shadow: var(--nfb-glow) !important;
            }
            progress::-webkit-progress-value { background-color: var(--nfb-primary) !important; box-shadow: var(--nfb-glow) !important; }
            progress::-moz-progress-bar { background-color: var(--nfb-primary) !important; box-shadow: var(--nfb-glow) !important; }
            progress { color: var(--nfb-primary) !important; }

            /* --- TIMELINE KNOB (ALINHADO E SEM FANTASMAS) --- */
            [data-uia="timeline-knob"] {
                background-color: var(--nfb-primary) !important;
                border: 3px solid #ffffff !important;
                border-radius: 50% !important;
                box-shadow: var(--nfb-glow) !important;
                top: 50% !important;
                transform: translateY(-50%) scale(1.1) !important;
                margin: 0 !important;
            }
            [data-uia="timeline-knob"] * { display: none !important; }

            /* --- HUD TOAST RÁPIDO PARA ATALHOS --- */
            #nfb-quick-hud {
                position: fixed;
                top: 80px;
                right: 40px;
                background: rgba(15, 20, 30, 0.88);
                backdrop-filter: blur(8px);
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 17px;
                font-weight: 700;
                padding: 10px 22px;
                border-radius: 8px;
                border: 1px solid var(--nfb-primary);
                box-shadow: 0 4px 20px rgba(0,0,0,0.5), var(--nfb-glow);
                z-index: 2147483647;
                pointer-events: none;
                opacity: 0;
                transform: translateY(-8px);
                transition: opacity 0.18s ease, transform 0.18s ease;
            }
            #nfb-quick-hud.nfb-hud-visible {
                opacity: 1;
                transform: translateY(0);
            }

            .nfb-filter-range {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .nfb-filter-range span.val {
                min-width: 42px;
                text-align: right;
                font-size: 13px;
                color: var(--nfb-primary);
                font-weight: 600;
            }

            /* --- HOVER GLOBAL & FORMA REDONDA --- */
            [data-uia^="control-"]:hover,
            [data-uia^="control-"]:hover svg,
            .watch-video button:hover svg {
                color: var(--nfb-hover) !important;
                fill: var(--nfb-hover) !important;
                stroke: var(--nfb-hover) !important;
            }

            /* Força fundo redondo no hover dos botões isolados (como a flecha de voltar e a engrenagem) */
            [data-uia="player-exit"],
            [data-uia="player-report-problem"],
            .nfb-stretch-btn,
            #nfb-pip-action,
            [data-uia="control-audio-subtitle"],
            [data-uia^="control-fullscreen"],
            [data-uia="control-episodes"],
            [data-uia="control-next"] {
                border-radius: 50% !important;
                transition: background-color 0.2s ease !important;
            }
            [data-uia="player-exit"]:hover,
            [data-uia="player-report-problem"]:hover,
            .nfb-stretch-btn:hover,
            #nfb-pip-action:hover,
            [data-uia="control-audio-subtitle"]:hover,
            [data-uia^="control-fullscreen"]:hover,
            [data-uia="control-episodes"]:hover,
            [data-uia="control-next"]:hover {
                background-color: var(--nfb-hover-bg) !important;
            }
        `;

        if (appConfig.features.studioLayout) {
            css += `
                /* --- FUNDO CINEMATOGRÁFICO --- */
                .gradient, [data-uia="bottom-controls-gradient"], [class*="gradient-bottom"] { display: none !important; }
                .watch-video--bottom-controls-container {
                    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 100%) !important;
                    position: fixed !important; bottom: 0 !important; left: 0 !important;
                    width: 100% !important; height: 180px !important;
                    padding: 0 !important; margin: 0 !important; pointer-events: none !important;
                }

                /* Marca overlays neutralizados */
                .nfb-neutralized { pointer-events: none !important; }

                /* Posiciona todos os controles como fixed e garante que sejam clicáveis */
                /* :not(svg) evita que SVGs com data-uia (ex: fullscreen) virem position:fixed */
                [data-uia^="control-"]:not(svg), [data-uia="timeline"], [data-uia="video-title"], #nfb-stretch-action {
                    position: fixed !important; z-index: 99999 !important; margin: 0 !important; pointer-events: auto !important;
                }
                /* Impede que SVGs com data-uia herdem position fixed */
                svg[data-uia^="control-"] {
                    position: static !important; z-index: auto !important;
                }

                /* --- 1. TÍTULO NO TOPO --- */
                [data-uia="video-title"] {
                    top: 30px !important; left: 90px !important; bottom: auto !important;
                    display: flex !important; flex-direction: column !important; align-items: flex-start !important; pointer-events: none !important;
                }
                [data-uia="video-title"] h4 { font-size: 26px !important; font-weight: 700 !important; text-shadow: 0 2px 8px rgba(0,0,0,0.8) !important; margin: 0 !important; color: white !important; }
                [data-uia="video-title"] span { font-size: 16px !important; opacity: 0.8 !important; text-shadow: 0 1px 4px rgba(0,0,0,0.8) !important; color: white !important; }

                /* --- 2. TIMELINE E TEMPO RESTANTE --- */
                [data-uia="timeline"] { bottom: 100px !important; left: 5% !important; width: 90% !important; }
                [data-uia="controls-time-remaining"] {
                    position: fixed !important; bottom: 130px !important; right: 5% !important;
                    font-weight: bold !important; text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
                }

                /* --- 3. GRUPO CENTRAL: PLAY/PAUSE --- */
                [data-uia^="control-play-pause"],
                [data-uia="control-play-pause-play"],
                [data-uia="control-play-pause-pause"] {
                    position: fixed !important;
                    bottom: 30px !important; left: 50% !important; transform: translateX(-50%) !important;
                    border: 3px solid white !important; border-radius: 50% !important;
                    width: 52px !important; height: 52px !important;
                    display: flex !important; justify-content: center !important; align-items: center !important;
                    padding: 0 !important; background: transparent !important;
                    cursor: pointer !important;
                }
                [data-uia^="control-play-pause"] > div,
                [data-uia^="control-play-pause"] span,
                [data-uia*="icon-wrapper"] {
                    position: static !important; transform: none !important;
                    background: transparent !important; border: none !important; box-shadow: none !important;
                    display: block !important; width: auto !important; height: auto !important;
                }
                [data-uia^="control-play-pause"] svg,
                [data-uia^="control-play-pause"] svg[role="img"] {
                    width: 24px !important; height: 24px !important; margin: 0 !important;
                    position: absolute !important; top: 50% !important; left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    display: block !important;
                }
                ${appConfig.features.enableHoverScale ? `
                [data-uia^="control-play-pause"]:hover,
                [data-uia="control-play-pause-play"]:hover,
                [data-uia="control-play-pause-pause"]:hover {
                    border-color: var(--nfb-hover) !important;
                    transform: translateX(-50%) scale(1.08) !important;
                }` : `
                [data-uia^="control-play-pause"]:hover,
                [data-uia="control-play-pause-play"]:hover,
                [data-uia="control-play-pause-pause"]:hover {
                    border-color: var(--nfb-hover) !important;
                    transform: translateX(-50%) scale(1) !important;
                }`}

                /* --- 3b. BACK10 & FORWARD10 --- */
                [data-uia="control-back10"],
                [data-uia="control-forward10"] {
                    bottom: 31px !important;
                    border-radius: 50% !important;
                    display: flex !important; justify-content: center !important; align-items: center !important;
                    cursor: pointer !important;
                }
                [data-uia="control-back10"] { left: calc(50% - 80px) !important; transform: translateX(-50%) !important; }
                [data-uia="control-forward10"] { left: calc(50% + 80px) !important; transform: translateX(-50%) !important; }
                [data-uia="control-back10"]:hover,
                [data-uia="control-forward10"]:hover {
                    background-color: var(--nfb-hover-bg) !important;
                }
                [data-uia="control-back10"] span,
                [data-uia="control-forward10"] span { display: none !important; }

                /* --- 4. VOLUME (ABAIXO DA TIMELINE NA ESQUERDA) --- */
                ${appConfig.features.enableHorizontalVolume ? `
                /* Oculta de vez o volume vertical nativo em qualquer situação */
                .volume-slider,
                .volume-control-slider,
                .volume-slider-container,
                .volume-slider-rail,
                [class*="volume-slider"],
                [class*="VolumeSlider"],
                [data-uia="volume-slider"],
                [data-uia^="control-volume"] .volume-slider,
                .watch-video--scrubber-volume-container,
                [data-uia="watch-video-volume-content"],
                [data-uia="scrubber"],
                [data-uia="scrubber-rail"],
                [data-uia="scrubber-knob"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }

                [data-uia^="control-volume"] {
                    position: fixed !important;
                    bottom: 31px !important; left: 5% !important;
                    height: 44px !important;
                    width: auto !important;
                    display: flex !important; align-items: center !important; justify-content: flex-start !important;
                    background: transparent !important;
                    border-radius: 0 !important;
                }
                [data-uia^="control-volume"] button {
                    width: 44px !important; height: 44px !important;
                    border-radius: 50% !important;
                    display: flex !important; align-items: center !important; justify-content: center !important;
                    transition: background-color 0.2s ease !important;
                }
                
                /* Container retrátil do volume customizado */
                #nfb-custom-volume-container {
                    display: flex !important;
                    align-items: center !important;
                    margin-left: 4px !important;
                    height: 100% !important;
                    width: 0px !important;
                    opacity: 0 !important;
                    overflow: hidden !important;
                    pointer-events: none !important;
                    transition: width 0.3s ease 0.3s, opacity 0.3s ease 0.3s !important;
                }
                [data-uia^="control-volume"]:hover #nfb-custom-volume-container,
                #nfb-custom-volume-container.nfb-active {
                    width: 74px !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                    transition: width 0.3s ease 0s, opacity 0.3s ease 0s !important;
                }

                /* Custom horizontal slider style */
                #nfb-custom-volume {
                    -webkit-appearance: none !important;
                    appearance: none !important;
                    width: 70px !important;
                    height: 4px !important;
                    background: rgba(255, 255, 255, 0.25) !important;
                    border-radius: 2px !important;
                    outline: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    cursor: pointer !important;
                }
                #nfb-custom-volume::-webkit-slider-thumb {
                    -webkit-appearance: none !important;
                    appearance: none !important;
                    width: 12px !important;
                    height: 12px !important;
                    border-radius: 50% !important;
                    background: var(--nfb-primary) !important;
                    box-shadow: var(--nfb-glow) !important;
                    cursor: pointer !important;
                    transition: transform 0.15s ease !important;
                }
                #nfb-custom-volume::-webkit-slider-thumb:hover {
                    transform: scale(1.25) !important;
                }
                #nfb-custom-volume::-moz-range-thumb {
                    width: 12px !important;
                    height: 12px !important;
                    border: none !important;
                    border-radius: 50% !important;
                    background: var(--nfb-primary) !important;
                    box-shadow: var(--nfb-glow) !important;
                    cursor: pointer !important;
                    transition: transform 0.15s ease !important;
                }
                #nfb-custom-volume::-moz-range-thumb:hover {
                    transform: scale(1.25) !important;
                }
                ` : `
                [data-uia^="control-volume"] {
                    position: fixed !important;
                    bottom: 31px !important; left: 5% !important;
                    border-radius: 50% !important;
                    display: flex !important; align-items: center !important; justify-content: center !important;
                }
                [data-uia^="control-volume"]:hover { background-color: var(--nfb-hover-bg) !important; }
                `}

                /* Mantém a cor primária na barra do volume e na bolinha */
                .volume-slider [style*="background"], [data-uia="scrubber-rail-filled"], [data-uia="scrubber-knob"] { 
                    background-color: var(--nfb-primary) !important; 
                    box-shadow: var(--nfb-glow) !important; 
                }
                [data-uia="scrubber-knob"] { border-radius: 50% !important; }

                /* --- 5. GRUPO DIREITO (posicionamento e tamanho padronizado) --- */
                [data-uia^="control-fullscreen"]:not(svg),
                #nfb-pip-action,
                #nfb-pip-action,
                #nfb-stretch-action,
                #nfb-speed-action,
                [data-uia="control-audio-subtitle"],
                [data-uia="control-episodes"],
                [data-uia="control-next"] {
                    position: fixed !important; z-index: 99999 !important; margin: 0 !important; pointer-events: auto !important;
                    width: 44px !important; height: 44px !important;
                    display: flex !important; align-items: center !important; justify-content: center !important;
                    bottom: 31px !important;
                    overflow: visible !important;
                }
                
                /* Reverte para o tamanho aprovado (0.75) e aplica overflow visible para impedir QUALQUER corte interno ou externo */
                [data-uia^="control-fullscreen"]:not(svg) svg,
                [data-uia="control-audio-subtitle"] svg,
                [data-uia="control-episodes"] svg,
                [data-uia="control-next"] svg,
                [data-uia^="control-volume"] svg {
                    transform: scale(0.75) !important;
                    transform-origin: center !important;
                    overflow: visible !important;
                }

                /* Elimina fundos duplicados internos (nativos da Netflix) ao passar o mouse ou clicar */
                [data-uia^="control-fullscreen"] *:not(svg):not(path),
                #nfb-stretch-action *:not(svg):not(path),
                #nfb-speed-action *:not(svg):not(path),
                [data-uia="control-audio-subtitle"] *:not(svg):not(path),
                [data-uia="control-episodes"] *:not(svg):not(path),
                [data-uia="control-next"] *:not(svg):not(path),
                [data-uia^="control-volume"] *:not(svg):not(path):not([class*="volume"]):not([data-uia*="volume"]):not([data-uia*="scrubber"]) {
                    background: transparent !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                }

                /* Garante que foco e clique não tragam fundos ou bordas esquisitas da Netflix */
                [data-uia^="control-fullscreen"]:focus,
                [data-uia^="control-fullscreen"]:active,
                #nfb-stretch-action:focus,
                #nfb-stretch-action:active,
                #nfb-speed-action:focus,
                #nfb-speed-action:active,
                [data-uia="control-audio-subtitle"]:focus,
                [data-uia="control-audio-subtitle"]:active,
                [data-uia="control-episodes"]:focus,
                [data-uia="control-episodes"]:active,
                [data-uia="control-next"]:focus,
                [data-uia="control-next"]:active,
                [data-uia^="control-volume"]:focus,
                [data-uia^="control-volume"]:active {
                    outline: none !important;
                    box-shadow: none !important;
                }

                ${!appConfig.features.enableHoverScale ? `
                /* Força scale(1) globalmente para evitar pulo no mouseout e cancela hover de volume */
                [data-uia^="control-fullscreen"]:not(svg),
                #nfb-pip-action,
                #nfb-pip-action,
                #nfb-stretch-action,
                #nfb-speed-action,
                [data-uia="control-audio-subtitle"],
                [data-uia="control-episodes"],
                [data-uia="control-next"],
                [data-uia^="control-volume"] {
                    transform: scale(1) !important;
                }
                [data-uia="control-back10"],
                [data-uia="control-forward10"] {
                    transform: translateX(-50%) scale(1) !important;
                }` : ''}

                [data-uia^="control-fullscreen"]:hover,
                #nfb-pip-action:hover,
                #nfb-stretch-action:hover,
                #nfb-speed-action:hover,
                [data-uia="control-audio-subtitle"]:hover,
                [data-uia="control-episodes"]:hover,
                [data-uia="control-next"]:hover,
                ${appConfig.features.enableHorizontalVolume ? `[data-uia^="control-volume"] button:hover` : `[data-uia^="control-volume"]:hover`} {
                    background-color: var(--nfb-hover-bg) !important;
                    border-radius: 50% !important;
                }

                /* Posicionamento dinâmico ordenado dos botões direitos */
                [data-uia^="control-fullscreen"]:not(svg) { right: 4% !important; }
                ${appConfig.features.enablePipBtn ? `#nfb-pip-action { right: calc(4% + 48px) !important; }` : ''}
                ${appConfig.features.enableStretchBtn ? `#nfb-stretch-action { right: calc(4% + ${(appConfig.features.enablePipBtn ? 48 : 0) + 48}px) !important; }` : ''}
                ${appConfig.features.enableSpeedBtn ? `#nfb-speed-action { right: calc(4% + ${(appConfig.features.enablePipBtn ? 48 : 0) + (appConfig.features.enableStretchBtn ? 48 : 0) + 48}px) !important; }` : ''}
                [data-uia="control-audio-subtitle"] { right: calc(4% + ${(appConfig.features.enablePipBtn ? 48 : 0) + (appConfig.features.enableStretchBtn ? 48 : 0) + (appConfig.features.enableSpeedBtn ? 48 : 0) + 48}px) !important; }
                [data-uia="control-episodes"] { right: calc(4% + ${(appConfig.features.enablePipBtn ? 48 : 0) + (appConfig.features.enableStretchBtn ? 48 : 0) + (appConfig.features.enableSpeedBtn ? 48 : 0) + 96}px) !important; }
                [data-uia="control-next"] { right: calc(4% + ${(appConfig.features.enablePipBtn ? 48 : 0) + (appConfig.features.enableStretchBtn ? 48 : 0) + (appConfig.features.enableSpeedBtn ? 48 : 0) + 144}px) !important; }

                /* --- 5b. BANDEIRA (REPORT) AFASTADA --- */
                button.report-problem-button,
                [data-uia="player-report-problem"], 
                [data-uia="control-flag"], 
                [data-uia="report-problem-button"],
                button[aria-label*="problema" i], 
                button[aria-label*="Report" i], 
                button[data-uia*="report"] {
                    position: fixed !important; top: 80px !important; right: 20px !important; 
                    bottom: auto !important; z-index: 99999 !important; padding: 10px !important;
                    margin: 0 !important; transform: none !important;
                }

                /* --- 6. PULAR ABERTURA E PRÓXIMO EP (ELEVADO E QUADRADO ARREDONDADO) --- */
                [data-uia="player-skip-intro"], [data-uia="player-skip-recap"],
                [data-uia^="next-episode-seamless-button"],
                [data-uia^="watch-credits-seamless-button"] {
                    position: fixed !important;
                    bottom: 120px !important;
                    z-index: 999999 !important;
                    border-radius: 8px !important;
                    padding: 10px 20px !important;
                    pointer-events: auto !important;
                }
                [data-uia="player-skip-intro"], [data-uia="player-skip-recap"],
                [data-uia^="next-episode-seamless-button"] {
                    right: 5% !important;
                }
                /* Desloca o botão de créditos para a esquerda para não sobrepor o próximo episódio */
                [data-uia^="watch-credits-seamless-button"] {
                    right: calc(5% + 240px) !important;
                }
            `;
        }

        /* --- 7. TIMELINE DE EPISÓDIOS AZUL --- */
        css += `
            .titleCard-synopsis [style*="background-color: rgb(229, 9, 20)"],
            .titleCard-synopsis [style*="background: rgb(229, 9, 20)"],
            .episode-list [style*="background-color: rgb(229, 9, 20)"],
            .episode-list [style*="background: rgb(229, 9, 20)"] {
                background-color: var(--nfb-primary) !important;
                background: var(--nfb-primary) !important;
            }
        `;

        /* PAINEL FLUTUANTE DE CONFIGS (NETFLIX ENHANCED MODERN GLASS UI) */
        css += `
            #nfb-panel {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.96);
                background: rgba(14, 18, 27, 0.94); border: 1px solid rgba(255, 255, 255, 0.12);
                padding: 22px 24px; border-radius: 20px; z-index: 2147483647;
                color: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                display: none; opacity: 0;
                box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08), var(--nfb-glow);
                width: 380px; max-width: 92vw; backdrop-filter: blur(28px) saturate(180%);
                transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            }
            #nfb-panel.active { display: block; opacity: 1; transform: translate(-50%, -50%) scale(1); }
            
            .nfb-header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .nfb-title-wrap { display: flex; align-items: center; gap: 8px; }
            .nfb-title { font-size: 17px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; margin: 0; }
            .nfb-badge {
                font-size: 10px; font-weight: 700; background: var(--nfb-primary); color: #fff;
                padding: 2px 7px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
                box-shadow: var(--nfb-glow);
            }
            .nfb-close-btn {
                background: rgba(255, 255, 255, 0.07); border: none; color: #a0aec0;
                width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 15px; transition: all 0.2s ease;
            }
            .nfb-close-btn:hover { background: rgba(255, 255, 255, 0.16); color: #fff; transform: scale(1.08); }
            
            /* Tabs Navigation */
            .nfb-tabs {
                display: flex; background: rgba(255, 255, 255, 0.05); padding: 4px;
                border-radius: 12px; margin-bottom: 16px; gap: 4px;
            }
            .nfb-tab-btn {
                flex: 1; background: transparent; border: none; color: #94a3b8; padding: 8px 10px;
                font-size: 12px; font-weight: 600; cursor: pointer; border-radius: 8px;
                transition: all 0.2s ease; text-align: center;
            }
            .nfb-tab-btn:hover { color: #ffffff; }
            .nfb-tab-btn.active {
                background: var(--nfb-primary); color: #ffffff;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3), var(--nfb-glow);
            }
            
            .nfb-tab-content { display: none; }
            .nfb-tab-content.active { display: block; animation: nfbFadeIn 0.2s ease; }
            
            @keyframes nfbFadeIn {
                from { opacity: 0; transform: translateY(3px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .nfb-group {
                margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;
                font-size: 13px; font-weight: 500; padding: 10px 14px;
                background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 10px; transition: background 0.15s ease, border-color 0.15s ease;
            }
            .nfb-group:hover {
                background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.12);
            }
            .nfb-group > span { color: #e2e8f0; font-size: 13px; }
            .nfb-group input[type="color"] {
                width: 34px; height: 30px; border: 2px solid rgba(255,255,255,0.2);
                cursor: pointer; background: transparent; border-radius: 8px; padding: 0; outline: none;
            }
            
            /* Premium Neon Switches */
            .nfb-switch {
                position: relative; display: inline-block; width: 42px; height: 22px; flex-shrink: 0;
            }
            .nfb-switch input { opacity: 0; width: 0; height: 0; }
            .nfb-slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: rgba(255, 255, 255, 0.18); transition: 0.25s ease; border-radius: 22px;
            }
            .nfb-slider:before {
                position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
                background-color: white; transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            }
            .nfb-switch input:checked + .nfb-slider {
                background-color: var(--nfb-primary);
                box-shadow: var(--nfb-glow);
            }
            .nfb-switch input:checked + .nfb-slider:before {
                transform: translateX(20px);
            }
            
            /* Styled Text Inputs */
            .nfb-group input[type="text"] {
                width: 150px; background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255,255,255,0.15);
                color: #fff; border-radius: 8px; padding: 6px 10px; font-size: 12px; outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .nfb-group input[type="text"]:focus {
                border-color: var(--nfb-primary);
                box-shadow: 0 0 8px var(--nfb-primary);
            }

            .nfb-filter-range {
                display: flex; align-items: center; gap: 10px;
            }
            .nfb-filter-range input[type="range"] {
                width: 100px; height: 5px; accent-color: var(--nfb-primary); cursor: pointer;
            }
            .nfb-filter-range span.val {
                min-width: 42px; text-align: right; font-size: 12px; color: var(--nfb-primary); font-weight: 700;
            }

            #nfb-save {
                width: 100%; padding: 12px;
                background: linear-gradient(135deg, var(--nfb-primary) 0%, var(--nfb-hover) 100%);
                color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700;
                margin-top: 14px; font-size: 14px; letter-spacing: 0.2px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.5), var(--nfb-glow); transition: all 0.2s ease;
            }
            #nfb-save:hover {
                transform: translateY(-1px); filter: brightness(1.12);
                box-shadow: 0 6px 22px rgba(0,0,0,0.6), var(--nfb-glow);
            }
            #nfb-save:active { transform: translateY(0); }
            
            #nfb-toggle-btn {
                position: fixed; top: 22px; right: 24px; z-index: 2147483647;
                background: rgba(14, 18, 27, 0.85); backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.16); color: #fff;
                width: 44px; height: 44px; border-radius: 50%; cursor: pointer; font-size: 20px;
                opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 18px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
            }
            #nfb-toggle-btn:hover { opacity: 1 !important; transform: scale(1.08); border-color: var(--nfb-primary); box-shadow: var(--nfb-glow); }
            
            .nfb-stretch-btn, #nfb-pip-action {
                background: transparent; border: none; color: white; cursor: pointer;
                padding: 0; opacity: 0.85; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s ease;
            }
            .nfb-stretch-btn:hover, #nfb-pip-action:hover { opacity: 1; color: var(--nfb-hover) !important; }
            
            /* Tab scroll areas */
            .nfb-tab-scroll { max-height: 280px; overflow-y: auto; padding-right: 4px; }
            .nfb-tab-scroll::-webkit-scrollbar { width: 5px; }
            .nfb-tab-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.15); border-radius: 4px; }
            .nfb-tab-scroll::-webkit-scrollbar-thumb { background: var(--nfb-primary); border-radius: 4px; }
        `;
        styleEl.textContent = css;
    }

    function overrideEmotionColors() {
        if (!appConfig.features.enableTheme) return;
        // Seleção instantânea sem layout thrashing (dispensa getComputedStyle em loops)
        const candidates = document.querySelectorAll(
            '.watch-video [style*="229, 9, 20"]:not(.nfb-locked), ' +
            '.watch-video [style*="229,9,20"]:not(.nfb-locked), ' +
            '.watch-video [style*="216, 31, 38"]:not(.nfb-locked), ' +
            '.watch-video [style*="#e50914"]:not(.nfb-locked), ' +
            '.episode-list [style*="229, 9, 20"]:not(.nfb-locked), ' +
            '.episode-list [style*="229,9,20"]:not(.nfb-locked)'
        );
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            el.style.setProperty('background-color', 'var(--nfb-primary)', 'important');
            el.style.setProperty('background', 'var(--nfb-primary)', 'important');
            el.style.setProperty('background-image', 'none', 'important');
            el.classList.add('nfb-locked');
        }
    }

    // ==========================================
    // 3b. NEUTRALIZA OVERLAYS QUE BLOQUEIAM BOTÕES
    // ==========================================
    let lastNeutralizeTime = 0;
    function neutralizeBlockers() {
        if (!appConfig.features.studioLayout) return;
        const now = Date.now();
        if (now - lastNeutralizeTime < 1500) return;
        lastNeutralizeTime = now;

        const buttonSelectors = [
            '[data-uia^="control-play-pause"]',
            '[data-uia="control-back10"]',
            '[data-uia="control-forward10"]'
        ];

        buttonSelectors.forEach(sel => {
            const btn = document.querySelector(sel);
            if (!btn) return;
            const rect = btn.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const topElement = document.elementFromPoint(centerX, centerY);

            if (!topElement) return;

            // Se o elemento no topo NÃO é o botão nem filho do botão, é um bloqueador
            if (topElement !== btn && !btn.contains(topElement)) {
                // Não neutralizar vídeo, timeline, ou nossos próprios elementos
                if (topElement.tagName === 'VIDEO') return;
                if (topElement.closest('[data-uia="timeline"]')) return;
                if (topElement.id && topElement.id.startsWith('nfb-')) return;

                // Neutraliza o bloqueador e todos seus ancestors até .watch-video
                let el = topElement;
                while (el && !el.classList.contains('watch-video') && el !== document.body) {
                    if (!el.closest('[data-uia^="control-"]') && !el.closest('[data-uia="timeline"]')) {
                        el.classList.add('nfb-neutralized');
                    }
                    el = el.parentElement;
                }
            }
        });
    }



    // ==========================================
    // 3d. INJEÇÃO DO VOLUME HORIZONTAL CUSTOMIZADO
    // ==========================================
    function tryInjectVolumeSlider() {
        if (!appConfig.features.enableHorizontalVolume || document.getElementById('nfb-custom-volume-container')) return;
        const volumeWrapper = document.querySelector('[data-uia^="control-volume"]');
        if (volumeWrapper) {
            const container = document.createElement('div');
            container.id = 'nfb-custom-volume-container';

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = 'nfb-custom-volume';
            slider.min = '0';
            slider.max = '1';
            slider.step = '0.05';
            slider.title = appConfig.texts.volumeSliderTitle;

            // Defina o valor inicial
            const video = getVideoEl();
            slider.value = video ? (video.muted ? 0 : video.volume) : 1;

            slider.oninput = (e) => {
                const vid = getVideoEl();
                if (vid) {
                    vid.volume = parseFloat(e.target.value);
                    vid.muted = vid.volume === 0;
                }
            };

            // Drag/active tracking para manter o slider aberto durante o arraste
            const startDrag = (e) => {
                e.stopPropagation();
                container.classList.add('nfb-active');
            };
            const stopDrag = () => {
                container.classList.remove('nfb-active');
            };

            slider.addEventListener('mousedown', startDrag);
            window.addEventListener('mouseup', stopDrag);

            // Impede que os eventos de clique e arraste borbulhem para o container pai (evitando auto-mute)
            container.onclick = (e) => e.stopPropagation();
            container.onmousedown = (e) => e.stopPropagation();
            container.onmouseup = (e) => e.stopPropagation();

            slider.onclick = (e) => e.stopPropagation();
            slider.onmouseup = (e) => e.stopPropagation();

            // Suporte a ajuste de volume por scroll (mousewheel) sobre toda a área de controle de volume
            volumeWrapper.addEventListener('wheel', (e) => {
                const vid = getVideoEl();
                if (vid) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Rolagem para cima (+) ou para baixo (-)
                    let change = e.deltaY < 0 ? 0.05 : -0.05;
                    let newVol = Math.max(0, Math.min(1, (vid.muted ? 0 : vid.volume) + change));

                    vid.volume = parseFloat(newVol.toFixed(2));
                    vid.muted = vid.volume === 0;
                    slider.value = vid.volume;
                }
            }, { passive: false });

            container.appendChild(slider);
            volumeWrapper.appendChild(container);

            // Força sincronização imediata
            syncCustomVolume();
        }
    }

    function syncCustomVolume() {
        const slider = document.getElementById('nfb-custom-volume');
        const video = getVideoEl();
        if (slider && video) {
            // Atualiza slider se houver mudança externa (atalhos de teclado, etc)
            if (document.activeElement !== slider) {
                slider.value = video.muted ? 0 : video.volume;
            }

            if (!video.dataset.nfbVolumeBound) {
                video.dataset.nfbVolumeBound = "true";
                video.addEventListener('volumechange', () => {
                    const activeSlider = document.getElementById('nfb-custom-volume');
                    const activeVideo = getVideoEl();
                    if (activeSlider && activeVideo && document.activeElement !== activeSlider) {
                        activeSlider.value = activeVideo.muted ? 0 : activeVideo.volume;
                    }
                });
            }
        }
    }

    // ==========================================
    // 3e. AJUSTE GLOBAL DE VOLUME VIA SCROLL DO MOUSE
    // ==========================================
    let globalScrollBound = false;
    function initGlobalVolumeScroll() {
        if (globalScrollBound) return;
        globalScrollBound = true;

        window.addEventListener('wheel', (e) => {
            if (!appConfig.features.enableGlobalVolumeScroll) return;

            // Ignora se estiver rolando em cima do botão de velocidade (ele tem seu próprio ajuste)
            if (e.target && (e.target.id === 'nfb-speed-action' || e.target.closest('#nfb-speed-action'))) {
                return;
            }

            // Ignora se estiver dentro do menu flutuante de configurações
            if (e.target && e.target.closest('#nfb-panel')) {
                return;
            }

            // Ignora se estiver rolando a lista/drawer de episódios da Netflix
            if (e.target && e.target.closest('.episode-list, [data-uia="episodes-container"], .episodes-pane')) {
                return;
            }

            const video = getVideoEl();
            // Apenas atua quando o player da Netflix está ativo na tela
            if (!video || !document.querySelector('.watch-video')) return;

            e.preventDefault();
            e.stopPropagation();

            const change = e.deltaY < 0 ? 0.05 : -0.05;
            let currentVol = video.muted ? 0 : video.volume;
            let newVol = Math.max(0, Math.min(1, parseFloat((currentVol + change).toFixed(2))));

            video.volume = newVol;
            video.muted = newVol === 0;

            const slider = document.getElementById('nfb-custom-volume');
            if (slider) slider.value = newVol;

            showQuickHud(`🔊 Volume: ${Math.round(newVol * 100)}%`);
        }, { passive: false });
    }


    function hideNativeVolumeSlider() {
        if (!appConfig.features.enableHorizontalVolume) return;
        const sliders = document.querySelectorAll('.volume-slider, [data-uia="volume-slider"], [class*="volume-slider"], .watch-video--scrubber-volume-container, [data-uia="watch-video-volume-content"], [data-uia="scrubber"], [data-uia="scrubber-rail"], [data-uia="scrubber-knob"]');
        sliders.forEach(el => {
            if (el.style.display !== 'none') {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
            }
        });
    }

    // ==========================================
    // 4. INJEÇÃO DO BOTÃO STRETCH
    // ==========================================
    function tryInjectStretchButton() {
        if (!appConfig.features.enableStretchBtn || document.getElementById('nfb-stretch-action')) return;
        const fullscreenBtn = document.querySelector('[data-uia="control-fullscreen-enter"], [data-uia="control-fullscreen-exit"]');
        if (fullscreenBtn && fullscreenBtn.parentNode) {
            const stretchBtn = document.createElement('button');
            stretchBtn.id = 'nfb-stretch-action';
            stretchBtn.className = 'nfb-stretch-btn';
            stretchBtn.title = appConfig.texts.stretchBtnTitle;
            stretchBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px; height:24px; pointer-events: none;">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            `;
            stretchBtn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                const video = getVideoEl();
                if (video) video.style.objectFit = video.style.objectFit === "fill" ? "contain" : "fill";
            };
            fullscreenBtn.parentNode.insertBefore(stretchBtn, fullscreenBtn);
        }
    }

    // ==========================================
    // 4b. INJEÇÃO DO BOTÃO DE VELOCIDADE (PERSISTENTE ENTRE EPISÓDIOS)
    // ==========================================
    const speeds = [0.25, 0.5, 1.0, 1.25, 1.5, 2.0];
    let savedRate = GM_getValue('nfb_playback_rate', 1.0);
    let currentSpeedIndex = speeds.indexOf(savedRate) !== -1 ? speeds.indexOf(savedRate) : speeds.indexOf(1.0);

    let isApplyingSpeed = false;

    function applyPlaybackRate() {
        if (!appConfig.features.enableSpeedBtn || isApplyingSpeed) return;
        const targetRate = speeds[currentSpeedIndex];
        const video = getVideoEl();

        if (video) {
            // Nunca força playbackRate durante seek/carregamento de intro
            if (!video.seeking && Math.abs(video.playbackRate - targetRate) > 0.02) {
                try {
                    isApplyingSpeed = true;
                    video.playbackRate = targetRate;
                } catch (e) {
                } finally {
                    setTimeout(() => { isApplyingSpeed = false; }, 60);
                }
            }

            if (!video.dataset.nfbSpeedBound) {
                video.dataset.nfbSpeedBound = "true";
                const enforce = () => {
                    if (!video.seeking && Math.abs(video.playbackRate - speeds[currentSpeedIndex]) > 0.02) {
                        try {
                            video.playbackRate = speeds[currentSpeedIndex];
                        } catch (e) { }
                    }
                };
                video.addEventListener('playing', enforce);
                video.addEventListener('canplay', enforce);
            }
        }

        const speedBtn = document.getElementById('nfb-speed-action');
        if (speedBtn && speedBtn.innerText !== targetRate + "x") {
            speedBtn.innerText = targetRate + "x";
        }
    }

    function tryInjectSpeedButton() {
        if (!appConfig.features.enableSpeedBtn || document.getElementById('nfb-speed-action')) {
            applyPlaybackRate();
            return;
        }
        const stretchBtn = document.getElementById('nfb-stretch-action');
        const fullscreenBtn = document.querySelector('[data-uia="control-fullscreen-enter"], [data-uia="control-fullscreen-exit"]');
        const targetBtn = stretchBtn || fullscreenBtn;

        if (targetBtn && targetBtn.parentNode) {
            const speedBtn = document.createElement('button');
            speedBtn.id = 'nfb-speed-action';
            speedBtn.className = 'nfb-stretch-btn';
            speedBtn.title = "Velocidade de Reprodução";
            speedBtn.innerText = speeds[currentSpeedIndex] + "x";
            speedBtn.style.fontSize = "16px";
            speedBtn.style.fontWeight = "bold";

            speedBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
                const newRate = speeds[currentSpeedIndex];
                GM_setValue('nfb_playback_rate', newRate);
                applyPlaybackRate();
                showQuickHud(`${newRate}x`);
            };

            // Ajuste fluido da velocidade via scroll do mouse
            speedBtn.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.deltaY < 0) {
                    currentSpeedIndex = Math.min(speeds.length - 1, currentSpeedIndex + 1);
                } else {
                    currentSpeedIndex = Math.max(0, currentSpeedIndex - 1);
                }
                const newRate = speeds[currentSpeedIndex];
                GM_setValue('nfb_playback_rate', newRate);
                applyPlaybackRate();
                showQuickHud(`${newRate}x`);
            }, { passive: false });

            targetBtn.parentNode.insertBefore(speedBtn, stretchBtn || fullscreenBtn);
            applyPlaybackRate();
        }
    }

    // ==========================================
    // 4c. INJEÇÃO DO BOTÃO PICTURE-IN-PICTURE (PIP)
    // ==========================================
    function tryInjectPipButton() {
        if (!appConfig.features.enablePipBtn || document.getElementById('nfb-pip-action')) return;
        if (!document.pictureInPictureEnabled) return;

        const fullscreenBtn = document.querySelector('[data-uia="control-fullscreen-enter"], [data-uia="control-fullscreen-exit"]');
        if (fullscreenBtn && fullscreenBtn.parentNode) {
            const pipBtn = document.createElement('button');
            pipBtn.id = 'nfb-pip-action';
            pipBtn.className = 'nfb-stretch-btn';
            pipBtn.title = appConfig.texts.pipBtnTitle;
            pipBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px; height:20px; pointer-events: none;">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <rect x="12" y="10" width="8" height="6" rx="1" fill="currentColor"></rect>
                </svg>
            `;
            pipBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePictureInPicture();
            };
            fullscreenBtn.parentNode.insertBefore(pipBtn, fullscreenBtn);
        }
    }

    async function togglePictureInPicture() {
        const video = getVideoEl();
        if (!video) {
            showQuickHud("Vídeo não encontrado");
            return;
        }

        try {
            video.disablePictureInPicture = false;
            if (video.hasAttribute('disablepictureinpicture')) {
                video.removeAttribute('disablepictureinpicture');
            }

            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                showQuickHud("PiP Desativado");
            } else if (video.requestPictureInPicture) {
                await video.requestPictureInPicture();
                showQuickHud("PiP Ativado");
            } else {
                showQuickHud("PiP não suportado");
            }
        } catch (err) {
            console.error('[Netflix Enhanced] Erro ao alternar PiP:', err);
            showQuickHud("Erro ao abrir PiP");
        }
    }

    function applyVideoFilters() {
        const video = getVideoEl();
        if (!video) return;
        const b = appConfig.filters.brightness ?? 100;
        const c = appConfig.filters.contrast ?? 100;
        const s = appConfig.filters.saturate ?? 100;
        if (b === 100 && c === 100 && s === 100) {
            if (video.style.filter) video.style.filter = '';
        } else {
            const filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
            if (video.style.filter !== filterStr) {
                video.style.filter = filterStr;
            }
        }
    }

    // ==========================================
    // 4e. ATALHOS RÁPIDOS DE TECLADO & HUD
    // ==========================================
    let shortcutsInitialized = false;
    function initKeyboardShortcuts() {
        if (shortcutsInitialized) return;
        shortcutsInitialized = true;

        window.addEventListener('keydown', (e) => {
            if (!appConfig.features.enableShortcuts) return;

            // Ignora se estiver digitando em campos de texto / busca
            const tag = (e.target.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) {
                return;
            }

            const key = e.key;

            // [ : Diminuir velocidade
            if (key === '[') {
                e.preventDefault();
                currentSpeedIndex = Math.max(0, currentSpeedIndex - 1);
                const newRate = speeds[currentSpeedIndex];
                GM_setValue('nfb_playback_rate', newRate);
                applyPlaybackRate();
                showQuickHud(`${newRate}x`);
            }
            // ] : Aumentar velocidade
            else if (key === ']') {
                e.preventDefault();
                currentSpeedIndex = Math.min(speeds.length - 1, currentSpeedIndex + 1);
                const newRate = speeds[currentSpeedIndex];
                GM_setValue('nfb_playback_rate', newRate);
                applyPlaybackRate();
                showQuickHud(`${newRate}x`);
            }
            // s ou S : Stretch (esticar tela)
            else if (key === 's' || key === 'S') {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    const video = getVideoEl();
                    if (video) {
                        video.style.objectFit = video.style.objectFit === "fill" ? "contain" : "fill";
                        showQuickHud(video.style.objectFit === "fill" ? "Esticado (Fill)" : "Original (Contain)");
                    }
                }
            }
            // p ou P : Picture-in-Picture
            else if (key === 'p' || key === 'P') {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    togglePictureInPicture();
                }
            }
        });
    }

    let hudTimer = null;
    function showQuickHud(msg) {
        if (!appConfig.features.enableHudToasts) return;
        let hud = document.getElementById('nfb-quick-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'nfb-quick-hud';
            document.documentElement.appendChild(hud);
        }
        hud.textContent = msg;
        hud.classList.add('nfb-hud-visible');
        clearTimeout(hudTimer);
        hudTimer = setTimeout(() => {
            hud.classList.remove('nfb-hud-visible');
        }, 1200);
    }

    // ==========================================
    // 7. DECODER DE ENTIDADES HTML (NOMES ALEATÓRIOS COMO &#8220;)
    // ==========================================
    function decodeHtmlEntities(str) {
        if (!str || typeof str !== 'string') return '';
        if (!str.includes('&')) return str.trim();
        try {
            const doc = new DOMParser().parseFromString(str, 'text/html');
            let decoded = doc.documentElement.textContent || str;
            decoded = decoded.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
                .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            return decoded.trim();
        } catch (e) {
            return str
                .replace(/&#8220;/g, '“').replace(/&#8221;/g, '”')
                .replace(/&#8216;/g, '‘').replace(/&#8217;/g, '’')
                .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—')
                .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
                .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
                .trim();
        }
    }

    function decodeDomEntities() {
        const targets = document.querySelectorAll(
            '[data-uia="video-title"] span, [data-uia="video-title"] h4, .titleCard-title_text, .titleCard-synopsis, .titleCard-title, .episode-title'
        );
        targets.forEach(el => {
            if (el.textContent && el.textContent.includes('&#')) {
                el.textContent = decodeHtmlEntities(el.textContent);
            }
        });
    }

    // ==========================================
    // ==========================================
    // 7b. ONE PIECE EPISODE RENAMER (ZERO DELAY EMBEDDED)
    // ==========================================
    const EMBEDDED_OP_EPISODES = {
        "1": "Eu sou Luffy! O homem que será o Rei dos Piratas!",
        "2": "O grande espadachim aparece! Caçador de piratas, Roronoa Zoro.",
        "3": "Morgan vs Luffy! Quem é aquela linda misteriosa?",
        "4": "O passado de Luffy! Shanks, o Ruivo, aparece!",
        "5": "Medo, poder misterioso! Palhaço-pirata, Capitão Buggy!",
        "6": "Situação desesperadora! Moji, o domador contra Luffy!",
        "7": "Grande duelo! Zoro, o espadachim contra Cabaji, o acrobata!",
        "8": "Quem será o vencedor? Confronto de habilidades da Akuma no Mi! - 29/12/199 (capítulo 19-20-21)",
        "9": "Honorável mentiroso? Capitão Usopp.",
        "10": "O homem mais estranho do mundo! Jango, o hipnotizador!",
        "11": "Revelando a conspiração! O pirata mordomo, Capitão Kuro.",
        "12": "Impacto violento! Grupo de piratas Kuroneko. Grandes ataques e defesas na ladeira!",
        "13": "A temível dupla! Irmãos Nyaban vs Zoro.",
        "14": "A volta de Luffy! A incrível persistência da senhorita Kaya.",
        "15": "Derrote o Kuro! As lágrimas da decisão de um homem chamado Usopp!",
        "16": "Protejam Kaya! O grandioso trabalho dos Piratas de Usopp!",
        "17": "Explosão de raiva! O final da batalha entre Kuro e Luffy!",
        "18": "Você é uma raridade! Gaimon e seus estranhos amigos!",
        "19": "Teste! O juramento de Zoro e Kuina!",
        "20": "O famoso cozinheiro! Sanji, do restaurante flutuante.",
        "21": "Um freguês indesejado! A comida de Sanji e a gratidão de Gin.",
        "22": "A frota pirata mais poderosa! Capitão Don Krieg.",
        "23": "Protejam o Baratie! O grande pirata da perna vermelha, Zeff.",
        "24": "Mihawk Olhos de Falcão! Zoro, o espadachim, cai no mar.",
        "25": "Sequência de chutes mortais! Sanji vs Pearl, a Parede de Ferro.",
        "26": "O sonho de Zeff e Sanji. O mar dos sonhos, All Blue.",
        "27": "O diabólico homem de sangue frio. Comandante de batalha da tripulação Pirata, Gin.",
        "28": "Eu não morrerei! Desfecho: Luffy vs Krieg!",
        "29": "O resultado de uma batalha mortal! A lança interior!",
        "30": "Partida! O cozinheiro do mar e Luffy viajam juntos .",
        "31": "O homem mais terrível do Mar do Leste! Arlong, da Gangue dos Tritões!",
        "32": "A bruxa da Vila Kokoyashi! A administradora feminina de Arlong.",
        "33": "Usopp irá morrer?! Luffy ainda não desembarcou?",
        "34": "Reunidos! Usopp conta a verdadeira história de Nami.",
        "35": "O passado escondido! A guerreira Bellemere!",
        "36": "Sobrevivam! Bellemere, a mãe, e a família de Nami!",
        "37": "Luffy se levanta! O fim de uma promessa quebrada!",
        "38": "Luffy em apuros! Tritões vs Piratas do Chapéu de palha!",
        "39": "Luffy submerge! Zoro vs o polvo Hatchan.",
        "40": "Guerreiros orgulhosos! A violenta batalha de Sanji e Usopp.",
        "41": "Luffy vai com tudo! A decisão de Nami e o chapéu de palha.",
        "42": "Explosão! Tritão Arlong. Ataque feroz de dentro do mar!",
        "43": "Fim do Império dos Tritões! A Nami é minha companheira!",
        "44": "Uma partida sorridente! Adeus cidade natal, Vila Kokoyashi.",
        "45": "Procura-se! O mundo conhece Luffy chapéu de palha!",
        "46": "Atrás do Chapéu de palha! A grande aventura do pequeno Buggy!",
        "47": "Você esteve esperando por isso! O retorno do Capitão Buggy!",
        "48": "A cidade do começo e do fim. A chegada em Loguetown.",
        "49": "Sandai Kitetsu e Yubashiri! As novas espadas de Zoro e a mulher Sargento.",
        "50": "Usopp vs Daddy carregador de crianças. O duelo em plena luz do dia.",
        "51": "Uma incandescente batalha culinária? Sanji vs a chef espetacular.",
        "52": "A revanche de Buggy! O homem que sorri na plataforma de execução!",
        "53": "A lenda começou! Em direção à Grand line!",
        "54": "Pressentimento de uma nova aventura! Apis, a garota misteriosa.",
        "55": "A criatura milagrosa! O segredo de Apis e a ilha lendária.",
        "56": "O ataque de Erik! A grande fuga da ilha Gunkan!",
        "57": "A ilha solitária em um mar distante! A lendária Lost Island.",
        "58": "O duelo nas ruínas! O tenso Zoro vs Erik!",
        "59": "Luffy completamente cercado! O plano secreto do Comodoro Nelson.",
        "60": "Aquele que voa sobre os céus! A lenda milenar renasce!",
        "61": "Fúria na decisão! Superem a Red Line!",
        "62": "Na primeira fortaleza? Surge a baleia gigante - Laboon.",
        "63": "A promessa de um homem! Luffy e a baleia, a promessa do reencontro.",
        "64": "A cidade que recepciona os piratas? Desembarcando em Wiskey Peak.",
        "65": "A Explosiva Santouryuu! Zoro vs Baroque Works! A princesa de Alabasta.",
        "66": "Uma luta séria! Luffy vs Zoro, A grande batalha misteriosa!",
        "67": "Entreguem a princessa Vivi! A partida do bando de Luffy.",
        "68": "Ânimo, Coby! Recordações da dura briga com a Marinha de Coby-Meppo.",
        "69": "A determinação de Coby-Meppo! O orgulho paternal do Vice-Almirante Garp!",
        "70": "A antiga ilha! A sombra à espreita em Little Garden.",
        "71": "Um grande duelo! Os gigantes Dorry e Brogy!",
        "72": "A fúria de Luffy! Golpe baixo em uma batalha sagrada!",
        "73": "Brogy lamenta a vitória! O julgamento de Elbaf!",
        "74": "A vela do diabo! Lágrimas de arrependimento e lágrimas de raiva!",
        "75": "Luffy é atacado por magia! Armadilha colorida!",
        "76": "Contra-ataque crítico! O sagaz Usopp e o kaenboshi!",
        "77": "Adeus à ilha dos gigantes! Em direção à Alabasta!",
        "78": "Nami doente? Do outro lado da neve que cai no oceano!",
        "79": "Emboscada! O Bliking e Wapol, o Blik.",
        "80": "Uma ilha sem médico? Aventura em um país sem nome e com neve!",
        "81": "Está feliz? Uma médica que foi chamada de bruxa.",
        "82": "A decisão de Dalton! A chegada das forças de Wapol.",
        "83": "A Ilha Que Vive Sob Neve! Suba os Drum Rockies!",
        "84": "A rena do nariz azul! O segredo de Chopper.",
        "85": "O sonho dos excluídos! Hiluluk, o curandeiro!",
        "86": "As flores de cerejeira de Hiluluk e a determinação herdada!",
        "87": "Contra o Exército de Wapol! As habilidades da Baku Baku no Mi!",
        "88": "A Akuma no Mi do tipo zoan! As sete transformações de Chopper!",
        "89": "Quando um reinado acaba! A crença da bandeira será eterna.",
        "90": "As flores de cerejeiras de Hiluluk! O milagre nos Drum Rockies.",
        "91": "Adeus ilha de Drum! Estou indo para o mar!",
        "92": "O herói de Alabasta! E a bailarina do navio!",
        "93": "Chegando no país do deserto! O pó que faz chover e o exército rebelde.",
        "94": "O reencontro dos poderosos! Seu nome é Ace dos punhos de fogo.",
        "95": "Ace e Luffy! Calorosas lembranças e laços de irmandade.",
        "96": "A cidade verde, Erumalu, e os Kung fu dugong!",
        "97": "Aventura no país da areia! Os monstros da Terra escaldante.",
        "98": "Surgem os Piratas do deserto! Homens que vivem livremente.",
        "99": "O espírito dos falsos! O coração do exército rebelde, Kamyu!",
        "100": "O guerreiro rebelde. Kohza! O sonho jurado a Vivi.",
        "101": "A batalha no nevoeiro de calor! Ace vs Homem escorpião.",
        "102": "As ruínas antigas e as almas perdidas! Amigos de Vivi, e a forma da nação.",
        "103": "No Spiders café. Os líderes inimigos se reúnem as oito horas.",
        "104": "Luffy vs Vivi! Juramento de lágrimas que criam companheiros.",
        "105": "Guerra em Alabasta! Rainbase, A cidade dos sonhos.",
        "106": "A absoluta armadilha final! Investida ao Rain Dinners.",
        "107": "A operação utopia começa! Os rebeldes começam a se movimentar.",
        "108": "O terrível Bananawani e Mr. Prince.",
        "109": "A chave para uma reversão e fuga! A Doru Doru ball!",
        "110": "Batalha sem compaixão! Luffy vs Crocodile.",
        "111": "Correr para um milagre! Alabasta, Reino animal.",
        "112": "Exército rebelde vs exército real! O combate final será em Alubarna.",
        "113": "Alubarna dos sofrimentos! A feroz batalha do Capitão Carue!",
        "114": "Insulto ao sonho dos amigos! Batalha na 4ª avenida na galeria da toupeira.",
        "115": "A grande Interpretação de hoje! Mane Mane montage!",
        "116": "Transformando-se em Nami! O poderoso Ballet kenpo de Bon Clay.",
        "117": "A advertência do tornado de Nami! Explosão do Clima tact.",
        "118": "O segredo da família real! A antiga arma, Pluton.",
        "119": "Essência de uma poderosa espada! O poder de cortar o aço e a respiração de todas as coisas.",
        "120": "A batalha termina! Kohza ergue a bandeira branca!",
        "121": "A voz de Vivi não é ouvida! Cai um herói!",
        "122": "Crocodilo de areia e Luffy de água! Duelo mortal: segundo round.",
        "123": "Cheiro de crocodilo! Corra para o cemitério da família real, Luffy!",
        "124": "A hora do pesadelo se aproxima! A base secreta do Clã suna suna.",
        "125": "Asas magníficas! Meu nome é Pell, o espírito guardião do reino.",
        "126": "Eu vou te superar! A chuva cai sobre Alabasta.",
        "127": "Adeus as armas! Piratas e um pouco de Justiça.",
        "128": "O banquete dos piratas e o plano para escapar de Alabasta!",
        "129": "Tudo começou naquele dia! Vivi conta suas aventuras.",
        "130": "Cheiro de perigo! A sétima é Nico Robin.",
        "131": "Primeiro paciente! Anedota da Rumble ball. 03/11/2002",
        "132": "A rebelião da navegadora! Por um sonho inabalável. 10/11/2002",
        "133": "Receita herdada! Sanji, o \"expert\" do curry. 17/11/2002",
        "134": "Eu vou fazer florescer! A Bola 8-Shaku do viril Usopp. 24/11/2002",
        "135": "O infame caçador de piratas! O errante espadachim, Zoro. 01/12/2002",
        "136": "Zenny vive na Ilha da Cabra e há um barco pirata na sua montanha. 08/12/2002",
        "137": "Não se parece uma ganância incrível? A ambição do agiota Zenny! 15/12/2002",
        "138": "O paradeiro do tesouro da ilha! A todo vapor, Piratas de Zenny! 22/12/2002",
        "139": "A lenda da Neblina Arco-Íris! O Velho Henzon da Ilha Ruluka. 05/01/2003",
        "140": "Habitantes da \"Terra do Nunca\"! Os Piratas da Abóbora! 12/01/2003",
        "141": "Sentimentos pela terra natal! O inescapável cemitério dos piratas! 19/01/2003",
        "142": "Batalha inevitável! A ambição de Whetton e a Torre Arco-Íris! 26/01/2003",
        "143": "Então começa a lenda! Para o fim do arco-íris! 02/02/2003",
        "144": "O log atraído! Masira, o Rei do Resgate!",
        "145": "Monstros aparecem! Não toque nos piratas do Barba Branca.",
        "146": "Pare de sonhar! A cidade do ridículo, Mock Town!",
        "147": "O pico dos piratas! O homem que fala dos sonhos e o rei da exploração.",
        "148": "A família lendária! Norland, o mentiroso.",
        "149": "Em direção às nuvens! Encontrem o Southbird!",
        "150": "Não é possível realizar o sonho? Bellamy contra a Aliança Saruyama.",
        "151": "O Homem de cem milhões! A autoridade máxima do mundo e o pirata Barba Negra!",
        "152": "Navegando até o céu! Peguem a Knock Up Stream!",
        "153": "Esse é o mar do céu! O cavaleiro do céu e o portão do paraíso.",
        "154": "Skypiea, o reino de deus! Os anjos da praia de nuvens.",
        "155": "O solo sagrado proibido! A terra onde deus mora e o julgamento celestial!",
        "156": "Já são criminosos? Os guardas da lei de Skypiea.",
        "157": "Podemos fugir? Começa a provação de deus!",
        "158": "Armadilha na Rua Adorável! O todo poderoso Deus Enel.",
        "159": "Vá em frente, pequeno corvo! Rumo ao altar do sacrifício!",
        "160": "Taxa de sobrevivência 10%! O sacerdote Satori com o poder do mantra!",
        "161": "O perigo da provação das bolhas! Lutem até a morte na Floresta Perdida!",
        "162": "Chopper em perigo! Antigo deus x sacerdote Shura!",
        "163": "Sempre misteriosa! Provação das cordas e provação do amor!",
        "164": "Acendam a chama da sabedoria! Wiper, o guerreiro.",
        "165": "Terra flutuante de ouro, Jaya! Para o Santuário de deus!",
        "166": "O festival da véspera do ouro! A estima pelo \"Vearth\"!",
        "167": "Aparece o Deus Enel. luta pela sobrevivência.",
        "168": "A Anaconda ataca! O jogo de sobrevivência começa!",
        "169": "A Ameaça de vida rejeitada! A determinação de Wiper, o demônio da guerra.",
        "170": "A feroz batalha celeste! Pirata Zoro vs guerreiro Braham.",
        "171": "Enorme bazuca de fogo! Luffy vs demônio da guerra Wiper.",
        "172": "A provação do pântano! Chopper vs sacerdote Gedatsu!",
        "173": "A habilidade invencível! O verdadeiro caráter de Enel revelado.",
        "174": "A cidade desaparecida! As magní&#173;ficas ruí&#173;nas de Shandora!",
        "175": "Sobrevivência 0%! Chopper vs sacerdote Ohm.",
        "176": "Escale o Giante Jack! Luta nas ruínas superiores.",
        "177": "O teste final da provação do ferro! Luta mortal na gaiola de espinhos brancos!",
        "178": "Ataque da lâmina jorrante! Zoro vs sacerdote Ohm!",
        "179": "O desmoronamento das ruínas superiores! O quinteto final!",
        "180": "Batalha nas ruínas superiores! Desejo de Deus Enel!",
        "181": "Ambição a Fairy Vearth. A arca, Maxim!",
        "182": "Confronto final! Pirata Luffy vs Deus Enel!",
        "183": "Maxim se emerge! O começo de Deathpiea!",
        "184": "Luffy cai! O julgamento de deus e o desejo de Nami!",
        "185": "Os dois acordaram! A linha de frente do amor ardente!",
        "186": "Capricho com a destruição. A iminente ruína da ilha do céu!",
        "187": "Guiado pelo badalar do sino! O conto do grande guerreiro e o explorador.",
        "188": "Liberados da desgraça! As lágrimas do grande guerreiro!",
        "189": "Amigos para sempre! O sino do juramento que badala pelo mar!",
        "190": "A destruição de Angel Island! Terror do raigou descendente!",
        "191": "Derrubem Giant Jack! A última esperança de fuga.",
        "192": "Milagre na terra de deus. A canção de amor ouvida pelos anjos.",
        "193": "A guerra chega a um fim! Badalando longe e amplamente a fantasia orgulhosa.",
        "194": "Eu vim aqui! O laço dos poneglyphs.",
        "195": "O mar azul finalmente! Uma trama final com emoção.",
        "196": "Estado de emergência proclamado! Infiltração do notório navio pirata!",
        "197": "Sanji o cozinheiro! Demonstração do seu real valor no refeitório da Marinha!",
        "198": "Zoro é capturado. Operação urgente de Chopper!",
        "199": "A Busca dos marines se aproximando! O segundo a ser capturado!",
        "200": "O Grande plano de fuga! A determinação de Luffy e Sanji!",
        "201": "A batalha na ponte! O esquadrão das almas ardentes ataca!",
        "202": "O resgate do Going Merry! Atravessando as linhas inimigas!",
        "203": "O navio pirata desaparece! Batalha na fortaleza, round 2!",
        "204": "A operação para recuperar o ouro e a operação para recuperar o waver!",
        "205": "A estratégia secreta de vitória de Jonathan. O plano do rodeio pirata!",
        "206": "Adeus, fortaleza! A escapada final!",
        "207": "Long Ring Long Land. A grande corrida.",
        "208": "Bando de piratas do Foxy e Davy Back!",
        "209": "Primeiro round na Donut race!",
        "210": "Raposa prateada Foxy. Violenta sabotagem ofensiva!",
        "211": "O segundo evento. Batendo no Groggy Ring.",
        "212": "Cartas Vermelhas Velozes Groggy Ring.",
        "213": "O terceiro evento. Voltas e voltas no Roller Racer.",
        "214": "O clímax da corrida. Entrando no round final.",
        "215": "O ardente zumbido das bolas! É a dodgeball dos piratas!",
        "216": "Uma batalha no desfiladeiro! A queda de Daruma-san!",
        "217": "Confronto de capitães A última batalha: combate.",
        "218": "Válvula de raios Noro Noro vs o invulnerável Afro-Luffy!",
        "219": "Heroica luta em combate feroz o decisivo Final.",
        "220": "Você perdeu sua memória? Foi removida? Quem são vocês?",
        "221": "O garoto misterioso da flauta e a dedução de Nico Robin.",
        "222": "Recuperação das memórias. O desembarque na ilha dos piratas.",
        "223": "Zoro afia seus caninos. Uma luta com um animal selvagem!",
        "224": "O contra ataque final do ladrão de memórias demonstra sua verdadeira natureza.",
        "225": "O homem de incrível orgulho Foxy, a raposa prateada!",
        "226": "O Invencível poder está perto! Um homem muito perigoso!",
        "227": "Almirante de base da Marinha, Aokiji! A ameaça mais poderosa.",
        "228": "O embate entre gelo e borracha! Luffy vs Aokiji.",
        "229": "O trem do oceano funcionando, a cidade das águas Water 7.",
        "230": "A aventura nas cidade das águas! Objetivo estaleiro gigante!",
        "231": "A gangue de Franky e Iceburg.",
        "232": "Companhia Galley-La! A magnífica Doca 1.",
        "233": "Sequestro Pirata! O navio pirata só espera a morte.",
        "234": "Salvando um amigo! A incursão na Franky House.",
        "235": "A grande luta a luz da lua! O navio pirata treme em tristeza!",
        "236": "Luffy vs Usopp! O espírito dos homens colidindo.",
        "237": "A cidade da água está agitada! Iceburg-san foi atingido!",
        "238": "Homem borracha vs cyborg da respiração de fogo.",
        "239": "O criminosos são os Piratas do chapéu de palha? Os guarda-costas de Water 7.",
        "240": "Despedida eterna? A mulher que aguenta a escuridão, Nico Robin.",
        "241": "Pegue Robin! Decisão da tripulação de Chapéu de palha.",
        "242": "O sinal é a explosão! A CP9 começa a se mover.",
        "243": "O CP9 desmascarado! Seu chocante rosto.",
        "244": "O laço escondido! Iceburg e Franky!",
        "245": "Volte Robin! Confronto contra a CP9.",
        "246": "Aniquilação dos Chapéu de palha? O terror do modelo leopardo!",
        "247": "O homem amado pelo navio! As lágrimas de Usopp!",
        "248": "O passado de Franky! O dia que o Trem do oceano funcionou.",
        "249": "Conspiração de Spandam! O dia em que o Trem do oceano balançou.",
        "250": "O fim do lendário homem! O dia que o Trem do oceano chorou.",
        "251": "A verdade por trás da traição! O sorriso sincero de Robin.",
        "252": "O apito que separa os companheiros! O Trem do oceano corre.",
        "253": "Acusação do Sanji! A batalha do Trem do oceano na tempestade!",
        "254": "O grito da alma de Nami! Ressurreição de Luffy, o Chapéu de palha.",
        "255": "Outro Trem do oceano? A saída de Rocketman.",
        "256": "O resgate de nossos amigos! Os punhos que carregam a destruição para os inimigos.",
        "257": "Cortando pela onda! Zoro e Luffy, o combo supremo.",
        "258": "Um homem misterioso aparece?! O nome dele é Sogeking!",
        "259": "A batalha dos cozinheiros! Sanji vs Lamen kenpo.",
        "260": "Duelo no telhado! Franky vs Nero.",
        "261": "Impacto demônio cortador Zoro vs cortador de navio T-bone.",
        "262": "Robin resiste! O plano esperto de Sogeking!",
        "263": "A ilha do julgamento! A vista de Enies Lobby!",
        "264": "Iniciar plano de invasão! O avanço do grupo do Chapéu de palha!",
        "265": "Investida de Luffy! Grande decisiva batalha na ilha judiciária!",
        "266": "Batalha com os gigantes! Abram a segunda porta!",
        "267": "Os meios de escapar são liberados! Voa através do céu, Rocketman!",
        "268": "Alcancem Luffy! A repentina guerra dos Chapéu de palha.",
        "269": "Robin é traída! As expectativas do governo mundial.",
        "270": "Devolva-nos Robin! Luffy vs Blueno.",
        "271": "Não parem! Levantem o sinal de um contra-ataque!",
        "272": "Luffy à vista! Reunião na estação do tribunal!",
        "273": "Tudo para proteger meus nakama! O gear second em movimento!",
        "274": "Responda-nos Robin! O clamor da equipe dos Chapéu de palha!",
        "275": "O passado de Robin! A garota que foi chamada de demônio!",
        "276": "A mãe e a filha predestinadas! O nome da mãe é Olivia.",
        "277": "A tragédia de Ohara! O terror do Buster Call.",
        "278": "Diga que você quer viver! Nós somos companheiros!",
        "279": "Pulem no precipício! Os sentimentos de Luffy!",
        "280": "O jeito de viver de um homem! As técnicas de Zoro, e o sonho de Usopp.",
        "281": "Lágrimas que criaram um laço entre Amigos! O mapa-múndi de Nami.",
        "282": "Uma despedida fortalece um homem! Sanji e Chopper.",
        "283": "Tudo por um Amigo! A escuridão de Robin!",
        "284": "Eu não vou entregar as plantas! A decisão de Franky!",
        "285": "Peguem as cinco chaves! Chapéus de palha contra CP9!",
        "286": "O poder da Akuma no Mi! Kaku e Jabura se transformam.",
        "287": "Eu não chuto mesmo que eu morra! O código de honra de Sanji!",
        "288": "O erro de fukurou! A minha cola é a água da vida!",
        "289": "A nova técnica do Zoro explode! O nome da katana é Sogeking?",
        "290": "Fora de controle! Rumble proibido de Chopper!",
        "291": "O Retorno de Luffy Oyabun! Um Sonho ou bilhete premiado. de Natal para TV)",
        "292": "A grande competição de mochi do castelo. O plano do Nariz vermelho. de Ano Novo para TV)",
        "293": "Kalifa a mestra das bolhas! Nami se aproxima da armadilha de sabão!",
        "294": "O escoar de más notícias! O Buster Call é acionado.",
        "295": "5 Namis? O contra ataque com miragens!",
        "296": "A determinação de Nami! Atirem no Chopper furioso!",
        "297": "Apresentando o caçador Sanji? O lamento do lobo mentiroso!",
        "298": "O chute Flamejante! O banquete de chutes de Sanji!",
        "299": "O furioso ataque do saque de espadas! Zoro vs Kaku: O incrível duelo cortante!",
        "300": "Zoro, o deus da fúria! A reencarnação de Ashura mostrada por seu espírito!",
        "301": "A surpresa de Spandam! O herói que se levanta na Torre da justiça!",
        "302": "Robin é salva! Luffy vs Lucci: A batalha decisiva!",
        "303": "O criminoso é Luffy Oyabun? A busca pela grande sakura perdida! de TV)",
        "304": "Se eu não vencer, não posso proteger ninguém! O gear third é ativado!",
        "305": "O terrível passado! A justiça negra e Rob Lucci!",
        "306": "Uma misteriosa sereia aparece? No limiar da perda de consciência!",
        "307": "A ilha que afunda sob fogo! O grito de arrependimento de Franky!",
        "308": "Esperem por Luffy! Confronto mortal na ponte da hesitação!",
        "309": "Sentimentos mostrados com os punhos! O poder máximo da metralhadora de Luffy!",
        "310": "Um amigo que vem do mar! O laço mais forte do bando do Chapéu de palha.",
        "311": "A grande fuga! O caminho da vitória é dos piratas!",
        "312": "Obrigado Merry! Neve no mar da separação!",
        "313": "Nada de descanso! O Vice-Almirante que tem o punho do amor!",
        "314": "A mais forte linhagem sanguínea? O pai de Luffy é revelado!",
        "315": "O Novo mundo! A localização da Grand line.",
        "316": "Shanks em ação! Uma cerimônia à era da fúria.",
        "317": "A garota que procura pelo yagara! A grande investigação na cidade das águas!",
        "318": "Uma mãe tem que ser forte! Zoro, a empregada atrapalhada.",
        "319": "O choque de Sanji! Um velho misterioso e muita culinária.",
        "320": "Finalmente todos são procurados! O bando de mais de 600 milhões!",
        "321": "O rei das feras que cruzará o oceano! O navio dos sonhos está pronto!",
        "322": "Adeus meus amados seguidores! A partida de Franky!",
        "323": "A partida da cidade das águas! A distinção do homem Usopp!",
        "324": "As recompensas mundiais! Os cidadãos dançam enquanto o navio veleja!",
        "325": "A mais terrível das Akuma no Mi! A escuridão de Barba Negra ataca Ace!",
        "326": "Um grupo estranho de piratas! Sunny e uma perigosa tática!",
        "327": "Sunny em emergência! Liguem o mecanismo secreto de velocidade.",
        "328": "O sonho do Novo mundo Afunda! O pirata desapontado, Puzzle.",
        "329": "O ataque do assassino! A grande batalha sobre o gelo começa.",
        "330": "A árdua batalha do bando do Chapéu de palha! Uma alma de pirata arriscando tudo pela bandeira!",
        "331": "A todo vapor! Poder magnético dos gêmeos!",
        "332": "A mansão do caos! Nervoso Don e o bando aprisionado!",
        "333": "A fênix renasce! O sonho de um amigo jurado na bandeira pirata!",
        "334": "A quente batalha decisiva! Luffy vs Ardente Don!",
        "335": "Esperando no Novo mundo! Adeus aos corajosos piratas!",
        "336": "A partida de Chopperman! Proteja a estação de tv na costa!",
        "337": "Aventura no mar demoníaco! O misterioso esqueleto flutuando na neblina!",
        "338": "O prazer em conhecer pessoas! Os verdadeiros sentimentos do esqueleto cavalheiro!",
        "339": "Um fenômeno após o outro! Desembarque em Thriller Bark!",
        "340": "O homem chamado de gênio! Hogback aparece!",
        "341": "Nami com grandes problemas! A mansão zumbi e o homem invisível!",
        "342": "O enigma dos zumbis! Hogback e o laboratório de pesadelos.",
        "343": "Seu nome é Moria! A armadilha do grande pirata que rouba sombras!",
        "344": "Festa da música dos zumbis! O sino da noite chuvosa e o som das trevas!",
        "345": "Muitos animais! O jardim maravilhoso de perona!",
        "346": "A tripulação do chapéu de palha desaparecendo! O misterioso cavaleiro aparece!",
        "347": "O último cavalheiro! O zumbi traidor que protege Nami.",
        "348": "Vindo do céu! Aquele homem é o espadachim hanauta!",
        "349": "Luffy em apuros! A maior das sombras é roubada!",
        "350": "O guerreiro chamado de demônio! A hora da ressurreição de Oz.",
        "351": "Acordando após 500 anos! Oz revive!",
        "352": "Convicção forte o suficiente para implorar pela vida de alguém! Brooke protege seu afro.",
        "353": "A promessa de um Homem não morre! Um amigo esperando em um céu distante.",
        "354": "Nós vamos no reencontrar! Brooke e o cabo da promessa!",
        "355": "Comida, Nami e sombras! O contra-ataque raivoso de Luffy.",
        "356": "Usopp o mais forte? Deixe os negativos para mim!",
        "357": "Morte instantânea dos generais zumbis! Oz com sentimento de aventura!",
        "358": "O cavaleiro das chamas, Sanji! Acabando com a falsa cerimônia.",
        "359": "Um assunto invisível? O sonho roubado de sanji.",
        "360": "Um herói salvador! O oponente é a princesa invencível.",
        "361": "O pior pesadelo de Perona! O U de Uso é o U de Usopp.",
        "362": "Cortes dançantes no telhado! Final - Zoro vs Ryuuma.",
        "363": "Chopper enfurecido! As práticas médicas demoníacas de Hogback.",
        "364": "Oz ruge! Apareça, bando dos Chapéus de palha!",
        "365": "O inimigo é Luffy! O zumbi mais poderoso vs a tripulação dos Chapéus de Palha.",
        "366": "Derrote Absalom! O relâmpago da amizade de Nami!",
        "367": "Cai um! Transformação dos Chapéus de palha no Assassino certo?",
        "368": "Invasão silenciosa! O misterioso invasor, Kuma, o tirano.",
        "369": "Oz e Moria! O combo supremo de poder e inteligência!",
        "370": "Uma estratégia maluca para virar a mesa! A criação de Nightmare Luffy!",
        "371": "A tripulação dos Chapéus de palha aniquilada! As habilidades da Kage Kage no Mi a todo vapor!",
        "372": "A batalha pela superioridade começa! Luffy vs Luffy.",
        "373": "Chega a conclusão! Dando o golpe final!",
        "374": "Corpos desaparecendo! O sol da manhã brilha na ilha dos pesadelos!",
        "375": "A crise sem fim! Ordens para eliminar a tripulação dos Chapéus de palha!",
        "376": "As habilidades Nikyu Nikyu de Kuma que rejeitam tudo!",
        "377": "A dor dos meus nakamas é a minha dor. Zoro luta preparado para morrer.",
        "378": "A promessa naquele dia distante. A canção dos piratas e uma pequena baleia.",
        "379": "O passado de Brooke. Adeus triste a tripulação alegre.",
        "380": "Binkusu no sake. A canção que conecta o passado e o presente.",
        "381": "Um novo companheiro! O músico hanauta no Brooke.",
        "382": "A ameaça Noro Noro. O retorno de Foxy, a raposa prateada.",
        "383": "A grande caçada ao tesouro! Colapso! A Spa island!",
        "384": "O duro esforço de Brook. O difícil caminho para se tornar um verdadeiro companheiro.",
        "385": "O meio da Grand line. Chegamos! A Red line.",
        "386": "Um rancor contra os Chapéus de palha. A chegada de Duval da máscara de ferro.",
        "387": "Reencontro predestinado! Salvem o tritão aprisionado.",
        "388": "Tragédia! A verdade de Duval desmascarada.",
        "389": "Explosão! A arma super secreta do Sunny, o canhão gaon.",
        "390": "Desembarcando para chegar à Ilha dos tritões. O arquipélago Sabaody.",
        "391": "Tirania! Os governantes de Sabaody: Os Tenryuubitos.",
        "392": "Novos rivais se reúnem! Os 11 supernovas.",
        "393": "O alvo é Caimie! Os sequestradores se aproximam.",
        "394": "Salvem a Caimie. A lembrança sombria que ficou no arquipélago.",
        "395": "Tempo Limite. Começa o leilão humano.",
        "396": "Soco explosivo! Acabem com o leilão.",
        "397": "Grande pânico! Batalha mortal no leilão.",
        "398": "O Almirante Kizaru se move! O arquipélago Sabaody em caos.",
        "399": "Superando o cerco! Marinha vs três capitães.",
        "400": "Roger e Rayleigh – O Rei dos piratas e seu braço direito.",
        "401": "Impossível de se desviar? O chute na velocidade da luz do Almirante Kizaru.",
        "402": "Devastador! A arma de combate da Marinha pacifista.",
        "403": "Um inimigo ainda mais poderoso se aproxima! Aquele que empunha machados Sentoumaru.",
        "404": "Violento ataque do Almirante Kizaru – A situação desesperadora do bando do Chapéu de palha.",
        "405": "O fim da tripulação – O último dia do bando do Chapéu de palha.",
        "406": "O retorno de Luffy-Oyabun.",
        "407": "Destruam! A armadilha da organização Thriller!",
        "408": "Desembarque! Ilha proibida para homens, Amazon Lily!",
        "409": "Aventura na ilha das mulheres! Depressa, ao encontro dos companheiros.",
        "410": "Todos estão bêbados de amor! A imperatriz pirata, Boa Hancock.",
        "411": "O segredo escondido em suas costas. Luffy encontra a princesa serpente.",
        "412": "Julgamento impiedoso! Margaret transformada em pedra!",
        "413": "O duro desafio de Luffy! O poderoso haki das irmãs cobras!",
        "414": "Batalha com habilidades no poder máximo! Gomu Gomu vs Hebi Hebi.",
        "415": "A confissão de Hancock. O terrível passado das irmãs.",
        "416": "Resgatem Ace! O novo destino é a grande prisão.",
        "417": "O amor é um furacão! Hancock apaixonada.",
        "418": "O Paradeiro da tripulação. Ciência do clima e a ilha mecânica.",
        "419": "O Paradeiro da tripulação. A ilha dos pássaros gigantes e o paraíso.",
        "420": "O Paradeiro da tripulação. A construção da ponte e as plantas assassinas.",
        "421": "O Paradeiro da tripulação. A princesa negativa e o rei dos demônios.",
        "422": "Uma invasão de risco de vida! Infiltrando-se na prisão submarina, Impel Down.",
        "423": "Reunião no inferno! O usuário da Bara Bara no Mi!",
        "424": "Ultrapasse! Inferno escarlate. O pomposo plano de Buggy.",
        "425": "O homem mais forte da prisão. O homem veneno, Magellan.",
        "426": "As ambições do leão dourado começam a se mover.",
        "427": "A pequena East Blue é o alvo.",
        "428": "O poderoso ataque dos piratas Amigo!",
        "429": "Luffy vs Largo. É hora da batalha!",
        "430": "Um Shichibukai dentro da prisão! Jinbei, o cavaleiro dos mares.",
        "431": "A armadilha do chefe da guarda, Saldeath. Level 3, o inferno da fome.",
        "432": "O cisne é libertado! Encontro! Bon Clay.",
        "433": "O diretor Magellan começa a se mover. Pronta! A armadilha para o Chapéu de palha.",
        "434": "Todas as forças reunidas! Batalha no level 4, o inferno escaldante.",
        "435": "O poderoso Magellan! Bon Clay acovarda-se.",
        "436": "Hora da luta! O desesperado ataque final de Luffy!",
        "437": "Por que ele é meu amigo. Bon Clay vai ao resgate de vida ou morte.",
        "438": "Um paraíso no inferno! Impel Down nível 5.5.",
        "439": "O tratamento de Luffy começa. A habilidade milagrosa de Iva-san!",
        "440": "Acredite em milagres! O choro do coração de Bon Clay.",
        "441": "O retorno de Luffy! Iva-san inicia o plano de fuga.",
        "442": "A escolta de Ace. Batalha no level 6, o andar mais inferior!",
        "443": "O time mais poderoso é formado. Estremeça! Impel Down.",
        "444": "Ainda mais caos. Ai vem Teach, o Barba Negra.",
        "445": "O perigoso encontro! Barba Negra e Shiryu da chuva.",
        "446": "Nenhum preço é alto demais! Hannyabal está sério.",
        "447": "O jet pistol da raiva. Luffy vs Barba Negra.",
        "448": "Pare o Magellan! A técnica de Iva-san explode.",
        "449": "O esperto movimento de Magellan! Um plano de fuga por água abaixo.",
        "450": "A equipe de fuga com problemas. Ataque proibido, Venom Demom.",
        "451": "Venha, milagre final! Ultrapassem os portões da justiça.",
        "452": "Indo resgatar o Ace dos punhos de fogo.",
        "453": "O paradeiro dos companheiros. Relatório de Weatheria e os animais ciborgues.",
        "454": "O paradeiro dos companheiros. Um pintinho gigante e um duelo cor de rosa.",
        "455": "O paradeiro dos companheiros. Revolucionários e a armadilha da floresta devoradora.",
        "456": "O Paradeiro dos companheiros. Um enorme túmulo e o débito das calcinhas.",
        "457": "Retrospectiva especial antes de Marineford. O juramento dos irmãos.",
        "458": "Retrospectiva especial antes de Marineford. Reunião! Os três Almirantes.",
        "459": "Contagem regressiva para a batalha! A formação mais forte da Marinha em posição!",
        "460": "Aparição! O bando do Barba Branca! Uma vasta frota aparece!",
        "461": "O início da guerra! O passado de Ace e Barba Branca.",
        "462": "O poder da Gura Gura no Mi. O poder que pode destruir o mundo!",
        "463": "Um inferno que consome tudo! O poder do Almirante Akainu!",
        "464": "O descendente do demônio! Em frente, pequeno Oz Jr!",
        "465": "O vencedor é a justiça. Iniciar! A estratégia de Sengoku!",
        "466": "A chegada da equipe Chapéu de palha. A tensão aumenta no campo de batalha!",
        "467": "Te salvarei mesmo que eu morra. O início da batalha de Luffy vs Marinha!",
        "468": "Duras batalhas. Usuários de Akuma no Mi vs usuários de Akuma no Mi!",
        "469": "O ataque de raiva de Iva-san. A transformação de Kuma.",
        "470": "Mestre espadachim Mihawk – O corte da espada negra em Luffy.",
        "471": "Estratégia de aniquilação começa! O poder dos pacifistas.",
        "472": "O Plano de Akainu! Barba Branca é encurralado!",
        "473": "Sem saída! – Os piratas do Barba Branca em crise!",
        "474": "A Ordem de execução é dada! Invadam a muralha de ferro!",
        "475": "Chegando aos momentos finais! O trunfo de Barba Branca!",
        "476": "Luffy no fim de suas energias! Batalha de grande escala na praça Oris!",
        "477": "O poder que reduz a vida – A volta dos hormônios de tensão!",
        "478": "Cumprindo a Promessa! Luffy e Coby se enfrentam!",
        "479": "Enfim o cadafalso! O caminho até Ace se abre!",
        "480": "Caminhos diferentes. Luffy vs Garp!",
        "481": "Ace é resgatado! A última ordem de Barba Branca!",
        "482": "O poder que pode queimar até mesmo o fogo. A perseguição impiedosa de Akainu!",
        "483": "Procurando por respostas! O Punho de fogo morre no campo de batalha!",
        "484": "Destruição do quartel general da Marinha! A fúria silenciosa de Barba Branca!",
        "485": "Acertando as contas! Barba Branca vs os Piratas do Barba Negra! O grande pirata, Edward Newgate!",
        "486": "O show começa. A trama de Barba Negra é revelada!",
        "487": "O insaciável Akainu! Punhos de lava agridem Luffy!",
        "488": "Um grito desesperado. Momentos de coragem que irão mudar o destino!",
        "489": "A chegada de Shanks! A guerra dos melhores enfim termina!",
        "490": "O início da “Nova Era”! Poderosos líderes se enfrentam!",
        "491": "Chegando à ilha das mulheres!A cruel realidade tortura Luffy!",
        "492": "A dupla mais forte! O grande esforço de Luffy e Toriko! de TV)",
        "493": "Luffy e Ace, a história dos irmãos!",
        "494": "Sabo aparece! O garoto do Terminal cinza.",
        "495": "Eu não fugirei! O resgate suicida de Ace.",
        "496": "Algum dia iremos! Os copos de juramento dos três garotos!",
        "497": "Família Dadan é separada? Revelado! O esconderijo secreto.",
        "498": "Luffy, o aprendiz? O homem que lutou contra o Rei dos Piratas!",
        "499": "A batalha contra o grande tigre! Quem vai se tornar o capitão?",
        "500": "Liberdade roubada! A armadilha dos nobres se aproxima dos três irmãos.",
        "501": "As chamas estão acesas – O Terminal cinza está em crise.",
        "502": "Onde está a liberdade? A triste partida do garoto.",
        "503": "Conto com você! Uma carta do irmão!",
        "504": "Para cumprir a promessa. Partidas separadas!",
        "505": "Eu quero vê-los! O grito cheio de lágrimas de Luffy.",
        "506": "O bando do Chapéu de palha chocado! A má notícia se espalha!",
        "507": "Reunido com o Rei das trevas! A hora da decisão de Luffy.",
        "508": "Ao nosso capitão! A fuga da Ilha do céu e o incidente na Ilha de Inverno.",
        "509": "Natureza! O grande espadachim Mihawk! Zoro, o guerreiro invencível!",
        "510": "O sofrimento do Sanji – A rainha retorna para o seu reino.",
        "511": "Improvável retorno! Luffy vai ao quartel general da Marinha!",
        "512": "Reportem aos companheiros – A grande notícia se espalha",
        "513": "Os piratas começam a se mover! O assombroso Novo mundo!",
        "514": "Sobrevivendo ao inferno – O duelo de homem do Sanji.",
        "515": "Eu serei ainda mais forte! O juramento de Zoro ao capitão!",
        "516": "Luffy começa o treinamento - Em dois anos vejo vocês no lugar prometido!",
        "517": "O novo capítulo começa. Reúnam-se, bando do Chapéu de palha!",
        "518": "Uma situação explosiva! Luffy vs falso Luffy!",
        "519": "Marinha entra em ação! O alvo é o bando do Chapéu de palha!",
        "520": "Grandes armas montadas! A ameaça dos falsos Chapéus de palha!",
        "521": "Começa a batalha! Mostrem o resultado do treinamento!",
        "522": "Todos reunidos! Luffy zarpa para o Novo mundo!",
        "523": "Verdade chocante! O homem que protegeu o Sunny!",
        "524": "Confusão abaixo do mar! O demônio dos oceanos aparece!",
        "525": "Perdidos no fundo do mar! O bando do Chapéu de palha se separa!",
        "526": "A erupção do vulcão submerso! Levados para a ilha dos Tritões!",
        "527": "Desembarque na ilha dos Tritões! As amáveis sereias!",
        "528": "Explosão de excitação! A declaração da crise de Sanji.",
        "529": "Destruição da ilha dos Tritões? A previsão de Shirley.",
        "530": "O rei da ilha dos Tritões – O deus do mar, Netuno.",
        "531": "Palácio de Ryuugu! Conduzindo o tubarão ajudado!",
        "532": "O bebê-chorão covarde! A torre da princesa sereia!",
        "533": "Situação de emergência! O palácio Ryuugu é atacado!",
        "534": "Palácio Ryuugu em caos! O sequestro de Shirahoshi.",
        "535": "A Invasão do Hody – Começa o plano de vingança.",
        "536": "A luta no palácio Ryuugu! Zoro vs Hody.",
        "537": "Proteja a Shirahoshi! A perseguição de Decken.",
        "538": "O bando derrotado? Hody controla o palácio Ryugu.",
        "539": "Relembrando a fatalidade! Nami e os piratas Tritões.",
        "540": "O herói libertador de escravos – O aventureiro Tiger.",
        "541": "Kizaru aparece! Tiger segue para uma armadilha!",
        "542": "O time está formado! Salvem o Chopper. de TV)",
        "543": "O fim do herói – A verdade chocante de Tiger.",
        "544": "A separação dos piratas – Jinbe vs Arlong.",
        "545": "A ilha dos Tritões treme! O naufrágio do Tenryuubito.",
        "546": "Uma tragédia inesperada! A bala assassina que bloqueia o futuro.",
        "547": "De volta ao presente! Hody começa a se mover.",
        "548": "Abalo no reino Ryugu – A ordem de execução para Netuno.",
        "549": "Diferenças Inesperadas! Luffy vs Jinbe.",
        "550": "A transformação de Hody. O verdadeiro poder da droga maligna.",
        "551": "A batalha decisiva começa - A praça Gyoncorde!",
        "552": "Confissão chocante - A verdade sobre o assassinato da otohime.",
        "553": "As lágrimas de Shirahoshi! Luffy entra em cena.",
        "554": "O grande confronto! O bando do Chapéu de palha vs 100 mil inimigos.",
        "555": "Movimentos explosivos! A investida de Zoro e Sanji!",
        "556": "Primeira exibição! As armas secretas do Sunny-go.",
        "557": "O pirata de ferro! A aparição do Franky shogun.",
        "558": "A Noah está chegando! A crise da destruição da ilha dos Tritões!",
        "559": "Depressa, Luffy! A situação desesperadora da Shirahoshi.",
        "560": "Começa o combate! Luffy vs Hody!",
        "561": "O grande tumulto! O bando vs os novos piratas tritões!",
        "562": "Luffy derrotado?! A hora da vingança do Hody.",
        "563": "A realidade chocante! A verdadeira identidade do Hody.",
        "564": "Para o Zero! O desejo extremo de Luffy!",
        "565": "O golpe de corpo inteiro de Luffy! A explosão do red hawk!",
        "566": "Finalmente o acerto de contas! A batalha final contra Hody.",
        "567": "Pare Noah! O elephant gatling decisivo!",
        "568": "Para o futuro! O Caminho que leva ao Sol.",
        "569": "Segredo revelado - A verdade sobre as armas antigas.",
        "570": "A tripulação é surpreendida! O novo Almirante da Frota da Marinha!",
        "571": "Eu amo doces! A Yonkou Big Mom!",
        "572": "Perspectivas sombrias! Uma armadilha que os espera no Novo mundo.",
        "573": "Finalmente definindo a vela! Adeus, Ilha dos Tritões!",
        "574": "Para o Novo mundo! Em direção ao mais forte mar!",
        "575": "A ambição de Z. Lily, a pequena gigante!",
        "576": "A ambição de Z. Aparece o mais Forte e misterioso exército!",
        "577": "A ambição de Z. Uma grande estratégia de fuga desesperada!",
        "578": "A ambição de Z. Luffy vs Shuzo!",
        "579": "Punk Hazard, a ilha ardente!",
        "580": "Uma batalha no calor! Luffy contra o dragão gigante!",
        "581": "O bando confuso! Aparece o chocante samurai decapitado!",
        "582": "Choque! O segredo da ilha é finalmente revelado!",
        "583": "Salvem as crianças! O bando começa a lutar!",
        "584": "Um duelo de esgrima – Brook vs o torso do samurai misterioso.",
        "585": "Shichibukai! Trafalgar Law.",
        "586": "Um grande perigo! Luffy afunda no lago glacial!",
        "587": "Choque! Law vs o Vice Almirante Smoker!",
        "588": "Primeiro encontro em dois anos! Luffy e Law.",
        "589": "O pior do mundo – Caesar, o cientista assustador.",
        "590": "A mais forte colaboração da história vs o glutão do mar. (Crossover especial de Dragon Ball, One Piece e Toriko)",
        "591": "A raiva de Chopper! O terrível experimento do mestre.",
        "592": "A aniquilação do bando! O ataque dos lendários assassinos!",
        "593": "Salvem a Nami! A batalha de Luffy na montanha de neve!",
        "594": "Formação! A Aliança Pirata: Luffy-Law!",
        "595": "Capturem o mestre! Começa a operação da aliança pirata!",
        "596": "A Beira da aniquilação! Um monstro mortal que vem do céu!",
        "597": "Grande batalha feroz! A verdadeira habilidade de Caesar é revelada!",
        "598": "O samurai que corta o fogo! Kinnemon, raposa de fogo!",
        "599": "Choque! A identidade de Vergo, o homem misterioso!",
        "600": "Protejam as crianças! O alcance da malévola mão do mestre!",
        "601": "Tremor no Novo mundo! O terrível experimento de Caesar!",
        "602": "A arma mais destruidora da história! Shinokuni!",
        "603": "Começa o contra-ataque! A grande fuga de Luffy e Law!",
        "604": "Cheguem ao Prédio-R! O grande avanço da aliança pirata!",
        "605": "As lágrimas de Tashigi! A estratégia de avanço suicida do G5!",
        "606": "A traição do vice-almirante! O Demônio do bambu, Vergo!",
        "607": "Feroz batalha incandescente! Luffy vs Caesar.",
        "608": "O mentor das sombras! Doflamingo se move!",
        "609": "Luffy congelado até a morte? A aterrorizante mulher neve, Monet!",
        "610": "Punhos colidem! A luta entre dois vice-almirantes!",
        "611": "Um pequeno dragão! Momonosuke aparece!",
        "612": "Uma batalha mortal na neve! Chapéus de palha vs a Mulher-neve.",
        "613": "Explosão de técnicas secretas! O impressionante ittoryu de Zoro!",
        "614": "Para proteger seus amigos! Mocha corre arriscando sua vida!",
        "615": "A amargura do Barba Marrom! O ataque furioso de Luffy!",
        "616": "Conclusão chocante! Smoker vs Vergo!",
        "617": "A derrota de Caesar! O poderoso grizzly magnum!",
        "618": "Ataque! Os assassinos de Dressrosa!",
        "619": "Grande tumulto! O invencível Franky Shogun!",
        "620": "Uma situação crítica! A grande explosão de Punk Hazard!",
        "621": "Capturem Caesar! A explosão do General Cannon!",
        "622": "Reencontro emocionante! Momonosuke e Kinemon!",
        "623": "Hora de dizer adeus! Partindo de Punk Hazard!",
        "624": "Extermínio do G-5! O ataque de Doflamingo!",
        "625": "Tensão! Aokiji vs Doflamingo!",
        "626": "Caesar desaparece! O ataque da aliança pirata!",
        "627": "Lyffy morre no mar? O colapso da aliança pirata!",
        "628": "Grande reviravolta! A ira do punho de ferro de Luffy!",
        "629": "Impacto! A grande notícia que abala o mundo!",
        "630": "Aventura! O país do amor e da paixão, Dressrosa!",
        "631": "Cheio de entusiasmo! Coliseu Corrida!",
        "632": "Paixão perigosa! A dançarina Violet!",
        "633": "O mais forte guerreiro sem nome! Lucy aparece!",
        "634": "635-636",
        "635": "Reunião do destino! Bellamy, a hiena!",
        "636": "Supernova! Bartolomeo, o caníbal!",
        "637": "Vários poderosos! O incandescente Bloco B!",
        "638": "Golpe fatal! O admirável soco do rei!",
        "639": "Investida dos peixes lutadores! Avancem pela ponte da morte!",
        "640": "Aventura! Green Bit, a ilha das fadas!",
        "641": "Mundo desconhecido! Reino Tontatta!",
        "642": "A estratégia do século! Doflamingo age!",
        "643": "Céu e terra estremecem! O verdadeiro poder do almirante Fujitora!",
        "644": "Um golpe furioso! Gigante vs Luffy!",
        "645": "A explosão do canhão destruidor! Lucy em perigo!",
        "646": "O pirata lendário! Don Chinjao!",
        "647": "Luz e trevas! A escuridão oculta de Dressrosa.",
        "648": "Avante! O herói lendário, Usoland!",
        "649": "O fim da dura batalha! Lucy vs Chinjao!",
        "650": "Luffy e a gladiadora predestinada Rebecca!",
        "651": "Vou te proteger até o fim! Rebecca e o soldado de brinquedo!",
        "652": "O último e mais sangrento! O início do Bloco D!",
        "653": "Batalha decisiva! Jora vs Chapéus de palha!",
        "654": "A espada linda! Cavendish do cavalo branco!",
        "655": "Grande impacto! Sanji vs Doflamingo!",
        "656": "A espada mortal de Rebecca! A dança das espadas de água!",
        "657": "O lutador mais perverso! Logan vs Rebecca!",
        "658": "Grande surpresa! Averdadeira identidade do soldade de brinquedo!",
        "659": "Um passado terrível! O segredo de Dressrosa!",
        "660": "Pesadelo! A trágica noite de Dressrosa!",
        "661": "Confronto entre Shichibukais! Law vs Doflamingo!",
        "662": "Dois grandes rivais se encontram! Chapéu de palha e o Demônio celestial!",
        "663": "Luffy surpreso! O homem que herdou a determinação de Ace!",
        "664": "Começa a Operação SOP! O ataque de Usoland!",
        "665": "Fortes emoções! Rebecca vs Suleiman!",
        "666": "O vencedor foi decidido? A conclusão chocante do Bloco D!",
        "667": "A decisão do almirante! Fujitora vs Doflamingo!",
        "668": "Começam as finais! O herói Diamante entra em cena!",
        "669": "O castelo que se move! O alto executivo Pica aparece!",
        "670": "A explosão da Garra do Dragão! O golpe ameaçador de Luffy!",
        "671": "Derrotem Sugar! O exército dos anões avança!",
        "672": "A última esperança! O segredo de nosso comandante!",
        "673": "O homem-ruptura! A grande explosão de Gladius!",
        "674": "O mentiroso! Usoland foge!",
        "675": "Encontro destinado! Kyros e o rei Riku!",
        "676": "A operação falha! A morte do herói Usoland?",
        "677": "A lenda está de volta! Kyros ataca com tudo!",
        "678": "O ataque dos punhos de fogo! O poder da Mera Mera no Mi retorna!",
        "679": "Entrando em cena! Chefe assessor exército revolucionário, Sabo!",
        "680": "A armadilha do demônio! O plano de extermínio de Dressrosa!",
        "681": "O homem de 500 milhões! O alvo é Usoland!",
        "682": "Abrindo caminho pelas forças inimigas! Luffy e Zoro começam o contra-ataque!",
        "683": "Estrondo de terra! A vinda do gigante Pica, o deus da destruição!",
        "684": "Uma frente poderosa se reúne! Luffy e um grupo de brutais guerreiros!",
        "685": "A grande ofensiva! O exército de Luffy vs Pica!",
        "686": "Uma confissão chocante! O nobre juramento de Law!",
        "687": "Grande colisão! Chefe assessor Sabo vs Almirante Fufitora!",
        "688": "Situação desesperadora! Luffy é pego em uma armadilha!",
        "689": "Grande fuga! O elephant gun da reviravolta de Luffy!",
        "690": "A frente de batalha unida! O avanço de Luffy para a vitória!",
        "691": "O segundo samurai! Kanjuro do chuvisco aparece!",
        "692": "Uma dura batalha contra Pica! O ataque mortal de Zoro!",
        "693": "A princesa dos anões! Prisioneira Mansherry!",
        "694": "Invencível! Um terrível exército de bonecos Quebra-nozes!",
        "695": "Arriscando a vida! Luffy é o trunfo da vitória!",
        "696": "Reencontro emocionante! Rebecca e Kyros!",
        "697": "Um tiro certeiro! O homem que salvará Dressrosa.",
        "698": "Explosão de raiva! O plano secreto de Luffy e Law!",
        "699": "Família nobre! A verdadeira identidade de Doflamingo!",
        "700": "O poder supremo! O segredo da Ope Ope no Mi!",
        "701": "Tristes memórias! Law, o garoto da Cidade Branca!",
        "702": "Tenryuubito! O passado tempestuoso de Doffy!",
        "703": "Um caminho duro! A jornada pela vida de Law e Corazon!",
        "704": "O tempo urge! Consiga a Ope Ope no Mi!",
        "705": "O momento da decisão! O sorriso de despedida de Corazon!",
        "706": "Avance, Law! A luta final do bondoso homem!",
        "707": "Pela liberdade! Law dispara o Injection Shot!",
        "708": "Uma batalha intensa! Law vs Doflamingo!",
        "709": "A batalha decisiva contra os oficiais! O grande orgulho de Hajrudin!",
        "710": "A batalha do amor! O novo líder Sai vs Baby 5!",
        "711": "O orgulho de um homem! O último ataque de Bellamy!",
        "712": "Vendaval tempestuoso! Hakuba vs Dellinger!",
        "713": "Bari Bari! A homenagem do punho divino ativado!",
        "714": "A princesa da cura! Salvem Mansherry!",
        "715": "O duelo entre homens! O réquiem do amor do Señor!",
        "716": "Poeira estelar da morte! A tempestade de ataques violentos de Diamante.",
        "717": "Trueno bastardo! O golpe de fúria de Kyros!",
        "718": "Se movendo pelo chão. A estratégia do ataque-surpresa do gigantesco Pica. 15/11/2015",
        "719": "Batalha final no ar. A explosão da nova técnica secreta mortal do Zoro!",
        "720": "Até mais! O golpe de adeus do Bellamy!",
        "721": "Law morre. O ataque violento de raiva de Luffy!",
        "722": "A lâmina da determinação! O contra-ataque da Gamma knife!",
        "723": "Colisão de haki! Luffy vs Doflamingo!",
        "724": "Impossível atacar. O segredo chocante de Trebol.",
        "725": "Explosão de raiva. Eu me responsabilizo por tudo.",
        "726": "Gear 4! O fenomenal Boundman!",
        "727": "O grande contra-ataque! O despertar de Doflamingo!",
        "728": "Luffy! O devastador leo bazooka!",
        "729": "A chama do Rei Dragão. Protejam a vide de Luffy.",
        "730": "Lágrimas milagrosas! A luta de Mansherry!",
        "731": "Enquanto estivermos vivos. Parem a gaiola da morte!",
        "732": "Vida ou morte. A contagem regressiva do destino.",
        "733": "Derrubando os céus. A fúrida do King Kong Gun de Luffy.",
        "734": "Para a liberdade! Alegre-se, Dressrosa!",
        "735": "Sem precedentes. A impactante decisão do almirante Fujitora!",
        "736": "Sacudindo o mundo. A pior geração avança.",
        "737": "O nascimento de uma lenda. A aventura do revolucionário Sabo!",
        "738": "O laço dos Irmãos. A história secreta do reencontro de Luffy e Sabo.",
        "739": "A criatura mais forte. O yonkou Kaidou, o Rei das feras.",
        "740": "Fujitora se move. O bando dos Chapéus de palha completamente cercado.",
        "741": "Estado de emergência. Rebecca é sequestrada.",
        "742": "Laços de pai e filha. Kyros e Rebecca.",
        "743": "A determinação de um homem. Luffy vs Fujitora cara a cara.",
        "744": "Sem saída. A perseguição implacável do almirante Fujitora.",
        "745": "Os seguidores dos copos de saquê. Está formada! A grande frota do Chapéu de palha!",
        "746": "A fúria incontrolável dos poderosos. Os monstros do Novo mundo.",
        "747": "A fortaleza prateada. A grande aventura de Luffy e Barto.",
        "748": "O labirinto subterrâneo. Luffy vs o homem-bonde.",
        "749": "A técnica de espadas ferve. Law e Zoro finalmente aparecem.",
        "750": "Situação desesperadora. A batalha escaldante de Luffy",
        "751": "O início da aventura. A chegada na ilha mística de Zou.",
        "752": "O novo shichibukai. O filho do lendário Barba Branca aparece.",
        "753": "A escalada suicida no elefante. Uma grande aventura nas costas do elefante gigante.",
        "754": "Começa o combate. Luffy vs tribo mink.",
        "755": "Garchu! Os chapéus de palha reunidos!",
        "756": "Começa o contra-ataque. As grandes táticas do bando do sobrancelha encaracolada!",
        "757": "A invasão ameaçadora. Jack dos piratas das fera.",
        "758": "O rei do dia. Duque Inuarashi aparece.",
        "759": "O rei da noite. Surge o Meste Nekomamushi.",
        "760": "A destruição da capital. O desembarque do bando do Sobrancelha Encaracolada.",
        "761": "Corrida contra o tempo. O laço da tribo Mink com o bando!",
        "762": "O delinquente volta para casa. Os assassinos da yonkou Big Mom.",
        "763": "A verdade por trás do desaparecimento. Sanji recebe um convite espantoso.",
        "764": "Caros amigos de merda. O recado de despedida do Sanji.",
        "765": "Vamos conhecer o mestre Nekomamushi.",
        "766": "A decisão de Luffy. A crise do afastamento do Sanji.",
        "767": "Situação extremamente perigosa. O cão, o gato e samurais!",
        "768": "O terceiro! O ninja Raizou da Névoa aparece.",
        "769": "A pedra vermelha! O guia para o One Piece.",
        "770": "O segredo do país de Wano. O clã Kouzuki e os poneglyphs.",
        "771": "A promessa de homens. Luffy e Kouzuki Momonosuke.",
        "772": "A jornada lendária. O cão, o gato e o Rei dos piratas.",
        "773": "O retorno do pesadelo. O ataque violento do indestrutível Jack.",
        "774": "A batalha pela defesa de Zou. Luffy e Zunisha!",
        "775": "Salvem o elefante gigante. O plano de resgate dos chapéus de palha!",
        "776": "Descendo do elefante. Zarpando para resgatar o Sanji!",
        "777": "Para o Conselho Mundial. Princesa Vivi e princesa Shirahoshi.",
        "779": "Kaidou retorna. A ameaça para a Pior Geração se aproxima!",
        "780": "A frente de batalha faminta! Luffy e os supernovas da marinha!",
        "781": "Os três implacáveis. A grande caçada aos chapéus de palha!",
        "782": "O punho do demônio. A luta final! Luffy vs Grant.",
        "783": "Sanji volta para casa. Rumo ao território da Big Mom!",
        "784": "0 e 4. Encontro inesperado! Germa 66.",
        "785": "A crise do veneno mortal. Luffy e Reiju!",
        "786": "Totto Land! A yonkou Big Mom aparece. -",
        "787": "A filha da yonkou. A noiva de Sanji, Purin.",
        "788": "O ataque titânico. O sofrimento de fome da mãe.",
        "789": "A capital em colapso? Big Mom e Jinbe.",
        "790": "O castelo da yonkou. A chegada na ilha Whole Cake.",
        "791": "Uma floresta de doces. Luffy vs Luffy?",
        "792": "Os assassinos da Mama. Luffy e o Bosque da Sedução!",
        "793": "A Nação do Mar. O rei da Germa: Judge.",
        "794": "Confronto de pai e filho. Judge vs Sanji!",
        "795": "Uma ambição gigantesca. Big Mom e Caesar.",
        "796": "O País das Almas. A temível habilidade da mãe!",
        "797": "O grande comandante. Um dos três generais, Cracker, aparece.",
        "798": "O inimigo de 800 milhões. Luffy vs Cracker dos Mil Braços.",
        "799": "Confronto de forças máximas. Gear 4 vs habilida da Bisu Bisu.",
        "800": "1 e 2. Reunião. A família Vinsmoke!",
        "801": "O salvador de uma vida. Sanji e Chef Zeff.",
        "802": "A fúria de Sanji. O segredo da Germa 66.",
        "803": "Abandonando o passado. Vinsmoke Sanji.",
        "804": "Para o East Blue. A decisão da partida de Sanji.",
        "805": "A batalha de limites. Luffy e os biscoitos infinitos.",
        "806": "O poder do estômago cheio. O novo Gear 4: Tankman!",
        "807": "Uma luta triste. Luffy vs Sanji. (Parte 1)",
        "809": "Uma tempestade de vingança. O ataque do Exército da Fúria!",
        "810": "O fim da aventura. Sanji escolhe a proposta de casamento. - 22/10",
        "811": "Vou esperá-lo aqui. Luffy vs Exército da Fúria! - 29/10",
        "812": "Invadindo o chateau. Roubem! O road poneglyph. - 05/11",
        "813": "Encontro predestinado. Luffy e Big Mom! - 12/11",
        "814": "O grito da alma. O ataque relâmpago estratégico de Brook e Pedro. - 19/11",
        "815": "Adeus. As lágrimas da decisão da Purin. - 26/11",
        "816": "A fatalidade dos olhos esquerdos. Pedro vs Barão Tamago - 03/12",
        "817": "Cigarro molhado. Sanji e a véspera do casamento. - 10/12",
        "818": "A alma indomável. Brook vs Big Mom. - 17/12",
        "819": "O desejo de Sora. Sanji, o fracasso da Germa. - 24/12",
        "820": "Para alcançar o Sanji. O grande contra-ataque repentino de Luffy.",
        "821": "Problemas no chateau. Luffy e a promessa do lugar prometido.",
        "822": "Decidindo dizer adeus. Sanji e o bentô dos Chapéus de Palha",
        "823": "Na cama com um yonkou. O grande plano de resgate do Brook!",
        "824": "No lugar da promessa. Luffy no limite do combate.",
        "825": "O mentiroso. Luffy e Sanji.",
        "826": "O retorno de Sanji. Detonem! A infernal Festa do Chá.",
        "827": "O encontro secreto. Luffy vs piratas Firetank.",
        "828": "O acordo mortal. Luffy e o exército aliado de Bege.",
        "829": "O plano secreto de Luffy. Antes das cortinas se abrirem! A conspiração da cerimônia de casamento.",
        "830": "Reunião de família. As cortinas se abrem! A infernal festa do chá.",
        "831": "O casal faz de conta. A entrada de Sanji e Purin!",
        "832": "O beijo da morte. Começa o plano de assassinato da yonkou!",
        "833": "Devolvendo o copo de saquê! O destemido Jinbei paga sua dívida.",
        "834": "O plano falhou? O contra-ataque dos piratas da Big Mom.",
        "835": "Corra, Sanji. SOS! GERMA 66.",
        "836": "O segredo da Mãe. Elbaf a ilha dos gigantes e a pequena monstrinha.",
        "837": "O aniversário da Mãe. O dia que Carmel desapareceu.",
        "838": "Os lançadores explodem! O momento do assassinato da Big Mom.",
        "839": "O exército do mal. Transformem-se! Germa 66.",
        "840": "Cortando relações de pai e filho. Sanji e Judge. - 10/06",
        "841": "Escapando da festa do chá! Luffy vs Big Mom. - 17/06",
        "842": "Começa a execução! A aniquilação das forças aliadas de Luffy? - 24/06",
        "843": "O chateau desmorona. Começa a grande fuga dos Chapéus de Palha! - 01/07",
        "844": "A Lança de Elbaf. Investida! Big Mom corre pelos céus. - 08/07",
        "845": "A decisão de Purin. O grande incêndio! Bosque da Sedução. - 15/07",
        "846": "O contra-ataque do trovão. Nami e a nuvem trovejante Zeus. - 22/07",
        "847": "Reencontro casual. Sanji e a paixão maligna da Purin. - 29/07",
        "848": "Protegendo o Sunny. Batalha feroz! Chopper e Brook. - 05/08",
        "849": "Antes do amanhecer. Pedro, o líder dos guardiões.",
        "863": "Rompendo as linhas inimigas. A grande batalha naval dos Chapéus de Palha!",
        "864": "Finalmente o confronto. A yonkou vs Chapéus de Palha.",
        "865": "Compreendendo o Rei das Trevas. Começa a grande reviravolta contra o Katakuri.",
        "866": "Finalmente retornou. Sanji, o home que para um yonkou.",
        "867": "Espreitando na escuridão. O ataque assassino no Luffy!",
        "868": "A determinação de um homem. O grande desafio de vida ou morte do Katakuri.",
        "869": "Desperte. Supera o mais forte haki da observação!",
        "870": "Os punhos da velocidade. O novo gear fourth é ativado!",
        "871": "Finalmente a conclusão. O resultado da batalha feroz contra o Katakuri.",
        "872": "Situação desesperadora. O cerco de ferro no Luffy!",
        "873": "Revitalizados. O reforço poderoso da Germa!",
        "874": "A última fortaleza. Os Piratas do Sol emergem.",
        "875": "O sabor fascinante. O bolo abençoado do Sanji.",
        "876": "O dever de um homem honrado. Jinbei está pronto para morrer no grande mar.",
        "877": "Hora do arrependimento de despedida. O último desejo de Purin.",
        "878": "O mundo surpreso. O quinto grande impemrador do mar surge!",
        "879": "Para o Reverie. Reúnam-se! Amigos do Chapéu de Palha.",
        "880": "Sabo se move. Todos os comandantes do Exército Revolucionário aparecem!",
        "881": "Começa a se mover. A obcessão do novo Almirante-da-Frota Sakazuki.",
        "882": "A Guerra dos Melhores. Herdando a determinação dos Rei dos Piratas.",
        "883": "Um passo para o sonho. Shirahoshi sob o Sol!",
        "884": "Saudades. Os sentimentos de Vivi e Rebecca.",
        "885": "Escuridão na Terra Sagrada. O misterioso chapéu de palha gigantesco.",
        "886": "Tumulto na Terra Sagrada. O alvo é a princesa Shirahoshi!",
        "887": "Situação extremamente perigosa. Luffy na mira de dois yonkous.",
        "888": "A fúria de Sabo. A tragédia do oficial do Exército Revolucionário, Kuma.",
        "889": "Finalmente começa. O redemoinho de Conspirações do Reverie!",
        "890": "Marco! O guardião das lembranças do Barba Branca.",
        "891": "Subam a cachoeira! A grande viagem marítima para o País de Wano.",
        "892": "O país de Wano!",
        "893": "O-Tama aparece. Luffy vs exército do Kaidou!",
        "894": "Ele certamente voltará. A lenda de Ace no País de Wano!",
        "895": "Especial! O mais forte caçador de recompensas: Cidre.",
        "898": "Astro Principal! O mago Hawkins aparece.",
        "899": "Derrota confirmada. O ataque violento do homem do chapéu de palha!",
        "900": "O melhor dia. O primeiro oshiruko da O-Tama.",
        "901": "Entrando no território inimigo. Os oficiais do governo espalhados no distrito de Bakura.",
        "902": "O Yokozuna aparece. O-Kiku na mira do imbatível Urashima!"
    };

    let opEpisodesCache = EMBEDDED_OP_EPISODES;
    try {
        const stored = GM_getValue('nfb_op_episodes_v4', null);
        if (stored && typeof stored === 'object' && Object.keys(stored).length > 500) {
            opEpisodesCache = Object.assign({}, EMBEDDED_OP_EPISODES, stored);
        }
    } catch (e) { }

    function fetchOnePieceEpisodes() {
        if (!appConfig.features.enableOnePieceRenamer) return;
        // Já temos todos os 885 episódios integrados nativamente com zero delay.
        if (opEpisodesCache && Object.keys(opEpisodesCache).length > 885) return;

        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://onepiecelistas.blogspot.com/2014/10/lista-de-episodios-do-anime-one-piece.html',
            onload: function (response) {
                try {
                    const text = response.responseText;
                    const regex = />\s*(\d{1,4})\s*[:-]\s*([^<]+)/g;
                    let map = Object.assign({}, EMBEDDED_OP_EPISODES);
                    let match;
                    let added = 0;
                    while ((match = regex.exec(text)) !== null) {
                        const epNum = parseInt(match[1]);
                        if (epNum > 0 && epNum < 2000) {
                            let epTitle = match[2];
                            epTitle = epTitle.replace(/\s*[-–]\s*\d{2}\/\d{2}\/\d{4}.*$/, '');
                            epTitle = epTitle.replace(/\s*\((?:Semi-filler|Filler|Canon|Especial|Semi).*?\)?$/gi, '');
                            epTitle = decodeHtmlEntities(epTitle).trim();
                            if (epTitle.length > 2 && !map[epNum]) {
                                map[epNum] = epTitle;
                                added++;
                            }
                        }
                    }
                    if (added > 0) {
                        GM_setValue('nfb_op_episodes_v4', map);
                        opEpisodesCache = map;
                        renameOnePieceEpisodes();
                    }
                } catch (e) { }
            },
            onerror: function (err) { }
        });
    }

    function renameVideoTitle() {
        if (!appConfig.features.enableOnePieceRenamer || !opEpisodesCache) return;

        const titleContainer = document.querySelector('[data-uia="video-title"]');
        if (!titleContainer) return;

        const containerHTML = titleContainer.innerHTML.toLowerCase();
        const docTitle = document.title.toLowerCase();
        const isOnePiece = containerHTML.includes("one piece") || docTitle.includes("one piece");
        if (!isOnePiece) return;

        const spans = Array.from(titleContainer.querySelectorAll('span'));
        if (spans.length === 0) return;

        // 1. Detecta o número do episódio em qualquer elemento do container
        let epNum = null;
        for (const span of spans) {
            const text = span.textContent.trim();
            const m = text.match(/(?:Epis[oó]dio\s*|E\s*)(\d{1,4})/i) || text.match(/^(\d{1,4})$/);
            if (m && m[1]) {
                const num = parseInt(m[1]);
                if (num > 0 && num < 2000) {
                    epNum = num;
                    break;
                }
            }
        }

        if (!epNum) {
            const m = titleContainer.textContent.match(/(?:Epis[oó]dio\s*|E\s*)(\d{1,4})/i);
            if (m) epNum = parseInt(m[1]);
        }

        if (!epNum || !opEpisodesCache[epNum]) return;

        const customTitle = opEpisodesCache[epNum];

        // 2. Alvo: se houver span com "Episódio 497", substitui ele; senão o último span
        let targetSpan = spans.find(s => /Epis[oó]dio\s*\d+/i.test(s.textContent.trim()));
        if (!targetSpan && spans.length >= 2) {
            targetSpan = spans[spans.length - 1];
        } else if (!targetSpan && spans.length === 1) {
            targetSpan = spans[0];
        }

        if (targetSpan) {
            if (spans.length === 1 && targetSpan.textContent.includes('E' + epNum)) {
                const combined = `E${epNum} • ${customTitle}`;
                if (targetSpan.textContent !== combined) {
                    targetSpan.textContent = combined;
                    targetSpan.setAttribute('title', combined);
                }
            } else {
                if (targetSpan.textContent !== customTitle) {
                    targetSpan.textContent = customTitle;
                    targetSpan.setAttribute('title', customTitle);
                }
            }
        }
    }

    let videoTitleObserver = null;
    let currentObservedTitleEl = null;

    function setupVideoTitleObserver() {
        const titleContainer = document.querySelector('[data-uia="video-title"]');
        if (!titleContainer) {
            if (videoTitleObserver) {
                videoTitleObserver.disconnect();
                videoTitleObserver = null;
                currentObservedTitleEl = null;
            }
            return;
        }

        renameVideoTitle();

        if (currentObservedTitleEl === titleContainer) return;
        if (videoTitleObserver) videoTitleObserver.disconnect();

        currentObservedTitleEl = titleContainer;
        videoTitleObserver = new MutationObserver(() => {
            videoTitleObserver.disconnect();
            renameVideoTitle();
            if (currentObservedTitleEl && document.body.contains(currentObservedTitleEl)) {
                videoTitleObserver.observe(currentObservedTitleEl, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        });

        videoTitleObserver.observe(titleContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function replaceEpisodeTextInElement(el) {
        if (!el || !opEpisodesCache) return;

        // 1. Procura em nós de texto filhos diretos
        if (el.childNodes && el.childNodes.length > 0) {
            for (let i = 0; i < el.childNodes.length; i++) {
                const child = el.childNodes[i];
                if (child.nodeType === 3) { // TEXT_NODE
                    const val = child.nodeValue;
                    if (!val || !val.includes('Epis')) continue;

                    const m = val.match(/(?:(?:^|\b)Epis[oó]dio\s*(\d{1,4})(?:\b|\.|$)|(?:^|\b)(\d{1,4})\s*[-–.]?\s*Epis[oó]dio(?:\s*\2)?(?:\b|\.|$))/i);
                    if (m) {
                        const epNum = parseInt(m[1] || m[2]);
                        if (epNum && opEpisodesCache[epNum]) {
                            const customTitle = opEpisodesCache[epNum];
                            if (m[2]) {
                                child.nodeValue = val.replace(
                                    new RegExp(`(?:^|\\b)${epNum}\\s*[-–.]?\\s*Epis[oó]dio(?:\\s*${epNum})?(?:\\b|\\.|$)`, 'i'),
                                    `${epNum}. ${customTitle}`
                                );
                            } else {
                                child.nodeValue = val.replace(
                                    new RegExp(`(?:^|\\b)Epis[oó]dio\\s*${epNum}(?:\\b|\\.|$)`, 'i'),
                                    customTitle
                                );
                            }
                            if (el.setAttribute) el.setAttribute('title', customTitle);
                            el.dataset.nfbEpRenamed = String(epNum);
                        }
                    }
                }
            }
        }

        // 2. Se for elemento folha (apenas texto puro)
        if (el.children && el.children.length === 0) {
            const text = el.textContent.trim();
            if (text && text.includes('Epis')) {
                const m = text.match(/(?:(?:^|\b)Epis[oó]dio\s*(\d{1,4})(?:\b|\.|$)|(?:^|\b)(\d{1,4})\s*[-–.]?\s*Epis[oó]dio(?:\s*\2)?(?:\b|\.|$))/i);
                if (m) {
                    const epNum = parseInt(m[1] || m[2]);
                    if (epNum && opEpisodesCache[epNum]) {
                        const customTitle = opEpisodesCache[epNum];
                        if (m[2]) {
                            const targetText = `${epNum}. ${customTitle}`;
                            if (el.textContent !== targetText) {
                                el.textContent = targetText;
                                el.setAttribute('title', customTitle);
                            }
                        } else {
                            if (el.textContent !== customTitle) {
                                el.textContent = customTitle;
                                el.setAttribute('title', customTitle);
                            }
                        }
                        el.dataset.nfbEpRenamed = String(epNum);
                    }
                }
            }
        }
    }

    function renameOnePieceEpisodes() {
        if (!appConfig.features.enableOnePieceRenamer || !opEpisodesCache) return;

        decodeDomEntities();
        renameVideoTitle();
        setupVideoTitleObserver();

        // Seletor cirúrgico e de altíssima performance: foca apenas nas áreas reais de episódios
        const candidates = document.querySelectorAll(
            '[data-uia="video-title"] span, ' +
            '[data-uia*="episode"] span, [data-uia*="episode"] p, [data-uia*="episode"] h3, [data-uia*="episode"] h4, ' +
            '.titleCard-title_text, .titleCard-title, .titleCard-synopsis, .episode-title, ' +
            '.episodes-pane span, .episodes-pane h4, .episodes-pane p, ' +
            '[class*="episode"] span, [class*="episode"] p, [class*="episode"] h3, [class*="episode"] h4'
        );
        for (let i = 0; i < candidates.length; i++) {
            const el = candidates[i];
            if (el.dataset.nfbEpRenamed) continue; // Pula nós já cacheados em O(1)
            if (el.textContent && el.textContent.includes('Epis')) {
                replaceEpisodeTextInElement(el);
            }
        }
    }

    // 5. PAINEL DE CONTROLE UI
    // ==========================================
    function initFloatingUI() {
        if (document.getElementById('nfb-panel')) return;
        const btn = document.createElement('button');
        btn.id = 'nfb-toggle-btn';
        btn.innerHTML = '⚙️';
        btn.onclick = () => document.getElementById('nfb-panel').classList.toggle('active');
        document.documentElement.appendChild(btn);

        let hideTimeout;
        document.addEventListener('mousemove', () => {
            const panel = document.getElementById('nfb-panel');
            if (panel && panel.classList.contains('active')) {
                btn.style.opacity = '1';
                return;
            }
            btn.style.opacity = '0.5';
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                if (panel && !panel.classList.contains('active') && !btn.matches(':hover')) {
                    btn.style.opacity = '0';
                }
            }, 2500);
        });

        const panel = document.createElement('div');
        panel.id = 'nfb-panel';
        panel.innerHTML = `
            <div class="nfb-header">
                <div class="nfb-title-wrap">
                    <h2 class="nfb-title">✨ ${appConfig.texts.panelTitle}</h2>
                    <span class="nfb-badge">v19.0</span>
                </div>
                <button class="nfb-close-btn" id="nfb-close-btn" title="Fechar">✕</button>
            </div>
            
            <div class="nfb-tabs">
                <button class="nfb-tab-btn" id="nfb-btn-style" data-tab="nfb-tab-style">${appConfig.texts.tabStyle}</button>
                <button class="nfb-tab-btn" id="nfb-btn-features" data-tab="nfb-tab-features">${appConfig.texts.tabFeatures}</button>
                <button class="nfb-tab-btn" id="nfb-btn-texts" data-tab="nfb-tab-texts">${appConfig.texts.tabTexts}</button>
            </div>
            
            <!-- Tab: Style & Filters -->
            <div class="nfb-tab-content" id="nfb-tab-style">
                <div class="nfb-group"><span>${appConfig.texts.lblTheme}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-ui" ${appConfig.features.enableTheme ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                <div class="nfb-group"><span>${appConfig.texts.lblColorPrimary}</span> <input type="color" id="cfg-color" value="${appConfig.theme.primary}"></div>
                <div class="nfb-group"><span>${appConfig.texts.lblColorHover}</span> <input type="color" id="cfg-hover" value="${appConfig.theme.hover}"></div>
                <div class="nfb-group"><span>${appConfig.texts.lblGlow}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-glow" ${appConfig.features.enableGlow ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                <div class="nfb-group"><span>${appConfig.texts.lblLayout}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-layout" ${appConfig.features.studioLayout ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                <div class="nfb-group"><span>${appConfig.texts.lblHoverScale}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-hover-scale" ${appConfig.features.enableHoverScale ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                
                <div style="margin: 14px 0 6px 4px; font-size: 11px; font-weight: 700; color: var(--nfb-primary); text-transform: uppercase; letter-spacing: 0.5px;">${appConfig.texts.lblFiltersSec}</div>
                <div class="nfb-group">
                    <span>${appConfig.texts.lblBrightness}</span>
                    <div class="nfb-filter-range">
                        <input type="range" id="cfg-filter-brightness" min="60" max="150" step="5" value="${appConfig.filters.brightness}">
                        <span class="val" id="val-brightness">${appConfig.filters.brightness}%</span>
                    </div>
                </div>
                <div class="nfb-group">
                    <span>${appConfig.texts.lblContrast}</span>
                    <div class="nfb-filter-range">
                        <input type="range" id="cfg-filter-contrast" min="60" max="150" step="5" value="${appConfig.filters.contrast}">
                        <span class="val" id="val-contrast">${appConfig.filters.contrast}%</span>
                    </div>
                </div>
                <div class="nfb-group">
                    <span>${appConfig.texts.lblSaturate}</span>
                    <div class="nfb-filter-range">
                        <input type="range" id="cfg-filter-saturate" min="0" max="200" step="10" value="${appConfig.filters.saturate}">
                        <span class="val" id="val-saturate">${appConfig.filters.saturate}%</span>
                    </div>
                </div>
            </div>
            
            <!-- Tab: Features -->
            <div class="nfb-tab-content" id="nfb-tab-features">
                <div class="nfb-tab-scroll">
                    <div class="nfb-group"><span>${appConfig.texts.lblPip}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-pip" ${appConfig.features.enablePipBtn ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblGlobalWheel}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-global-wheel" ${appConfig.features.enableGlobalVolumeScroll ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblHudToasts}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-hud-toasts" ${appConfig.features.enableHudToasts ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblShortcuts}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-shortcuts" ${appConfig.features.enableShortcuts ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblStretch}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-stretch" ${appConfig.features.enableStretchBtn ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblVolumeHoriz}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-volume-horiz" ${appConfig.features.enableHorizontalVolume ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblAutoSkip}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-autoskip" ${appConfig.features.autoSkip ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblSpeedBtn}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-speed" ${appConfig.features.enableSpeedBtn ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblOpRenamer}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-op-renamer" ${appConfig.features.enableOnePieceRenamer ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                    <div class="nfb-group"><span>${appConfig.texts.lblHouse}</span> <label class="nfb-switch"><input type="checkbox" id="cfg-house" ${appConfig.features.disableHousehold ? 'checked' : ''}><span class="nfb-slider"></span></label></div>
                </div>
            </div>
            
            <!-- Tab: Texts & Translation -->
            <div class="nfb-tab-content" id="nfb-tab-texts">
                <div class="nfb-tab-scroll">
                    <div class="nfb-group"><span>Título Painel</span> <input type="text" id="cfg-txt-title" value="${appConfig.texts.panelTitle}"></div>
                    <div class="nfb-group"><span>Botão Salvar</span> <input type="text" id="cfg-txt-save" value="${appConfig.texts.saveBtn}"></div>
                    <div class="nfb-group"><span>Botão Esticar</span> <input type="text" id="cfg-txt-stretch" value="${appConfig.texts.stretchBtnTitle}"></div>
                    <div class="nfb-group"><span>Botão PiP</span> <input type="text" id="cfg-txt-pip" value="${appConfig.texts.pipBtnTitle}"></div>
                    <div class="nfb-group"><span>Dica Volume</span> <input type="text" id="cfg-txt-volume" value="${appConfig.texts.volumeSliderTitle}"></div>
                    
                    <div class="nfb-group"><span>Cor Destaque</span> <input type="text" id="cfg-lbl-primary" value="${appConfig.texts.lblColorPrimary}"></div>
                    <div class="nfb-group"><span>Cor Hover</span> <input type="text" id="cfg-lbl-hover" value="${appConfig.texts.lblColorHover}"></div>
                    <div class="nfb-group"><span>Brilho Glow</span> <input type="text" id="cfg-lbl-glow" value="${appConfig.texts.lblGlow}"></div>
                    <div class="nfb-group"><span>Tema Enhanced</span> <input type="text" id="cfg-lbl-theme" value="${appConfig.texts.lblTheme}"></div>
                    <div class="nfb-group"><span>Layout Cinema</span> <input type="text" id="cfg-lbl-layout" value="${appConfig.texts.lblLayout}"></div>
                    <div class="nfb-group"><span>Residência</span> <input type="text" id="cfg-lbl-house" value="${appConfig.texts.lblHouse}"></div>
                    <div class="nfb-group"><span>Botão Esticar</span> <input type="text" id="cfg-lbl-stretch" value="${appConfig.texts.lblStretch}"></div>
                    <div class="nfb-group"><span>Botão PiP</span> <input type="text" id="cfg-lbl-pip" value="${appConfig.texts.lblPip}"></div>
                    <div class="nfb-group"><span>Atalhos Teclado</span> <input type="text" id="cfg-lbl-shortcuts" value="${appConfig.texts.lblShortcuts}"></div>
                    <div class="nfb-group"><span>Scroll Volume</span> <input type="text" id="cfg-lbl-global-wheel" value="${appConfig.texts.lblGlobalWheel}"></div>
                    <div class="nfb-group"><span>HUD Toasts</span> <input type="text" id="cfg-lbl-hud-toasts" value="${appConfig.texts.lblHudToasts}"></div>
                    <div class="nfb-group"><span>Aumentar Hover</span> <input type="text" id="cfg-lbl-hover-scale" value="${appConfig.texts.lblHoverScale}"></div>
                    <div class="nfb-group"><span>Volume Horiz</span> <input type="text" id="cfg-lbl-vol-horiz" value="${appConfig.texts.lblVolumeHoriz}"></div>
                    <div class="nfb-group"><span>Auto Pular</span> <input type="text" id="cfg-lbl-autoskip" value="${appConfig.texts.lblAutoSkip}"></div>
                    <div class="nfb-group"><span>Velocidade</span> <input type="text" id="cfg-lbl-speed" value="${appConfig.texts.lblSpeedBtn}"></div>
                    <div class="nfb-group"><span>Organizar One Piece</span> <input type="text" id="cfg-lbl-op-renamer" value="${appConfig.texts.lblOpRenamer}"></div>
                    <div class="nfb-group"><span>Aba Estilo</span> <input type="text" id="cfg-tab-style" value="${appConfig.texts.tabStyle}"></div>
                    <div class="nfb-group"><span>Aba Recursos</span> <input type="text" id="cfg-tab-features" value="${appConfig.texts.tabFeatures}"></div>
                    <div class="nfb-group"><span>Aba Textos</span> <input type="text" id="cfg-tab-texts" value="${appConfig.texts.tabTexts}"></div>
                </div>
            </div>
            
            <button id="nfb-save">${appConfig.texts.saveBtn}</button>
            <button id="nfb-sync-github" style="width: 100%; margin-top: 8px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 7px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.color='#fff';this.style.borderColor='var(--nfb-primary)'" onmouseout="this.style.color='rgba(255,255,255,0.7)';this.style.borderColor='rgba(255,255,255,0.12)'">🔄 Sincronizar com GitHub / Forçar Atualização</button>
        `;
        document.documentElement.appendChild(panel);

        // Botão de fechar rápido
        const closeBtn = panel.querySelector('#nfb-close-btn');
        if (closeBtn) closeBtn.onclick = () => panel.classList.remove('active');

        // Aba ativa restaurada do estado global
        const activeTabBtn = panel.querySelector(`[data-tab="${currentActiveTab}"]`);
        const activeTabContent = panel.querySelector(`#${currentActiveTab}`);
        if (activeTabBtn && activeTabContent) {
            activeTabBtn.classList.add('active');
            activeTabContent.classList.add('active');
        } else {
            const fallbackBtn = panel.querySelector('.nfb-tab-btn');
            const fallbackContent = panel.querySelector('.nfb-tab-content');
            if (fallbackBtn && fallbackContent) {
                fallbackBtn.classList.add('active');
                fallbackContent.classList.add('active');
            }
        }

        // Atualização em tempo real das etiquetas de filtros de vídeo
        const bSlider = panel.querySelector('#cfg-filter-brightness');
        const cSlider = panel.querySelector('#cfg-filter-contrast');
        const sSlider = panel.querySelector('#cfg-filter-saturate');
        if (bSlider) bSlider.oninput = (e) => { panel.querySelector('#val-brightness').textContent = `${e.target.value}%`; };
        if (cSlider) cSlider.oninput = (e) => { panel.querySelector('#val-contrast').textContent = `${e.target.value}%`; };
        if (sSlider) sSlider.oninput = (e) => { panel.querySelector('#val-saturate').textContent = `${e.target.value}%`; };

        // Lógica de click das abas
        panel.querySelectorAll('.nfb-tab-btn').forEach(tabBtn => {
            tabBtn.onclick = () => {
                panel.querySelectorAll('.nfb-tab-btn').forEach(btn => btn.classList.remove('active'));
                panel.querySelectorAll('.nfb-tab-content').forEach(content => content.classList.remove('active'));

                tabBtn.classList.add('active');
                const targetId = tabBtn.getAttribute('data-tab');
                const targetContent = panel.querySelector(`#${targetId}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                currentActiveTab = targetId;
            };
        });

        document.getElementById('nfb-save').onclick = () => {
            appConfig.theme.primary = document.getElementById('cfg-color').value;
            appConfig.theme.hover = document.getElementById('cfg-hover').value;
            appConfig.features.enableGlow = document.getElementById('cfg-glow').checked;
            appConfig.features.enableTheme = document.getElementById('cfg-ui').checked;
            appConfig.features.studioLayout = document.getElementById('cfg-layout').checked;
            appConfig.features.disableHousehold = document.getElementById('cfg-house').checked;
            appConfig.features.enableStretchBtn = document.getElementById('cfg-stretch').checked;
            appConfig.features.enablePipBtn = document.getElementById('cfg-pip').checked;
            appConfig.features.enableShortcuts = document.getElementById('cfg-shortcuts').checked;
            appConfig.features.enableGlobalVolumeScroll = document.getElementById('cfg-global-wheel').checked;
            appConfig.features.enableHudToasts = document.getElementById('cfg-hud-toasts').checked;
            appConfig.features.enableHoverScale = document.getElementById('cfg-hover-scale').checked;
            appConfig.features.enableHorizontalVolume = document.getElementById('cfg-volume-horiz').checked;
            appConfig.features.autoSkip = document.getElementById('cfg-autoskip').checked;
            appConfig.features.enableSpeedBtn = document.getElementById('cfg-speed').checked;
            appConfig.features.enableOnePieceRenamer = document.getElementById('cfg-op-renamer').checked;

            appConfig.filters.brightness = parseInt(document.getElementById('cfg-filter-brightness').value);
            appConfig.filters.contrast = parseInt(document.getElementById('cfg-filter-contrast').value);
            appConfig.filters.saturate = parseInt(document.getElementById('cfg-filter-saturate').value);

            appConfig.texts.panelTitle = document.getElementById('cfg-txt-title').value;
            appConfig.texts.saveBtn = document.getElementById('cfg-txt-save').value;
            appConfig.texts.stretchBtnTitle = document.getElementById('cfg-txt-stretch').value;
            appConfig.texts.pipBtnTitle = document.getElementById('cfg-txt-pip').value;
            appConfig.texts.volumeSliderTitle = document.getElementById('cfg-txt-volume').value;

            appConfig.texts.lblColorPrimary = document.getElementById('cfg-lbl-primary').value;
            appConfig.texts.lblColorHover = document.getElementById('cfg-lbl-hover').value;
            appConfig.texts.lblGlow = document.getElementById('cfg-lbl-glow').value;
            appConfig.texts.lblTheme = document.getElementById('cfg-lbl-theme').value;
            appConfig.texts.lblLayout = document.getElementById('cfg-lbl-layout').value;
            appConfig.texts.lblHouse = document.getElementById('cfg-lbl-house').value;
            appConfig.texts.lblStretch = document.getElementById('cfg-lbl-stretch').value;
            appConfig.texts.lblPip = document.getElementById('cfg-lbl-pip').value;
            appConfig.texts.lblShortcuts = document.getElementById('cfg-lbl-shortcuts').value;
            appConfig.texts.lblGlobalWheel = document.getElementById('cfg-lbl-global-wheel').value;
            appConfig.texts.lblHudToasts = document.getElementById('cfg-lbl-hud-toasts').value;
            appConfig.texts.lblHoverScale = document.getElementById('cfg-lbl-hover-scale').value;
            appConfig.texts.lblVolumeHoriz = document.getElementById('cfg-lbl-vol-horiz').value;
            appConfig.texts.lblAutoSkip = document.getElementById('cfg-lbl-autoskip').value;
            appConfig.texts.lblSpeedBtn = document.getElementById('cfg-lbl-speed').value;
            appConfig.texts.lblOpRenamer = document.getElementById('cfg-lbl-op-renamer').value;

            appConfig.texts.tabStyle = document.getElementById('cfg-tab-style')?.value || appConfig.texts.tabStyle;
            appConfig.texts.tabFeatures = document.getElementById('cfg-tab-features')?.value || appConfig.texts.tabFeatures;
            appConfig.texts.tabTexts = document.getElementById('cfg-tab-texts')?.value || appConfig.texts.tabTexts;

            GM_setValue('nfb_theme', appConfig.theme);
            GM_setValue('nfb_features', appConfig.features);
            GM_setValue('nfb_filters', appConfig.filters);
            GM_setValue('nfb_texts', appConfig.texts);

            if (!appConfig.features.enableHorizontalVolume) {
                const customVol = document.getElementById('nfb-custom-volume-container');
                if (customVol) customVol.remove();
            } else {
                tryInjectVolumeSlider();
            }

            injectMasterCSS();

            document.querySelectorAll('.nfb-locked').forEach(el => el.classList.remove('nfb-locked'));
            overrideEmotionColors();
            applyVideoFilters();

            // Destrói e reconstrói o painel e o botão para refletir novas strings
            document.getElementById('nfb-panel').remove();
            document.getElementById('nfb-toggle-btn').remove();
            initFloatingUI();
        };

        const syncBtn = document.getElementById('nfb-sync-github');
        if (syncBtn) {
            syncBtn.onclick = () => {
                try {
                    GM_setValue('NETFLIX_MOD_CACHED_PAYLOAD', null);
                    GM_setValue('NETFLIX_MOD_LAST_CHECK', 0);
                } catch (_) {}
                if (typeof unsafeWindow !== 'undefined' && unsafeWindow.__updateNetflixEnhanced) {
                    unsafeWindow.__updateNetflixEnhanced(true);
                } else {
                    showToast('🔄 Cache limpo! Recarregando página...');
                    setTimeout(() => location.reload(), 800);
                }
            };
        }
    }


    // ==========================================
    // 5b. AUTO SKIP
    // ==========================================
    let isMouseActive = false;
    let mouseTimeout;

    document.addEventListener('mousemove', () => {
        isMouseActive = true;
        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
            isMouseActive = false;
        }, 2000);
    });

    let lastAutoSkipTime = 0;

    function checkAutoSkip() {
        if (!appConfig.features.autoSkip) return;
        if (isMouseActive) return;

        const now = Date.now();
        // Cooldown de 3.5 segundos entre cliques para nunca sobrecarregar o player durante seek
        if (now - lastAutoSkipTime < 3500) return;

        const video = document.querySelector('video');
        if (video && video.seeking) return; // Aguarda o seek terminar antes de qualquer outra ação

        // Pula introdução, resumo e o botão de contagem regressiva para o próximo episódio
        const btn = document.querySelector(
            '[data-uia="player-skip-intro"], [data-uia="player-skip-recap"], ' +
            '[data-uia="next-episode-seamless-button"], [data-uia="next-episode-seamless-button-draining"]'
        );
        if (btn) {
            if (btn.dataset.nfbAutoSkipped) return;

            // Verificação rápida sem forçar layout reflow com getComputedStyle
            const isVisible = btn.offsetParent !== null || btn.offsetWidth > 0;
            if (isVisible) {
                btn.dataset.nfbAutoSkipped = "true";
                lastAutoSkipTime = now;
                try {
                    btn.click();
                    showQuickHud("Auto Skip Executado");
                } catch (e) {}
            }
        }
    }

    // ==========================================
    // 6. INICIALIZAÇÃO
    // ==========================================
    function initApp() {
        injectMasterCSS();
        initFloatingUI();
        initKeyboardShortcuts();
        initGlobalVolumeScroll();
        tryInjectVolumeSlider();
        tryInjectStretchButton();
        tryInjectSpeedButton();
        tryInjectPipButton();
        hideNativeVolumeSlider();
        fetchOnePieceEpisodes();
        renameOnePieceEpisodes();
        applyPlaybackRate();
        applyVideoFilters();

        function runPeriodicChecks() {
            tryInjectVolumeSlider();
            tryInjectStretchButton();
            tryInjectSpeedButton();
            tryInjectPipButton();
            syncCustomVolume();
            hideNativeVolumeSlider();
            overrideEmotionColors();
            checkAutoSkip();
            renameOnePieceEpisodes();
            applyPlaybackRate();
            applyVideoFilters();
        }

        // Neutralizador de overlays throttled a cada 1.5s para evitar reflows constantes
        setInterval(() => {
            neutralizeBlockers();
        }, 1500);

        // MOTOR DE ULTRA-PERFORMANCE (0ms a 1ms REAL SINCRONIZADO COM A GPU)
        // Substitui o setTimeout clamped por requestAnimationFrame puro alinhado aos 60/120/144Hz do monitor
        let isBatchScheduled = false;
        function scheduleFastUpdate() {
            if (isBatchScheduled) return;
            isBatchScheduled = true;
            requestAnimationFrame(() => {
                isBatchScheduled = false;
                runPeriodicChecks();
            });
        }

        const observer = new MutationObserver(() => {
            scheduleFastUpdate();
        });

        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Intervalo leve de redundância a cada 500ms caso o observer esteja ocioso
        setInterval(() => {
            scheduleFastUpdate();
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

})();