// ===========================================
// NETFLIX DOM DIAGNOSTIC SCRIPT
// Cole isso no console do navegador enquanto
// estiver assistindo um vídeo na Netflix
// ===========================================

(function() {
    console.clear();
    console.log('%c=== NETFLIX DOM DIAGNOSTIC ===', 'color: #0084ff; font-size: 20px; font-weight: bold;');
    console.log('%cAnalisando estrutura dos controles...', 'color: #66b2ff; font-size: 14px;');
    console.log('');

    // 1. ENCONTRA TODOS OS ELEMENTOS COM data-uia
    const allUia = document.querySelectorAll('[data-uia]');
    console.log(`%c📦 Total de elementos com [data-uia]: ${allUia.length}`, 'color: #ffcc00; font-size: 14px;');
    console.log('');

    // 2. LISTA TODOS OS CONTROLES
    const controls = document.querySelectorAll('[data-uia^="control-"]');
    console.log(`%c🎮 CONTROLES ENCONTRADOS (data-uia^="control-"): ${controls.length}`, 'color: #00ff88; font-size: 16px; font-weight: bold;');
    
    controls.forEach((el, i) => {
        const uia = el.getAttribute('data-uia');
        const tag = el.tagName.toLowerCase();
        const classes = el.className;
        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);
        const parentTag = el.parentElement ? el.parentElement.tagName.toLowerCase() : 'none';
        const parentUia = el.parentElement ? el.parentElement.getAttribute('data-uia') : 'none';
        const parentClass = el.parentElement ? el.parentElement.className : 'none';
        
        console.groupCollapsed(`%c[${i}] ${uia} <${tag}>`, 'color: #ff8800; font-size: 13px;');
        console.log('  📍 data-uia:', uia);
        console.log('  🏷️ Tag:', tag);
        console.log('  🎨 Classes:', classes || '(nenhuma)');
        console.log('  📐 Dimensões:', `${Math.round(rect.width)}x${Math.round(rect.height)}px em (${Math.round(rect.left)}, ${Math.round(rect.top)})`);
        console.log('  👆 pointer-events:', computed.pointerEvents);
        console.log('  📍 position:', computed.position);
        console.log('  👁️ display:', computed.display);
        console.log('  🔢 z-index:', computed.zIndex);
        console.log('  🖱️ cursor:', computed.cursor);
        console.log('  📦 overflow:', computed.overflow);
        console.log('  ⬆️ Parent:', `<${parentTag}> data-uia="${parentUia}" class="${parentClass}"`);
        
        // Filhos diretos
        const children = Array.from(el.children);
        console.log(`  👶 Filhos diretos: ${children.length}`);
        children.forEach((child, ci) => {
            const childComputed = window.getComputedStyle(child);
            console.log(`    [${ci}] <${child.tagName.toLowerCase()}> class="${child.className}" data-uia="${child.getAttribute('data-uia')}" pointer-events=${childComputed.pointerEvents} display=${childComputed.display} size=${Math.round(child.getBoundingClientRect().width)}x${Math.round(child.getBoundingClientRect().height)}`);
            
            // Sub-filhos (2 níveis)
            Array.from(child.children).forEach((sub, si) => {
                const subComputed = window.getComputedStyle(sub);
                console.log(`      [${ci}.${si}] <${sub.tagName.toLowerCase()}> class="${sub.className}" data-uia="${sub.getAttribute('data-uia')}" pointer-events=${subComputed.pointerEvents} display=${subComputed.display} size=${Math.round(sub.getBoundingClientRect().width)}x${Math.round(sub.getBoundingClientRect().height)}`);
            });
        });
        
        // Verifica event listeners (React)
        const reactKey = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance') || k.startsWith('__reactProps'));
        if (reactKey) {
            const reactProps = el[Object.keys(el).find(k => k.startsWith('__reactProps'))];
            if (reactProps) {
                console.log('  ⚛️ React Props:', Object.keys(reactProps).filter(k => k.startsWith('on')));
                if (reactProps.onClick) console.log('  ✅ TEM onClick no React!');
                if (reactProps.onClickCapture) console.log('  ✅ TEM onClickCapture no React!');
            }
        }
        
        // Tenta encontrar o botão real dentro
        const innerButtons = el.querySelectorAll('button');
        if (innerButtons.length > 0) {
            console.log(`  🔘 Botões internos encontrados: ${innerButtons.length}`);
            innerButtons.forEach((btn, bi) => {
                const btnComputed = window.getComputedStyle(btn);
                const btnReactProps = btn[Object.keys(btn).find(k => k.startsWith('__reactProps'))];
                console.log(`    Button[${bi}]: aria-label="${btn.getAttribute('aria-label')}" pointer-events=${btnComputed.pointerEvents} cursor=${btnComputed.cursor} hasOnClick=${!!(btnReactProps && btnReactProps.onClick)}`);
            });
        }
        
        console.groupEnd();
    });

    // 3. BUSCA ESPECÍFICA: PLAY/PAUSE
    console.log('');
    console.log('%c▶️ BUSCA ESPECÍFICA: PLAY/PAUSE', 'color: #ff0088; font-size: 16px; font-weight: bold;');
    
    const playSelectors = [
        '[data-uia="control-play-pause-play"]',
        '[data-uia="control-play-pause-pause"]',
        '[data-uia^="control-play-pause"]',
        'button[aria-label*="play" i]',
        'button[aria-label*="pause" i]',
        'button[aria-label*="reproduzir" i]',
        'button[aria-label*="pausar" i]',
        'button[aria-label*="Play" i]',
        'button[aria-label*="Pause" i]',
    ];
    
    playSelectors.forEach(sel => {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
            els.forEach(el => {
                const computed = window.getComputedStyle(el);
                console.log(`  ✅ ENCONTRADO: ${sel} → <${el.tagName.toLowerCase()}> aria-label="${el.getAttribute('aria-label')}" data-uia="${el.getAttribute('data-uia')}" pointer-events=${computed.pointerEvents} cursor=${computed.cursor} position=${computed.position} size=${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);
                
                // Verifica toda a cadeia de ancestors
                let ancestor = el.parentElement;
                let depth = 0;
                while (ancestor && depth < 8) {
                    const aComputed = window.getComputedStyle(ancestor);
                    if (aComputed.pointerEvents === 'none') {
                        console.log(`    ⚠️ BLOQUEIO: Ancestor [depth=${depth}] <${ancestor.tagName.toLowerCase()}> class="${ancestor.className.substring(0, 60)}" tem pointer-events: none!`);
                    }
                    ancestor = ancestor.parentElement;
                    depth++;
                }
            });
        } else {
            console.log(`  ❌ NÃO ENCONTRADO: ${sel}`);
        }
    });

    // 4. BUSCA ESPECÍFICA: BACK10 / FORWARD10
    console.log('');
    console.log('%c⏪⏩ BUSCA ESPECÍFICA: BACK10 / FORWARD10', 'color: #ff0088; font-size: 16px; font-weight: bold;');
    
    const skipSelectors = [
        '[data-uia="control-back10"]',
        '[data-uia="control-forward10"]',
        'button[aria-label*="10" i]',
        'button[aria-label*="voltar" i]',
        'button[aria-label*="avançar" i]',
        'button[aria-label*="rewind" i]',
        'button[aria-label*="forward" i]',
        'button[aria-label*="back" i]',
        'button[aria-label*="seek" i]',
    ];
    
    skipSelectors.forEach(sel => {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
            els.forEach(el => {
                const computed = window.getComputedStyle(el);
                const reactProps = el[Object.keys(el).find(k => k.startsWith('__reactProps'))];
                console.log(`  ✅ ENCONTRADO: ${sel} → <${el.tagName.toLowerCase()}> aria-label="${el.getAttribute('aria-label')}" data-uia="${el.getAttribute('data-uia')}" pointer-events=${computed.pointerEvents} cursor=${computed.cursor} hasOnClick=${!!(reactProps && reactProps.onClick)}`);
            });
        } else {
            console.log(`  ❌ NÃO ENCONTRADO: ${sel}`);
        }
    });

    // 5. CONTAINER DOS CONTROLES
    console.log('');
    console.log('%c📦 CONTAINERS DOS CONTROLES', 'color: #ff0088; font-size: 16px; font-weight: bold;');
    
    const containerSelectors = [
        '.watch-video--bottom-controls-container',
        '.watch-video--player-view',
        '[class*="PlayerControls"]',
        '[class*="player-controls"]',
        '[class*="ControlsContainer"]',
        '[class*="bottom-controls"]',
    ];
    
    containerSelectors.forEach(sel => {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
            els.forEach(el => {
                const computed = window.getComputedStyle(el);
                console.log(`  ✅ ENCONTRADO: ${sel} → pointer-events=${computed.pointerEvents} position=${computed.position} display=${computed.display} children=${el.children.length}`);
            });
        } else {
            console.log(`  ❌ NÃO ENCONTRADO: ${sel}`);
        }
    });

    // 6. BUSCA POR TODOS OS BOTÕES NA ÁREA DO PLAYER
    console.log('');
    console.log('%c🔘 TODOS OS BOTÕES NO .watch-video', 'color: #ff0088; font-size: 16px; font-weight: bold;');
    
    const watchVideo = document.querySelector('.watch-video');
    if (watchVideo) {
        const allButtons = watchVideo.querySelectorAll('button');
        console.log(`  Total de botões: ${allButtons.length}`);
        allButtons.forEach((btn, i) => {
            const computed = window.getComputedStyle(btn);
            const rect = btn.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) { // Só botões visíveis
                const reactProps = btn[Object.keys(btn).find(k => k.startsWith('__reactProps'))];
                const reactHandlers = reactProps ? Object.keys(reactProps).filter(k => k.startsWith('on')) : [];
                console.log(`  [${i}] aria-label="${btn.getAttribute('aria-label')}" data-uia="${btn.getAttribute('data-uia')}" class="${btn.className.substring(0, 50)}" size=${Math.round(rect.width)}x${Math.round(rect.height)} pointer-events=${computed.pointerEvents} cursor=${computed.cursor} handlers=[${reactHandlers.join(',')}]`);
            }
        });
    } else {
        console.log('  ❌ .watch-video não encontrado!');
    }

    // 7. VERIFICA ELEMENTOS QUE COBREM OS BOTÕES (overlay check)
    console.log('');
    console.log('%c🔍 TESTE DE CLIQUE (elementFromPoint)', 'color: #ff0088; font-size: 16px; font-weight: bold;');
    
    const testTargets = [
        { name: 'Play/Pause', sel: '[data-uia^="control-play-pause"]' },
        { name: 'Back10', sel: '[data-uia="control-back10"]' },
        { name: 'Forward10', sel: '[data-uia="control-forward10"]' },
        { name: 'Volume', sel: '[data-uia^="control-volume"]' },
        { name: 'Fullscreen', sel: '[data-uia^="control-fullscreen"]' },
        { name: 'Skip Intro', sel: '[data-uia="player-skip-intro"]' },
        { name: 'Skip Recap', sel: '[data-uia="player-skip-recap"]' },
        { name: 'Next Episode', sel: '[data-uia="next-episode-seamless-button"]' },
        { name: 'Next Ep Container', sel: '[data-uia="next-episode-seamless-button-container"]' },
    ];
    
    testTargets.forEach(({ name, sel }) => {
        const el = document.querySelector(sel);
        if (el) {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const topEl = document.elementFromPoint(centerX, centerY);
            
            if (topEl === el || el.contains(topEl)) {
                console.log(`  ✅ ${name}: Clicável! elementFromPoint retorna o próprio botão ou filho.`);
                console.log(`     → Elemento no topo: <${topEl.tagName.toLowerCase()}> class="${String(topEl.className).substring(0, 60)}" data-uia="${topEl.getAttribute('data-uia')}"`);
            } else {
                console.log(`  ❌ ${name}: BLOQUEADO! Outro elemento está na frente!`);
                console.log(`     → Esperado: <${el.tagName.toLowerCase()}> data-uia="${el.getAttribute('data-uia')}"`);
                console.log(`     → Recebido: <${topEl.tagName.toLowerCase()}> class="${String(topEl.className).substring(0, 80)}" data-uia="${topEl.getAttribute('data-uia')}"`);
                
                // Verifica z-index do bloqueador
                const blockComputed = window.getComputedStyle(topEl);
                console.log(`     → z-index do bloqueador: ${blockComputed.zIndex}, position: ${blockComputed.position}`);
            }
        } else {
            console.log(`  ⚠️ ${name}: Elemento ${sel} não encontrado no DOM.`);
        }
    });

    // 8. DUMP COMPLETO DA HIERARQUIA DO PLAY
    console.log('');
    console.log('%c🌳 ÁRVORE DOM DO PLAY/PAUSE (5 níveis)', 'color: #ff0088; font-size: 16px; font-weight: bold;');
    
    const playBtn = document.querySelector('[data-uia^="control-play-pause"]');
    if (playBtn) {
        function dumpTree(el, depth = 0) {
            if (depth > 5) return;
            const indent = '  '.repeat(depth + 1);
            const computed = window.getComputedStyle(el);
            const reactProps = el[Object.keys(el).find(k => k.startsWith('__reactProps'))];
            const handlers = reactProps ? Object.keys(reactProps).filter(k => k.startsWith('on')).join(',') : '';
            console.log(`${indent}<${el.tagName.toLowerCase()}> data-uia="${el.getAttribute('data-uia')}" class="${(el.className || '').toString().substring(0, 40)}" pe=${computed.pointerEvents} cursor=${computed.cursor} handlers=[${handlers}]`);
            Array.from(el.children).forEach(child => dumpTree(child, depth + 1));
        }
        dumpTree(playBtn);
    }

    // 9. DEDICADO: DIAGNÓSTICO DA ÁRVORE DO VOLUME NATIVO
    console.log('');
    console.log('%c🔊 ANÁLISE COMPLETA DO CONTROLE DE VOLUME NATIVO', 'color: #0084ff; font-size: 16px; font-weight: bold;');
    const knob = document.querySelector('[data-uia="scrubber-knob"], [data-uia="volume-current"], [data-uia="volume-slider"]');
    if (knob) {
        console.log('✅ Knob ou Rail do volume encontrado!');
        let el = knob;
        let depth = 0;
        while (el && el !== document.body && depth < 12) {
            const comp = window.getComputedStyle(el);
            console.groupCollapsed(`%cLevel [${depth}] <${el.tagName.toLowerCase()}> data-uia="${el.getAttribute('data-uia')}" class="${el.className}"`, 'color: #ff9900; font-weight: bold;');
            console.log('  Tag:', el.tagName.toLowerCase());
            console.log('  data-uia:', el.getAttribute('data-uia'));
            console.log('  class:', el.className);
            console.log('  id:', el.id || '(nenhum)');
            console.log('  Inline Style Display:', el.style.display || '(não definido)');
            console.log('  Inline Style Visibility:', el.style.visibility || '(não definido)');
            console.log('  Inline Style Opacity:', el.style.opacity || '(não definido)');
            console.log('  Computed Display:', comp.display);
            console.log('  Computed Visibility:', comp.visibility);
            console.log('  Computed Opacity:', comp.opacity);
            console.log('  Computed Pointer-Events:', comp.pointerEvents);
            console.log('  Computed Dimensions:', `${el.offsetWidth}x${el.offsetHeight}px`);
            console.groupEnd();
            el = el.parentElement;
            depth++;
        }
    } else {
        console.log('❌ Nenhum elemento de volume nativo ([data-uia="scrubber-knob"], etc.) encontrado no DOM!');
    }

    console.log('');
    console.log('%c=== FIM DO DIAGNÓSTICO ===', 'color: #0084ff; font-size: 20px; font-weight: bold;');
    console.log('%cCopie TODA esta saída e envie para análise!', 'color: #ffcc00; font-size: 14px;');
})();
