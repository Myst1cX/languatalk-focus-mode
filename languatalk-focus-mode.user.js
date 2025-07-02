// ==UserScript==
// @name         LanguaTalk Focus Mode
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  True fullscreen focus mode for LanguaTalk podcast player's transcript view, with adjustable font size.
// @author       Myst1cX
// @match        *://*.languatalk.com/*
// @grant        none
// @homepageURL  https://github.com/Myst1cX/languatalk-focus-mode
// @supportURL   https://github.com/Myst1cX/languatalk-focus-mode/issues
// @updateURL    https://raw.githubusercontent.com/Myst1cX/languatalk-focus-mode/main/languatalk-focus-mode.user.js
// @downloadURL  https://raw.githubusercontent.com/Myst1cX/languatalk-focus-mode/main/languatalk-focus-mode.user.js
// ==/UserScript==

(function () {
    'use strict';

    const waitForElement = (selector, callback, timeout = 10000) => {
        const el = document.querySelector(selector);
        if (el) {
            callback(el);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const el = document.querySelector(selector);
            if (el) {
                obs.disconnect();
                callback(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => observer.disconnect(), timeout);
    };

    function createToggleButton() {
        const wrapper = document.createElement('div');
        wrapper.id = 'focus-mode-controls';
        Object.assign(wrapper.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });

        const btn = document.createElement('button');
        btn.innerText = 'Focus Mode';
        btn.id = 'focus-mode-toggle';
        Object.assign(btn.style, {
            padding: '10px 15px',
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        });

        const fontSizeSelect = document.createElement('select');
        fontSizeSelect.id = 'font-size-select';
        ['20px', '24px', '28px', '32px', '36px', '40px'].forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            fontSizeSelect.appendChild(option);
        });
        Object.assign(fontSizeSelect.style, {
    display: 'none',
    padding: '10px 40px 10px 15px',
    backgroundColor: '#222',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    fontSize: '14px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23fff" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px 20px',
});


        wrapper.appendChild(fontSizeSelect);
        wrapper.appendChild(btn);
        document.body.appendChild(wrapper);
        return { btn, fontSizeSelect };
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .focus-mode .content-main {
                position: fixed !important;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                display: flex;
                flex-direction: column;
                padding: 2rem;
                overflow: hidden;
            }

            .focus-mode .overflow-auto.podcast-transcript {
                flex: 1 1 auto;
                overflow-y: auto !important;
                margin-bottom: 120px;
                padding: 1rem;
                background: #fafafa;
                border-radius: 8px;
            }

            .focus-mode .plyr__controls {
                position: fixed !important;
                bottom: 65px !important;
                left: 0;
                right: 0;
                background: #fff;
                padding: 0.5rem 1rem;
                box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
            }

            .focus-mode .justify-content-center.content-buttons.d-flex {
                position: fixed !important;
                bottom: 0 !important;
                left: 0;
                right: 0;
                background: #fff;
                padding: 0.75rem 1rem;
                display: flex !important;
                justify-content: center !important;
                box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.05);
            }

            /* Hide clutter in focus mode */
            .focus-mode .pl-0.text-left.col-12,
            .focus-mode .footer-i > .row,
            .focus-mode .footer-i,
            .focus-mode .deep-footer,
            .focus-mode .rounded.sidebar-menu-content-mobile.mx-sm-3 > .element-box {
                 display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function setFontSize(size) {
        const transcript = document.querySelector('.overflow-auto.podcast-transcript');
        if (transcript) {
            transcript.style.fontSize = size;
        }
        localStorage.setItem('focusModeFontSize', size);
    }

    function getSavedFontSize() {
        return localStorage.getItem('focusModeFontSize') || '16px';
    }

    function setFocusMode(active, fontSizeSelect) {
        document.body.classList.toggle('focus-mode', active);
        fontSizeSelect.style.display = active ? 'inline-block' : 'none';

        const nestedContent = document.querySelector('.bottom-up-content > .bottom-up-content');
        if (nestedContent) {
            if (active) {
                nestedContent.style.display = 'block';
                nestedContent.style.maxHeight = 'none';
                nestedContent.style.opacity = '1';
                nestedContent.style.visibility = 'visible';
            } else {
                nestedContent.style.display = '';
                nestedContent.style.maxHeight = '';
                nestedContent.style.opacity = '';
                nestedContent.style.visibility = '';
            }
        }

        if (active) {
            setFontSize(getSavedFontSize());
        }
    }

    waitForElement('.overflow-auto.podcast-transcript', () => {
        injectStyles();

        const { btn, fontSizeSelect } = createToggleButton();
        let isActive = false;

        fontSizeSelect.value = getSavedFontSize();

        fontSizeSelect.addEventListener('change', () => {
            setFontSize(fontSizeSelect.value);
        });

        btn.addEventListener('click', () => {
            isActive = !isActive;
            btn.innerText = isActive ? 'Exit Focus Mode' : 'Focus Mode';
            setFocusMode(isActive, fontSizeSelect);
        });
    });
})();
