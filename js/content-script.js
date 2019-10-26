'use strict';

const DEBUG = false;

const VERSIONS = {
    FEB18: 'FEB18',
    JUL19: 'JUL19',
    OCT19: 'OCT19'
}

function toI18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
}


function localiseObject(obj, tag) {
    var msg = toI18n(tag);
    if (msg != tag) obj.innerHTML = msg;
}


// Finds the div which contains all required elements
function getContainer(node) {
    var container, version;
    [
        ['.irc_c[style*="visibility: visible;"][style*="transform: translate3d(0px, 0px, 0px);"]', VERSIONS.FEB18],
        ['.irc_c[data-ved]', VERSIONS.JUL19],
        ['.A8mJGd', VERSIONS.OCT19]
    ].forEach(element => {
        if (node.closest(element[0])) {
            [container, version] = [node.closest(element[0]), element[1]];
        }
    });
    return [container, version];
}


// Finds and deletes all extension related elements.
function clearExtElements(container) {
    // Remove previously generated elements
    var oldExtensionElements = container.querySelectorAll('.vi_ext_addon');
    for (var element of oldExtensionElements) {
        element.remove();
    }
}


// Returns the image URL
function findImage(container, version) {

    var image = null;

    switch (version) {
        case VERSIONS.FEB18:
            image = container.querySelector('img[src]#irc_mi, img[alt^="Image result"][src]:not([src^="https://encrypted-tbn"]).irc_mut, img[src].irc_mi');
            break;
        case VERSIONS.JUL19:
            var iframe = container.querySelector('iframe.irc_ifr');
            if (!iframe)
                return findImage(container, false);
            image = iframe.contentDocument.querySelector('img#irc_mi');
            break;
        case VERSIONS.OCT19:
            image = container.querySelector('img[src].n3VNCb');
            break;
    }

    // Override url for images using base64 embeds
    if (image === null || image.src === '' || image.src.startsWith('data')) {
        var thumbnail = document.querySelector('img[name="' + container.dataset.itemId + '"]');
        if (thumbnail === null) {
            // If no thumbnail found, try getting image from URL
            var url = new URL(window.location);
            var imgLink = url.searchParams.get('imgurl');
            if (imgLink) {
                image = new Object();
                image.src = imgLink;
            }
        } else {
            var meta = thumbnail.closest('.rg_bx').querySelector('.rg_meta');

            var metadata = JSON.parse(meta.innerHTML);

            image = new Object();
            image.src = metadata.ou;
        }
    }

    // If the above doesn't work, use the link in related images to find it
    if (image === null || image.src === '' || image.src.startsWith('data')) {
        var target_image = container.querySelector('img.target_image');
        if (target_image) {
            var link = target_image.closest('a');
            if (link) {
                // Some extensions replace google image links with their original links
                if (link.href.match(/^[a-z]+:\/\/(?:www\.)?google\.[^/]*\/imgres\?/)) {
                    var link_url = new URL(link.href);
                    var new_imgLink = link_url.searchParams.get('imgurl');
                    if (new_imgLink) {
                        image = new Object();
                        image.src = new_imgLink;
                    }
                } else {
                    image = new Object();
                    image.src = link.href;
                }
            }
        }
    }
    return image;
}


function addViewImageButton(container, image, version) {

    // get the visit buttonm
    var visitButton;
    switch (version) {
        case VERSIONS.FEB18:
            visitButton = container.querySelector('td > a.irc_vpl[href]').parentElement;
            break;
        case VERSIONS.JUL19:
            visitButton = container.querySelector('a.irc_hol[href]');
            break;
        case VERSIONS.OCT19:
            visitButton = container.querySelector('.ZsbmCf[href]')
            break;
    }

    // Create the view image button
    var viewImageButton = visitButton.cloneNode(true);
    viewImageButton.classList.add('vi_ext_addon');

    // Set the view image button url
    var viewImageLink;
    switch (version) {
        case VERSIONS.FEB18:
            viewImageLink = viewImageButton.querySelector('a');
            break;
        default:
            viewImageLink = viewImageButton;
    }

    viewImageLink.href = image.src;
    if (version == VERSIONS.OCT19) {
        viewImageLink.removeAttribute('jsaction');
    }

    // Set additional options
    if (options['open-in-new-tab']) {
        viewImageLink.setAttribute('target', '_blank');
    }
    if (options['no-referrer']) {
        viewImageLink.setAttribute('rel', 'noreferrer');
    }

    // Set the view image button text
    var viewImageButtonText;
    switch (version) {
        case VERSIONS.FEB18:
            viewImageButtonText = viewImageButton.querySelector('.Tl8XHc');
            break;
        case VERSIONS.JUL19:
            viewImageButtonText = viewImageButton.querySelector('.irc_ho');
            break;
        case VERSIONS.OCT19:
            viewImageButtonText = viewImageButton.querySelector('.pM4Snf');
            break;
    }


    if (options['manually-set-button-text']) {
        viewImageButtonText.innerText = options['button-text-view-image'];
    } else {
        localiseObject(viewImageButtonText, '__MSG_viewImage__');
    }

    // Remove globe icon if not wanted
    if (!options['show-globe-icon']) {
        viewImageButton.querySelector(version ? '.aDEWOd' : '.RL3J9c').remove();
    }

    // Place the view image button
    visitButton.parentElement.insertBefore(viewImageButton, visitButton);
    visitButton.parentElement.insertBefore(visitButton, viewImageButton);
}


