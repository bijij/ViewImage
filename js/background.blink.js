'use-strict';

import setupContextMenu from './background.base.js';

const DEBUG = false;

chrome.runtime.onInstalled.addListener(setupContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (DEBUG)
        console.log('ViewImage: Search By Image context menu item clicked.', info, tab);

    if (info.menuItemId === 'ViewImage-SearchByImage') {
        chrome.storage.sync.get(['options', 'defaultOptions'], function (storage) {
            const options = Object.assign(storage.defaultOptions, storage.options);

            if (options['context-menu-search-by-image-new-tab']) {
                chrome.tabs.executeScript(tab.id, {
                    code: `window.open('https://lens.google.com/uploadbyurl?url=${encodeURIComponent(info.srcUrl)}', '_blank').focus();`
                });
            } else {
                chrome.tabs.executeScript(tab.id, {
                    code: `window.location.href = 'https://lens.google.com/uploadbyurl?url=${encodeURIComponent(info.srcUrl)}';`
                });
            }
        });
    }
});
