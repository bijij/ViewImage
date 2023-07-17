'use-strict';

import { toI18n } from './localise.js';

// Default options
const defaultOptions = {
    'open-in-new-tab': true,
    'open-search-by-in-new-tab': true,
    'show-globe-icon': true,
    'hide-images-subject-to-copyright': false,
    'manually-set-button-text': false,
    'no-referrer': false,
    'button-text-view-image': '',
    'button-text-search-by-image': '',
    'context-menu-search-by-image': true,
    'context-menu-search-by-image-new-tab': false,
};

// Save default options to storage
chrome.storage.sync.get('defaultOptions', function () {
    chrome.storage.sync.set({ defaultOptions });
});


export default function setupContextMenu() {
    chrome.storage.sync.get(['options', 'defaultOptions'], function (storage) {
        const options = Object.assign(storage.defaultOptions, storage.options);
    
        // Setup "Search by image" context menu item
        if (options['context-menu-search-by-image']) {
            chrome.contextMenus.create(
                {
                    'id': 'ViewImage-SearchByImage',
                    'title': toI18n('__MSG_searchImage__'),
                    'contexts': ['image'],
                }
            );
        }
    });    
}