function addSearchImageButton(container, image, version) {

    var link;
    switch (version) {
        case VERSIONS.FEB18:
            link = container.querySelector('.irc_dsh > a.irc_hol');
            break;
        case VERSIONS.JUL19:
            link = container.querySelector('.irc_ft > a.irc_help');
            break;
        case VERSIONS.OCT19:
            link = container.querySelector('.PvkmDc');
            break;
    }

    // Create the search by image button
    var searchImageButton = link.cloneNode(true);
    searchImageButton.classList.add('vi_ext_addon');

    // Set the more sizes button text
    var searchImageButtonText;
    switch (version) {
        case VERSIONS.FEB18:
            searchImageButtonText = container.querySelector('span');
            break;
        case VERSIONS.JUL19:
            searchImageButtonText = container.querySelector('.irc_ho');
            break;
        case VERSIONS.OCT19:
            searchImageButtonText = searchImageButton;
            break;
    }

    if (options['manually-set-button-text']) {
        searchImageButtonText.innerText = options['button-text-search-by-image'];
    } else {
        localiseObject(searchImageButtonText, '__MSG_searchImage__');
    }

    // Set the search by image button url
    searchImageButton.href = '/searchbyimage?image_url=' + image.src;

    // Set additional options
    if (options['open-search-by-in-new-tab']) {
        searchImageButton.setAttribute('target', '_blank');
    }

    // Place the more sizes button
    link.parentElement.insertBefore(searchImageButton, link);
    link.parentElement.insertBefore(link, searchImageButton);

}


// Adds links to an object
function addLinks(node) {

    if (DEBUG)
        console.log('ViewImage: Trying to add links to node: ', node);

    // Find the container
    var [container, version] = getContainer(node);

    // Return if no container was found
    if (!container) {
        if (DEBUG)
            console.log('ViewImage: Adding links failed, container was not found.');
        return;
    }

    if (DEBUG)
        console.log('ViewImage: Assuming site version: ', version);

    // Clear any old extension elements
    clearExtElements(container);

    // Find the image url
    var image = findImage(container, version);

    // Return if image was not found
    if (!image) {

        if (DEBUG)
            console.log('ViewImage: Adding links failed, image was not found.');

        return;
    }

    addViewImageButton(container, image, version);
    addSearchImageButton(container, image, version);
}


// Define the mutation observers
var observer = new MutationObserver(function (mutations) {

    if (DEBUG)
        console.log('ViewImage: Mutations detected: ', mutations);

    for (var mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (var node of mutation.addedNodes) {
                if (node.classList) {
                    // Check for new image nodes
                    if (['irc_mi', 'irc_mut', 'irc_ris', 'A8mJGd', 'n3VNCb'].some(className => node.classList.contains(className))) {
                        addLinks(node);
                    }
                }
            }
        }
    }
});

// Get options and start adding links
var options;
chrome.storage.sync.get(['options', 'defaultOptions'], function (storage) {
    options = Object.assign(storage.defaultOptions, storage.options);

    if (DEBUG)
        console.log('ViewImage: Initialising observer...');

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});


// inject CSS into document
if (DEBUG)
    console.log('ViewImage: Injecting CSS...');

var customStyle = document.createElement('style');
customStyle.innerText = '.irc_dsh>.irc_hol.vi_ext_addon,.irc_ft>.irc_help.vi_ext_addon,.PvkmDc.vi_ext_addon{margin: 0 4pt!important}.irc_hol.vi_ext_addon{flex-grow:0!important}.ZsbmCf.vi_ext_addon{flex-grow:0}';
document.head.appendChild(customStyle);
