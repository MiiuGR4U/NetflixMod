// ==UserScript==
// @name         Netflix Enhanced - Auto Updater (Live Loader)
// @namespace    https://github.com/MiiuGR4U/NetflixMod
// @version      19.0.0
// @description  Mantém o Netflix Enhanced atualizado automaticamente direto do GitHub sem precisar reinstalar nada no Tampermonkey.
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

    console.log('[Netflix Enhanced Loader] Iniciando auto-updater v19.0.0...');

    function extractVersion(code) {
        if (!code || typeof code !== 'string') return '0.0';
        const match = code.match(/@version\s+([^\r\n]+)/);
        return match ? match[1].trim() : '0.0';
    }

    function showLoaderNotification(message, icon = '🚀', autoDismiss = 3500) {
        const render = () => {
            let toast = document.getElementById('nfb-loader-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'nfb-loader-toast';
                toast.style.cssText = [
                    'position: fixed',
                    'top: 24px',
                    'right: 24px',
                    'z-index: 2147483647',
                    'background: rgba(13, 17, 23, 0.94)',
                    'border: 1px solid #0084ff',
                    'color: #ffffff',
                    'padding: 12px 20px',
                    'border-radius: 12px',
                    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    'font-size: 13px',
                    'font-weight: 600',
                    'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 16px rgba(0, 132, 255, 0.35)',
                    'display: flex',
                    'align-items: center',
                    'gap: 10px',
                    'backdrop-filter: blur(14px)',
                    'transition: opacity 0.3s ease, transform 0.3s ease',
                    'transform: translateY(-8px)',
                    'opacity: 0',
                    'pointer-events: none'
                ].join(';');
                const container = document.body || document.documentElement;
                if (container) container.appendChild(toast);
                requestAnimationFrame(() => {
                    toast.style.transform = 'translateY(0)';
                    toast.style.opacity = '1';
                });
            }
            toast.innerHTML = `<span style="font-size: 16px;">${icon}</span> <span>${message}</span>`;
            if (autoDismiss > 0) {
                setTimeout(() => {
                    if (toast && toast.parentNode) {
                        toast.style.opacity = '0';
                        toast.style.transform = 'translateY(-8px)';
                        setTimeout(() => toast.remove(), 350);
                    }
                }, autoDismiss);
            }
        };
        if (document.body || document.documentElement) render();
        else window.addEventListener('DOMContentLoaded', render);
    }

    // 1. Execução instantânea (Zero Delay / Cache-First)
    const cachedScript = GM_getValue(CACHE_KEY, null);
    if (cachedScript && typeof cachedScript === 'string' && cachedScript.trim().length > 100) {
        try {
            eval(cachedScript);
            console.log('[Netflix Enhanced Loader] Código em cache v' + extractVersion(cachedScript) + ' carregado instantaneamente.');
        } catch (err) {
            console.error('[Netflix Enhanced Loader] Erro ao executar script em cache:', err);
        }
    } else {
        showLoaderNotification('Baixando Netflix Enhanced v19.0 do GitHub...', '⏳', 0);
    }

    // 2. Sincronização remota em segundo plano
    function syncRemoteCode(isFirstRun = false, forceReload = false) {
        const bustUrl = REMOTE_URL + '?t=' + Date.now() + '&r=' + Math.random().toString(36).substring(7);

        GM_xmlhttpRequest({
            method: 'GET',
            url: bustUrl,
            headers: {
                'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache'
            },
            onload: function (res) {
                if (res.status === 200 && res.responseText && res.responseText.length > 500) {
                    const latestCode = res.responseText;
                    const oldVer = extractVersion(cachedScript);
                    const newVer = extractVersion(latestCode);

                    if (latestCode !== cachedScript) {
                        GM_setValue(CACHE_KEY, latestCode);
                        GM_setValue(CACHE_TIME_KEY, Date.now());
                        console.log(`[Netflix Enhanced Loader] ✨ Nova versão ${newVer} baixada e armazenada!`);

                        if (isFirstRun) {
                            try {
                                eval(latestCode);
                                showLoaderNotification(`Netflix Enhanced v${newVer} instalado com sucesso!`, '🎉');
                            } catch (err) {
                                console.error('[Netflix Enhanced Loader] Erro ao executar código baixado:', err);
                            }
                        } else {
                            showLoaderNotification(`Netflix Enhanced atualizado (v${oldVer} ➔ v${newVer})! Atualizando tela em 1.5s...`, '🚀', 2500);
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    } else {
                        console.log(`[Netflix Enhanced Loader] Script já está na versão mais recente (v${newVer}).`);
                        if (forceReload) {
                            showLoaderNotification(`Netflix Enhanced já está atualizado (v${newVer})!`, '✅');
                        }
                    }
                } else if (res.status !== 200) {
                    console.warn('[Netflix Enhanced Loader] Resposta inesperada do GitHub:', res.status);
                    if (forceReload) {
                        showLoaderNotification(`Falha ao checar GitHub (Status: ${res.status})`, '⚠️');
                    }
                }
            },
            onerror: function (err) {
                console.warn('[Netflix Enhanced Loader] Falha ao conectar ao GitHub:', err);
                if (forceReload) {
                    showLoaderNotification('Erro de conexão ao checar GitHub!', '❌');
                }
            }
        });
    }

    // Se não há cache, sincroniza e executa; se já há cache, sincroniza em background
    syncRemoteCode(!cachedScript);

    // Funções de verificação manual no console
    try {
        const globalTarget = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
        globalTarget.__updateNetflixEnhanced = (force = true) => {
            console.log('[Netflix Enhanced Loader] Forçando verificação remota...');
            syncRemoteCode(false, force);
        };
        globalTarget.__clearNetflixCache = () => {
            console.log('[Netflix Enhanced Loader] Limpando cache e recarregando...');
            GM_setValue(CACHE_KEY, null);
            GM_setValue(CACHE_TIME_KEY, 0);
            showLoaderNotification('Cache limpo! Recarregando página...', '🔄');
            setTimeout(() => window.location.reload(), 1000);
        };
        // Compatibilidade retroativa com __updateNetflixMod
        globalTarget.__updateNetflixMod = globalTarget.__updateNetflixEnhanced;
    } catch (_) {}

    // Atalho: Ctrl + Alt + U para forçar atualização e limpar cache
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && (e.key === 'u' || e.key === 'U')) {
            e.preventDefault();
            console.log('[Netflix Enhanced Loader] Atalho acionado: limpando cache...');
            GM_setValue(CACHE_KEY, null);
            GM_setValue(CACHE_TIME_KEY, 0);
            showLoaderNotification('Buscando versão mais recente...', '⚡');
            syncRemoteCode(true, true);
        }
    }, true);
})();
