'use strict';

// Current options extend defaults
let defaultOptions;
let options;

// Load options from storage
const load = function () {
    return new Promise(function (resolve) {
        chrome.storage.sync.get('options', function (storage) {
            // Get and save options
            options = storage.options || Object.assign({}, defaultOptions);

            // Show and resolve
            show(options);
            resolve(options);
        });
    });
};

// Save options to storage
const save = function (object) {
    return new Promise(function (resolve) {
        chrome.storage.sync.set({
            'options': object
        }, resolve);
    });
};

// Update visibility of page elements;
const update_page = function () {

    var manualButtonToggle = document.getElementById('manually-set-button-text');
    var manualButtonText = document.getElementById('manual-toggle');

    if (manualButtonToggle.checked) {
        manualButtonText.classList.remove('disabled');
    } else {
        manualButtonText.classList.add('disabled');
    }
};

// Show options
const show = function (options) {
    for (const key in options) {
        var element = document.getElementById(key);
        if (element) {
            switch (typeof (options[key])) {
                case ('boolean'):
                    element.checked = options[key];
                    break;
                case ('string'):
                    element.value = options[key];
                    break;
            }
        }
    }

    update_page();
};

// Reset to defaults
const reset = function () {
    save(defaultOptions)
        .then(() => show(defaultOptions));
};


// Load default options once when page loads, then load user options
chrome.storage.sync.get('defaultOptions', function (storage) {
    // Get and save default options
    defaultOptions = storage.defaultOptions;

    // Load options
    load();
});

// On change, save
document.addEventListener('change', event => {
    switch (event.target.type) {
        case ('checkbox'):
            options[event.target.id] = event.target.checked;
            break;
        case ('text'):
            options[event.target.id] = event.target.value;
            break;
    }

    save(options);
    update_page();
});

// On reset button click
document.addEventListener('click', event => {
    if (event.target.id == 'reset-options') {
        reset();
    }
    update_page();
});
