'use strict';

// Current options extend defaults
let defaultOptions;
let options;

// Load options from storage
const load = function() {
    return new Promise(function(resolve) {
        chrome.storage.sync.get('options', function(storage) {
            // Get and save options
            options = storage.options || defaultOptions;

            // Show and resolve
            show(options);
            resolve(options);
        });
    });
};

// Save options to storage
const save = function(object) {
    return new Promise(function(resolve) {
        chrome.storage.sync.set({
            'options': object
        }, resolve);
    });
};

// Show options
const show = function(options) {
    for (const key in options) {
        if (options.hasOwnProperty(key)) {
            document.getElementById(key).checked = options[key];
        }
    }
};

// Reset to defaults
// TODO: attach to reset button
const reset = function() {
    save(defaultOptions)
        .then(() => show(defaultOptions));
};


// Load default options once when page loads, then load user options
chrome.storage.sync.get('defaultOptions', function(storage) {
    // Get and save default options
    defaultOptions = storage.defaultOptions;

    // Load options
    load();
});

// On change, save
document.addEventListener('input', event => {
    options[event.target.id] = event.target.checked;
    save(options);
});
