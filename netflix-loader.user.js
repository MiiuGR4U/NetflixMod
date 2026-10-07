// ==UserScript==
// @name         Netflix Mod - Auto Updater (Live Loader)
// @namespace    https://github.com/MiiuGR4U/NetflixMod
// @version      1.0.0
// @description  Mantém o Netflix Mod atualizado automaticamente direto do GitHub sem precisar reinstalar nada no Tampermonkey.
// @author       MiiuGR4U
// @match        *://*.netflix.com/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @connect      onepiecelistas.blogspot.com
// @updateURL    https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/netflix-loader.user.js
// @downloadURL  https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/netflix-loader.user.js
// ==/UserScript==

(function () {
    'use strict';

    const REMOTE_URL = 'https://raw.githubusercontent.com/MiiuGR4U/NetflixMod/main/NETFLIXeditor.user.js';
    const CACHE_KEY = 'NETFLIX_MOD_CACHED_PAYLOAD';
    const CACHE_TIME_KEY = 'NETFLIX_MOD_LAST_CHECK';

    console.log('[NetflixMod Loader] Iniciando auto-updater...');

    // 1. Execução instantânea (Zero Delay / Cache-First)
    const cachedScript = GM_getValue(CACHE_KEY, null);
    if (cachedScript && typeof cachedScript === 'string' && cachedScript.trim().length > 100) {
        try {
            eval(cachedScript);
            console.log('[NetflixMod Loader] Código em cache carregado instantaneamente.');
        } catch (err) {
            console.error('[NetflixMod Loader] Erro ao executar script em cache:', err);
        }
    }

    // 2. Sincronização remota em segundo plano
    function syncRemoteCode(isFirstRun = false) {
        const bustUrl = REMOTE_URL + '?t=' + Date.now();

        GM_xmlhttpRequest({
            method: 'GET',
            url: bustUrl,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            },
            onload: function (res) {
                if (res.status === 200 && res.responseText && res.responseText.length > 100) {
                    const latestCode = res.responseText;

                    if (latestCode !== cachedScript) {
                        GM_setValue(CACHE_KEY, latestCode);
                        GM_setValue(CACHE_TIME_KEY, Date.now());
                        console.log('[NetflixMod Loader] ✨ Nova versão baixada do GitHub e salva com sucesso!');

                        // Se for a primeira instalação e não tinha cache, executa agora
                        if (isFirstRun) {
                            try {
                                eval(latestCode);
                                console.log('[NetflixMod Loader] Primeira execução concluída com sucesso.');
                            } catch (err) {
                                console.error('[NetflixMod Loader] Erro ao executar código baixado:', err);
                            }
                        }
                    } else {
                        console.log('[NetflixMod Loader] Seu script já está atualizado com o GitHub.');
                    }
                }
            },
            onerror: function (err) {
                console.warn('[NetflixMod Loader] Falha ao conectar ao GitHub:', err);
            }
        });
    }

    // Se não há cache, sincroniza e executa; se já há cache, sincroniza em background
    syncRemoteCode(!cachedScript);

    // Função de verificação manual no console
    try {
        if (typeof unsafeWindow !== 'undefined') {
            unsafeWindow.__updateNetflixMod = () => {
                console.log('[NetflixMod Loader] Forçando verificação de atualização...');
                syncRemoteCode(false);
            };
        }
    } catch (_) {}
})();
