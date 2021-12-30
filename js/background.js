const DEBUG = false;

function toI18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
}

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
};

// Save default options to storage
chrome.storage.sync.get('defaultOptions', function () {
    chrome.storage.sync.set({ defaultOptions });
});

// Setup "Search by image" context menu item
chrome.contextMenus.create(
    {
        'id': 'ViewImage-SearchByImage',
        'title': toI18n('__MSG_searchImage__'),
        'contexts': ['image'],
    }
);

chrome.contextMenus.onClicked.addListener(
    (info, tab) => {

        if (DEBUG)
            console.log('ViewImage: Search By Image context menu item clicked.', info, tab);

        if (info.menuItemId === 'ViewImage-SearchByImage') {
            chrome.permissions.request({
                permissions: ['tabs'],
                origins: [tab.url],
            }, (granted) => {
                if (granted) {
                    chrome.tabs.executeScript(tab.id, {
                        code: `window.location.href = 'http://www.google.com/searchbyimage?image_url=${encodeURIComponent(info.srcUrl)}'`
                    });
                }
            });
        }
    }
);
