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
