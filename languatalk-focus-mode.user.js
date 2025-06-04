// ==UserScript==
// @name         LanguaTalk Focus Mode
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  True fullscreen focus mode for LanguaTalk podcast player's transcript view.
// @author       You
// @match        *://*.languatalk.com/*
// @grant        none
// @homepageURL  https://github.com/Myst1cX/languatalk-focus-mode
// @supportURL   https://github.com/Myst1cX/languatalk-focus-mode/issues
// @updateURL    https://raw.githubusercontent.com/Myst1cX/languatalk-focus-mode/main/languatalk-focus-mode.user.js
// @downloadURL  https://raw.githubusercontent.com/Myst1cX/languatalk-focus-mode/main/languatalk-focus-mode.user.js
// ==/UserScript==

(function () {
    'use strict';

    const waitForElement = (selector, callback, interval = 100, timeout = 10000) => {
        const startTime = Date.now();
        const check = () => {
            const el = document.querySelector(selector);
            if (el) {
                callback(el);
            } else if (Date.now() - startTime < timeout) {
                setTimeout(check, interval);
            }
        };
        check();
    };

    function createToggleButton() {
        const btn = document.createElement('button');
        btn.innerText = 'Focus Mode';
        btn.id = 'focus-mode-toggle';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            padding: '10px 15px',
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        });
        document.body.appendChild(btn);
        return btn;
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

    function setFocusMode(active) {
        document.body.classList.toggle('focus-mode', active);

        const nestedContent = document.querySelector('.bottom-up-content > .bottom-up-content');
        if (nestedContent) {
            if (active) {
                nestedContent.style.display = 'block';
                nestedContent.style.maxHeight = 'none';
                nestedContent.style.opacity = '1';
                nestedContent.style.visibility = 'visible';
            } else {
                nestedContent.style.display = ''; // revert to default
                nestedContent.style.maxHeight = '';
                nestedContent.style.opacity = '';
                nestedContent.style.visibility = '';
            }
        }
    }

    waitForElement('.overflow-auto.podcast-transcript', () => {
        injectStyles();

        const btn = createToggleButton();
        let isActive = false;

        btn.addEventListener('click', () => {
            isActive = !isActive;
            btn.innerText = isActive ? 'Exit Focus Mode' : 'Focus Mode';
            setFocusMode(isActive);
        });
    });
})();
