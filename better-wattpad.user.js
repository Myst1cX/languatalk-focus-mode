// ==UserScript==
// @name         Better Wattpad
// @namespace    https://greasyfork.org/
// @version      1.6.9
// @description  Clean Wattpad's interface, remove distractions, expand reading area for a smooth, AO3-style experience and allow chapter downloads. Combined the efforts of the "Simplified Wattpad" userscript by @sharkcat, the "Wattpad Width Fixer and Suggestions Hider" userscript by @You, and the "Download Wattpad Chapter" userscript by @Dj Dragkan with additional tweaks.
// @author       Myst1cX
// @match        https://www.wattpad.com/*
// @grant        none
// @license      GPL-3.0
// @require      https://code.jquery.com/jquery-3.7.0.min.js
// @homepageURL  https://github.com/Myst1cX/better-wattpad
// @supportURL   https://github.com/Myst1cX/better-wattpad/issues
// @updateURL    https://raw.githubusercontent.com/Myst1cX/better-wattpad/main/better-wattpad.user.js
// @downloadURL  https://raw.githubusercontent.com/Myst1cX/better-wattpad/main/better-wattpad.user.js
// ==/UserScript==


/* the Download Wattpad Chapter userscript */

// @description  Downloaded chapters follow the naming scheme: "Book Title - Chapter Title".
// @downloadURL  https://update.greasyfork.org/scripts/491126/Download%20Wattpad%20Chapter.user.js
// @updateURL    https://update.greasyfork.org/scripts/491126/Download%20Wattpad%20Chapter.meta.js


(function() {
    'use strict';

    // Function to copy the text of an element to the clipboard
    function copyText(text) {
        navigator.clipboard.writeText(text)
            .catch(function() {
                alert('Error copying text.');
            });
    }

    // Function to download text as a text file with dynamic filename
    function downloadFile(text) {
    // Grab book title and chapter title from the page
    const bookTitle = document.querySelector('.h5.title')?.innerText.trim() || 'book';
    const chapterTitle = document.querySelector('.h2')?.innerText.trim() || 'chapter';

    // Function to remove illegal filename characters
    // Removes characters: \ / : * ? " < > |
    const omitIllegalChars = (str) => {
        return str.replace(/[\/\\:\*\?"<>\|]/g, '').trim();
    };

    // Sanitize titles by omitting illegal characters
    const safeBookTitle = omitIllegalChars(bookTitle);
    const safeChapterTitle = omitIllegalChars(chapterTitle);

    // Combine sanitized titles with dash
    const combinedTitle = `${safeBookTitle} - ${safeChapterTitle}`;

    // Create a Blob object with the text
    const blob = new Blob([text], { type: 'text/plain' });

    // Create a URL object for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${combinedTitle}.txt`;

    // Click the link to initiate the download
    downloadLink.click();

    // Revoke the URL object
    window.URL.revokeObjectURL(url);
}



    // Create a download chapter button
    function createDownloadChapterButton() {
        var downloadChapterButton = document.createElement('button');
        downloadChapterButton.innerText = 'DOWNLOAD CHAPTER';
        downloadChapterButton.style.position = 'fixed';
        downloadChapterButton.style.top = '10px';
        downloadChapterButton.style.left = '50%';
        downloadChapterButton.style.transform = 'translateX(-50%)';
        downloadChapterButton.style.zIndex = '9999';
        downloadChapterButton.style.backgroundColor = '#FFA500';
        downloadChapterButton.style.color = 'white';
        downloadChapterButton.style.fontWeight = 'bold';
        downloadChapterButton.style.border = 'none';
        downloadChapterButton.style.borderRadius = '5px';
        downloadChapterButton.style.padding = '10px 20px';
        downloadChapterButton.style.cursor = 'pointer';

        // Add the Wattpad icon to the button
        var wattpadIcon = document.createElement('img');
        wattpadIcon.src = 'https://www.wattpad.com/apple-touch-icon-114x114-precomposed.png';
        wattpadIcon.style.width = '20px'; // Adjust size as needed
        wattpadIcon.style.verticalAlign = 'middle'; // Align vertically with text
        downloadChapterButton.appendChild(wattpadIcon);

        // Add the button to the document body
        document.body.appendChild(downloadChapterButton);

        // Add click event to the button
        downloadChapterButton.addEventListener('click', function() {
            // Get all <p> elements with the data-p-id attribute
            var elements = document.querySelectorAll('p[data-p-id]');
            if (elements.length > 0) {
                var totalText = '';
                elements.forEach(function(element) {
                    totalText += element.innerText + '\n';
                });
                copyText(totalText);
                downloadFile(totalText);
            } else {
                alert('No <p> elements with the "data-p-id" attribute were found.');
            }
        });
    }

    // Call the function to create the download chapter button when the page loads
    window.addEventListener('load', createDownloadChapterButton);
})();


/* the Better Wattpad userscript (combination of the "Simplified Wattpad" userscript by @sharkcat and the "Wattpad Width Fixer and Suggestions Hider" userscript by @You with additional tweaks) */

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
        .youll-also-like,                                /* Removes the -You’ll also like- section */
        .recommendations,                                /* Removes the recommended stories */
        .new-stats__comments,                            /* Removes the new comment stats */
        .story-extras,                                   /* Remove the empty space between the "Follow" button and the header's line. */
        .inline-recommendations,                         /* Removes the inline story recommendations */
        .story-info__social,                             /* Removes the share/social buttons */
        .paid-story-label,                               /* Removes the label for paid stories */
        .site-footer,                                    /* Removes the site footer */
        .login-modal,                                    /* Removes the login page. To sign in, disable the userscript first or comment the line using // in front. Once logged in, uncomment the line. */
        .overlay,                                        /* Removes the generic overlay */
        .recommendations-sidebar,                        /* Removes the sidebar recommendations */
        .bottom-nav,                                     /* Removes the bottom navigation bar */
        .right-sidebar,                                  /* Removes the right sidebar content */
        .left-rail,                                      /* Removes the left rail/sidebar */
        .right-rail,                                     /* Removes the right rail/sidebar */
        .story__profile,                                 /* Removes the author's tiny profile box */
        .vote-button,                                    /* Removes the vote button */
        #part-footer-actions,                            /* Removes the footer buttons such as comment/vote */
        .comment-marker,                                 /* Removes the inline comment markers */
     /* .part-comments,   */                             /* Removes the comment section */
        #similar-stories.similar-stories,                /* Removes the similar stories box */
        .similar-stories-footer,                         /* Removes the footer under similar stories */
        .hidden-sm.hidden-xs.vertical.share-tools,       /* Removes the share menu with floating social tools */
     /* .on-comments.comments,   */                      /* Removes the comment icon under chapter name */
        .panel-title                                     /* Removes the redundant panel headers */
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
        $("story-extras").remove(); // Removes the empty space between the "Follow" button and the header's line.
     // $("on-comments.comments").remove(); // Removes the comment icon under chapter name
        $("hidden-sm.hidden-xs.vertical.share-tools").remove(); // Removes the share menu with floating social tools
     // $("span.comments.on-comments").remove(); // Removes the comment icon under chapter name
        $("button.btn-no-background.comment-marker").remove(); // Removes inline comment buttons
     // $("div.row.part-content.part-comments").remove(); // Removes the comment section
        $("#similar-stories.similar-stories").remove(); // Removes similar stories box
        $("div.container.similar-stories-container.similar-stories-footer").remove(); // Removes similar stories footer
        $("#component-tagpagepaidstoriescontainer-tagpage-paid-stories-%2fstories%2ffantasy").remove(); // Removes paid stories recommendations
    });

})();
