// ==UserScript==
// @name         Better Wattpad Interface
// @namespace    https://greasyfork.org/
// @version      1.6.9
// @description  Clean Wattpad's interface, remove distractions, and expand reading area for a smooth, AO3-style experience. Combined the efforts of the "Simplified Wattpad" userscript by @sharkcat and the "Wattpad Width Fixer and Suggestions Hider" userscript by @You with additional tweaks.
// @author       Myst1cX
// @match        https://www.wattpad.com/*
// @grant        none
// @license      GPL-3.0
// @require      https://code.jquery.com/jquery-3.7.0.min.js
// @homepageURL  https://github.com/Myst1cX/better-wattpad-interface
// @supportURL   https://github.com/Myst1cX/better-wattpad-interface/issues
// @updateURL    https://raw.githubusercontent.com/Myst1cX/better-wattpad-interface/main/better-wattpad-interface.user.js
// @downloadURL  https://raw.githubusercontent.com/Myst1cX/better-wattpad-interface/main/better-wattpad-interface.user.js
// ==/UserScript==

var userPreferenceAdditionalPaddingPX = "0"; // Optional additional padding on the right margin

(function() {
    'use strict';

    // Waits for a specific element to load, then runs the callback
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

    // Injects CSS into the page
    function insertCss(code) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = code;
        document.head.appendChild(style);
    }

    // Wait until the paragraph element is available to measure padding
    waitForElement('#story-reading .page p', () => {
        const commentBubblePaddingWidth = window.getComputedStyle(
            document.querySelector('#story-reading .page p')
        ).getPropertyValue('padding-right').split("px")[0];

        insertCss('#sticky-end{width:auto;}'); // Adjust bottom bar width
        insertCss('.panel-reading{margin-left:'+(parseInt(commentBubblePaddingWidth,10)+parseInt(userPreferenceAdditionalPaddingPX,10))+'px;width:auto;}'); // Adjust reading panel margins
        insertCss('#story-reading .page p{margin-right:'+userPreferenceAdditionalPaddingPX+'px}'); // Adjust text paragraph margin
        insertCss('.left-rail, .right-rail{display:none;}'); // Hide left and right sidebars
        insertCss('.modal-open{overflow:inherit;}'); // Allow scroll when modal is open
    });

    // Helper to inject full CSS block
    const insertCSS = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    // Bulk CSS removal for distractions
    insertCSS(`
        .youll-also-like,                                /* "You’ll also like" section */
        .recommendations,                                /* Recommended stories */
        .story-extras,                                   /* Extras like comments, stats etc. */
        p:nth-of-type(1),                                /* First paragraph (often empty) */
        .new-stats__comments,                            /* New comment stats */
        .inline-recommendations,                         /* Inline story recs */
        .story-info__social,                             /* Share/social buttons */
        .paid-story-label,                               /* Label for paid stories */
        .site-footer,                                    /* Footer */
        .login-modal,                                    /* Login modal popup */
        .overlay,                                        /* Generic overlay */
        .recommendations-sidebar,                        /* Sidebar recommendations */
        .bottom-nav,                                     /* Bottom navigation bar */
        .right-sidebar,                                  /* Right sidebar content */
        .left-rail,                                      /* Left rail/sidebar */
        .right-rail,                                     /* Right rail/sidebar */
        .story__profile,                                 /* Author's profile box */
        .vote-button,                                    /* Vote button */
        #part-footer-actions,                            /* Footer buttons like comment/vote */
        .comment-marker,                                 /* Inline comment markers */
        .part-comments,                                  /* Entire comment block */
        #similar-stories.similar-stories,                /* Similar stories box */
        .similar-stories-footer,                         /* Footer under similar stories */
        .hidden-sm.hidden-xs.vertical.share-tools,       /* Floating social buttons */
        .on-comments.comments,                           /* Comments section */
        .panel-title                                     /* Redundant panel headers */
        {
            display: none !important;
        }

        .modal-open {
            overflow: inherit !important; /* Prevent scroll locking */
        }

        h1.h2 {
            margin: 5px 30px !important;  /* Tweak title spacing */
        }
    `);

    // Move author info box to top of page
    function moveAuthorDetails() {
        const authorDeets = document.querySelector('.left-rail > #sticky-nav'); // Original author panel
        const alreadyMoved = document.querySelector('header > #sticky-nav');   // Prevent duplicate move

        if (authorDeets && !alreadyMoved) {
            const target = document.querySelector('header > .meta, header > .restart-part'); // Where to insert
            if (target) {
                target.insertAdjacentElement('beforebegin', authorDeets);
                authorDeets.style.display = 'block';
                authorDeets.style.position = 'relative';
                authorDeets.style.width = '100%';
                authorDeets.style.marginBottom = '15px';
            }
        }
    }

    moveAuthorDetails(); // Initial move

    // Re-run when DOM changes (e.g. new chapter loads)
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                moveAuthorDetails();
            }
        }
    });

    const targetNode = document.querySelector('#main-content') || document.body;
    if (targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }

    // jQuery DOM cleanup when document is ready
    $(document).ready(function () {
        $("p:nth-of-type(1)").remove(); // Remove first paragraph (often blank)
        $("story-extras").remove(); // Remove story extra panel
        $("on-comments.comments").remove(); // Remove comment section
        $("hidden-sm.hidden-xs.vertical.share-tools").remove(); // Floating social tools
        $("span.comments.on-comments").remove(); // Remove comment icons
        $("button.btn-no-background.comment-marker").remove(); // Remove inline comment buttons
        $("div.row.part-content.part-comments").remove(); // Remove comment block
        $("#similar-stories.similar-stories").remove(); // Remove similar stories box
        $("div.container.similar-stories-container.similar-stories-footer").remove(); // Remove similar stories footer
        $("#component-tagpagepaidstoriescontainer-tagpage-paid-stories-%2fstories%2ffantasy").remove(); // Remove paid stories recommendations
    });

})();
