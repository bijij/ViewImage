'use strict';

// Current options extend defaults
let defaultOptions;
let options;

function toI18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
}

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

    var showContextMenuToggle = document.getElementById('context-menu-search-by-image');
    var openNewTabToggle = document.getElementById('context-menu-search-by-image-new-tab-toggle');

    if (showContextMenuToggle.checked) {
        openNewTabToggle.classList.remove('disabled');
    } else {
        openNewTabToggle.classList.add('disabled');
    }

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

const update_context_menu = function (enabled) {
    if (enabled) {
        chrome.contextMenus.create(
            {
                'id': 'ViewImage-SearchByImage',
                'title': toI18n('__MSG_searchImage__'),
                'contexts': ['image'],
            }
        );
    } else {
        chrome.contextMenus.remove('ViewImage-SearchByImage');
    }
};

// On change, save
document.addEventListener('change', event => {

    // Update the visibility of the context menu
    if (event.target.id === 'context-menu-search-by-image') {
        update_context_menu(event.target.checked);
    }

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
