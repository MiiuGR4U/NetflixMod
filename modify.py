import re

with open(r'd:\Programming\TAMPERMONKEY\NETFLIXeditor.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Headers
code = code.replace(
    '// @grant        GM_getValue\n// @grant        GM_setValue\n// @grant        unsafeWindow',
    '// @grant        GM_getValue\n// @grant        GM_setValue\n// @grant        GM_xmlhttpRequest\n// @grant        unsafeWindow\n// @connect      onepiecelistas.blogspot.com'
)

# 2. Features Config
code = code.replace(
    'enableHorizontalVolume: true,\n            autoSkip: true',
    'enableHorizontalVolume: true,\n            autoSkip: true,\n            enableSpeedBtn: true,\n            enableOnePieceRenamer: true'
)

# 3. CSS for positioning
css_old = '''                /* Posicionamento dinâmico calculado por JS com base de 4% */
                ${appConfig.features.enableStretchBtn ? `
                [data-uia^="control-fullscreen"]:not(svg) { right: 4% !important; }
                #nfb-stretch-action { right: calc(4% + 48px) !important; }
                [data-uia="control-audio-subtitle"] { right: calc(4% + 96px) !important; }
                [data-uia="control-episodes"] { right: calc(4% + 144px) !important; }
                [data-uia="control-next"] { right: calc(4% + 192px) !important; }
                ` : `
                [data-uia^="control-fullscreen"]:not(svg) { right: 4% !important; }
                [data-uia="control-audio-subtitle"] { right: calc(4% + 48px) !important; }
                [data-uia="control-episodes"] { right: calc(4% + 96px) !important; }
                [data-uia="control-next"] { right: calc(4% + 144px) !important; }
                `}'''

css_new = '''                /* Posicionamento dinâmico calculado por JS com base de 4% */
                [data-uia^="control-fullscreen"]:not(svg) { right: 4% !important; }
                ${appConfig.features.enableStretchBtn ? `#nfb-stretch-action { right: calc(4% + 48px) !important; }` : ''}
                ${appConfig.features.enableSpeedBtn ? `#nfb-speed-action { right: calc(4% + ${(appConfig.features.enableStretchBtn ? 48 : 0) + 48}px) !important; }` : ''}
                [data-uia="control-audio-subtitle"] { right: calc(4% + ${(appConfig.features.enableStretchBtn ? 48 : 0) + (appConfig.features.enableSpeedBtn ? 48 : 0) + 48}px) !important; }
                [data-uia="control-episodes"] { right: calc(4% + ${(appConfig.features.enableStretchBtn ? 48 : 0) + (appConfig.features.enableSpeedBtn ? 48 : 0) + 96}px) !important; }
                [data-uia="control-next"] { right: calc(4% + ${(appConfig.features.enableStretchBtn ? 48 : 0) + (appConfig.features.enableSpeedBtn ? 48 : 0) + 144}px) !important; }'''

code = code.replace(css_old, css_new)

# 4. CSS Additions for #nfb-speed-action next to #nfb-stretch-action
code = code.replace('#nfb-stretch-action,\n', '#nfb-stretch-action,\n                #nfb-speed-action,\n')
code = code.replace('#nfb-stretch-action *:not(svg):not(path),\n', '#nfb-stretch-action *:not(svg):not(path),\n                #nfb-speed-action *:not(svg):not(path),\n')
code = code.replace('#nfb-stretch-action:focus,\n                #nfb-stretch-action:active,\n', '#nfb-stretch-action:focus,\n                #nfb-stretch-action:active,\n                #nfb-speed-action:focus,\n                #nfb-speed-action:active,\n')
code = code.replace('#nfb-stretch-action:hover,\n', '#nfb-stretch-action:hover,\n                #nfb-speed-action:hover,\n')

# 5. Injection of JavaScript functions
js_injection = '''    // ==========================================
    // 4b. INJEÇÃO DO BOTÃO DE VELOCIDADE
    // ==========================================
    let currentSpeedIndex = 2;
    const speeds = [0.25, 0.5, 1.0, 1.25, 1.5, 2.0];
    
    function tryInjectSpeedButton() {
        if (!appConfig.features.enableSpeedBtn || document.getElementById('nfb-speed-action')) return;
        const stretchBtn = document.getElementById('nfb-stretch-action');
        const fullscreenBtn = document.querySelector('[data-uia="control-fullscreen-enter"], [data-uia="control-fullscreen-exit"]');
        const targetBtn = stretchBtn || fullscreenBtn;
        
        if (targetBtn && targetBtn.parentNode) {
            const speedBtn = document.createElement('button');
            speedBtn.id = 'nfb-speed-action';
            speedBtn.className = 'nfb-stretch-btn'; 
            speedBtn.title = "Velocidade de Reprodução";
            speedBtn.innerText = "1x";
            
            // Verifica a taxa atual para exibir no botão caso o usuário tenha trocado antes de recarregar
            const video = document.querySelector('video');
            if (video && speeds.includes(video.playbackRate)) {
                currentSpeedIndex = speeds.indexOf(video.playbackRate);
                speedBtn.innerText = video.playbackRate + "x";
            }
            
            speedBtn.style.fontSize = "16px";
            speedBtn.style.fontWeight = "bold";

            speedBtn.onclick = (e) => {
                e.preventDefault(); e.stopPropagation();
                currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
                const v = document.querySelector('video');
                if (v) {
                    v.playbackRate = speeds[currentSpeedIndex];
                    speedBtn.innerText = speeds[currentSpeedIndex] + "x";
                }
            };
            targetBtn.parentNode.insertBefore(speedBtn, stretchBtn || fullscreenBtn);
        }
    }

    // ==========================================
    // 7. ONE PIECE EPISODE RENAMER
    // ==========================================
    let opEpisodesCache = GM_getValue('nfb_op_episodes', null);
    
    function fetchOnePieceEpisodes() {
        if (!appConfig.features.enableOnePieceRenamer || opEpisodesCache) return;
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://onepiecelistas.blogspot.com/2014/10/lista-de-episodios-do-anime-one-piece.html',
            onload: function(response) {
                const text = response.responseText;
                const regex = />\\s*(\d{1,4})\\s*[:-]\\s*([^<]+?)\\s*(?:[-–]|<|\[)/g;
                let map = {};
                let match;
                while ((match = regex.exec(text)) !== null) {
                    let epName = match[2].trim();
                    if (epName.length > 2 && !epName.startsWith('(')) {
                        map[parseInt(match[1])] = epName;
                    }
                }
                if (Object.keys(map).length > 500) {
                    GM_setValue('nfb_op_episodes', map);
                    opEpisodesCache = map;
                }
            }
        });
    }

    function renameOnePieceEpisodes() {
        if (!appConfig.features.enableOnePieceRenamer || !opEpisodesCache) return;
        
        // Verifica se é One Piece
        const titleEl = document.querySelector('[data-uia="video-title"] h4, .logo-title, .show-title');
        const isOnePiece = titleEl && titleEl.textContent.toLowerCase().includes("one piece");
        if (!isOnePiece) return;

        // Lista de episódios (.titleCard-title_text ou similares)
        const episodeCards = document.querySelectorAll('.titleCard-title_text, [data-uia="episode-title"], .episode-title');
        episodeCards.forEach(card => {
            const text = card.textContent;
            const match = text.match(/Episódio (\d+)/i);
            if (match) {
                const epNum = parseInt(match[1]);
                if (opEpisodesCache[epNum] && !card.dataset.nfbRenamed) {
                    card.textContent = opEpisodesCache[epNum];
                    card.dataset.nfbRenamed = "true";
                }
            }
        });

        // Título do episódio ativo sendo assistido
        const currentEpTitle = document.querySelector('[data-uia="video-title"] span');
        if (currentEpTitle) {
            const match = currentEpTitle.textContent.match(/Episódio (\d+)/i);
            if (match) {
                const epNum = parseInt(match[1]);
                if (opEpisodesCache[epNum] && currentEpTitle.dataset.nfbEp !== String(epNum)) {
                    currentEpTitle.textContent = "E" + epNum + ": " + opEpisodesCache[epNum];
                    currentEpTitle.dataset.nfbEp = String(epNum);
                }
            }
        }
    }

    // ==========================================
    // 5. PAINEL DE CONTROLE UI'''

code = code.replace('    // ==========================================\n    // 5. PAINEL DE CONTROLE UI', js_injection)

# 6. Initialize in interval
code = code.replace(
    'tryInjectStretchButton();\n            overrideEmotionColors();',
    'tryInjectStretchButton();\n            tryInjectSpeedButton();\n            overrideEmotionColors();'
)

code = code.replace(
    'tryInjectStretchButton();\n        hideNativeVolumeSlider();',
    'tryInjectStretchButton();\n        tryInjectSpeedButton();\n        hideNativeVolumeSlider();\n        fetchOnePieceEpisodes();'
)

code = code.replace(
    'hideNativeVolumeSlider();\n            checkAutoSkip();',
    'hideNativeVolumeSlider();\n            checkAutoSkip();\n            renameOnePieceEpisodes();\n            tryInjectSpeedButton();'
)

# update toggle configs logic
# we will just save them even if there are no UI switches
save_logic_old = '''            appConfig.features.enableHorizontalVolume = document.getElementById('cfg-volume-horiz').checked;
            appConfig.features.autoSkip = document.getElementById('cfg-autoskip').checked;

            appConfig.texts.panelTitle = document.getElementById('cfg-txt-title').value;'''

save_logic_new = '''            appConfig.features.enableHorizontalVolume = document.getElementById('cfg-volume-horiz').checked;
            appConfig.features.autoSkip = document.getElementById('cfg-autoskip').checked;
            // Configurações não expostas na UI
            appConfig.features.enableSpeedBtn = true;
            appConfig.features.enableOnePieceRenamer = true;

            appConfig.texts.panelTitle = document.getElementById('cfg-txt-title').value;'''

code = code.replace(save_logic_old, save_logic_new)


with open(r'd:\Programming\TAMPERMONKEY\NETFLIXeditor.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Python modification done!")
