// Default options
const defaultOptions = {
    'open-in-new-tab': true
};

// Save default options to storage if they don't already exist
chrome.storage.sync.get('defaultOptions', function (storage) {
    if (!storage.defaultOptions) {
        chrome.storage.sync.set({ defaultOptions });
    }
});
