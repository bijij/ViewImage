'use strict';

const DEBUG = false;
const TRACE = DEBUG && false;

const VERSIONS = {
    FEB18: 'FEB18',
    JUL19: 'JUL19',
    OCT19: 'OCT19'
};

var images = new Object();
var options;

function toI18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (_, v1) {
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
        ['.tvh9oe[style*="display: block;"]', VERSIONS.OCT19]
    ].forEach(element => {
        var child = node.querySelector(element[0]);
        if (child) {
            [container, version] = [child, element[1]];
        }

        var closest = node.closest(element[0]);
        if (closest) {
            [container, version] = [closest, element[1]];
        }
    });
    return [container, version];
}


// Finds and deletes all extension related elements.
function clearExtElements() {
    // Remove previously generated elements
    var oldExtensionElements = document.querySelectorAll('.vi_ext_addon');
    for (var element of oldExtensionElements) {
        element.remove();
    }
}


// Returns true if the node is visible
function nodeIsVisible(node) {
    const rect = node.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.width > 0 &&
        rect.height > 0
    );
}


// Returns the image URL
function findImageURL(container, version) {

    var image = null;

    switch (version) {
        case VERSIONS.FEB18:
            image = container.querySelector('img[src]#irc_mi, img[alt^="Image result"][src]:not([src^="https://encrypted-tbn"]).irc_mut, img[src].irc_mi');
            break;
        case VERSIONS.JUL19:
            var iframe = container.querySelector('iframe.irc_ifr');
            if (!iframe)
                return findImageURL(container, VERSIONS.FEB18);
            image = iframe.contentDocument.querySelector('img#irc_mi');
            break;
        case VERSIONS.OCT19:
            image = container.querySelector('img[src][style][jsaction]');
            if (image.src in images) {
                return images[image.src];
            }
    }

    // Override url for images using base64 embeds
    if (image === null || image.src === '' || image.src.startsWith('data')) {
        var thumbnail = document.querySelector('img[name="' + container.dataset.itemId + '"]');
        if (thumbnail === null) {
            // If no thumbnail found, try getting image from URL
            var url = new URL(window.location);
            var imgLink = url.searchParams.get('imgurl');
            if (imgLink) {
                return imgLink;
            }
        } else {
            var meta = thumbnail.closest('.rg_bx').querySelector('.rg_meta');
            var metadata = JSON.parse(meta.innerHTML);
            return metadata.ou;
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
                        return new_imgLink;
                    }
                } else {
                    return link.href;
                }
            }
        }
    }

    if (image) {
        return image.src;
    }

}

function addViewImageButton(container, node, imageURL, version) {

    // get the visit button
    var visitButton;
    switch (version) {
        case VERSIONS.FEB18:
            visitButton = container.querySelector('td > a.irc_vpl[href]').parentElement;
            break;
        case VERSIONS.JUL19:
            visitButton = container.querySelector('a.irc_hol[href]');
            break;
        case VERSIONS.OCT19:
            var nodeRoot = node.parentElement.parentElement;

            var visitButtons = [
                nodeRoot?.parentElement?.nextSibling?.querySelector?.('a > div > span + svg')?.parentElement?.parentElement,
                nodeRoot?.parentElement?.nextSibling?.nextSibling?.querySelector?.('a > div > span + svg')?.parentElement?.parentElement,
                nodeRoot?.nextSibling?.nextSibling?.querySelector?.('a > div > span + svg')?.parentElement?.parentElement,
                nodeRoot?.querySelector?.(':scope > div:not([aria-hidden])')?.querySelector?.('a > div > span + svg')?.parentElement?.parentElement, // Facebook results are different
            ];

            if (DEBUG)
                console.log('Possible visit buttons:', visitButtons);

            visitButton = visitButtons.find(button => button !== null && button !== undefined && button.tagName == 'A');
            break;
    }

    if (!visitButton) {
        if (DEBUG)
            console.log('ViewImage: Adding View-Image button failed, visit button was not found.');
        return false;
    }

    if (DEBUG)
        console.log('ViewImage: Adding View-Image button to node: ', node, ' with visit button: ', visitButton);


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

    if (imageURL && !imageURL.startsWith('https://encrypted-tbn0.gstatic.com')) {
        if (DEBUG)
            console.log('ViewImage: Adding View-Image button with URL: ', imageURL);

        viewImageLink.href = imageURL;
    } else {
        // Display button as disabled if no image was found

        if (DEBUG)
            console.log('ViewImage: Adding Disabled View-Image button with no URL');

        viewImageLink.style = 'pointer-events: none;';
        viewImageLink.title = "No full-sized image was found."

        var viewImageDiv = viewImageLink.querySelector('div');
        if (viewImageDiv) {
            viewImageDiv.style = 'background-color: #707070; border-color: #707070;';
        }
    }

    if (version == VERSIONS.OCT19) {
        viewImageLink.removeAttribute('jsaction');
    }

    viewImageLink.removeAttribute('target');

    // Set additional options
    if (options['open-in-new-tab']) {
        viewImageLink.setAttribute('target', '_blank');
    }
    if (options['no-referrer']) {
        viewImageLink.setAttribute('rel', 'noreferrer');
    }

    if (imageURL.startsWith('data')) {
        viewImageButton.setAttribute('download', '');
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
            viewImageButtonText = viewImageButton.querySelector('.pM4Snf, .KSvtLc, .Pw5kW, .q7UPLe, .K8E1Be, .pFBf7b, span');
            break;
    }

    if (options['manually-set-button-text']) {
        viewImageButtonText.innerText = options['button-text-view-image'];
    } else {
        localiseObject(viewImageButtonText, '__MSG_viewImage__');
    }

    // Remove globe icon if not wanted
    // Deprecated, new google image search doesn't have globe icon
    /* if (!options['show-globe-icon']) {
        switch (version) {
            case VERSIONS.FEB18:
                viewImageButton.querySelector('.RL3J9c').remove();
                break;
            case VERSIONS.JUL19:
                viewImageButton.querySelector('.aDEWOd').remove();
                break;
            case VERSIONS.OCT19:
                viewImageButton.querySelector('.XeEBj.AJkoub').remove();
                break;
        }
    } */

    // Place the view image button
    visitButton.parentElement.insertBefore(viewImageButton, visitButton);
    visitButton.parentElement.insertBefore(visitButton, viewImageButton);

    return true;
}


// Deprecared, google has removed the endpoints required for this to work
/* function addSearchImageButton(container, imageURL, version) {

    var link;
    switch (version) {
        case VERSIONS.FEB18:
            link = container.querySelector('.irc_dsh > a.irc_hol');
            break;
        case VERSIONS.JUL19:
            link = container.querySelector('.irc_ft > a.irc_help');
            break;
        case VERSIONS.OCT19:
            link = container.querySelector('.PvkmDc, .qnLx5b, .zSA7pe, .uZ49bd, .e0XTue, .kWgFk, .j7ZI7c');
            break;
    }

    if (link === null) {
        if (DEBUG)
            console.log('ViewImage: Adding Search-By-Image buttonn failed, link was not found.');
        return;
    }

    // Create the search by image button
    var searchImageButton = link.cloneNode(true);
    searchImageButton.classList.add('vi_ext_addon');

    // Set the more sizes button text
    var searchImageButtonText;
    switch (version) {
        case VERSIONS.FEB18:
            searchImageButtonText = container.querySelector('.irc_ho');
            break;
        case VERSIONS.JUL19:
            searchImageButtonText = searchImageButton.querySelector('span');
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
    searchImageButton.href = '/uploadbyurl?url=' + encodeURIComponent(imageURL);

    // Set additional options
    if (options['open-search-by-in-new-tab']) {
        searchImageButton.setAttribute('target', '_blank');
    }

    // Place the more sizes button
    link.parentElement.insertBefore(searchImageButton, link);
    link.parentElement.insertBefore(link, searchImageButton);

} */


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
        return false;
    }

    if (DEBUG)
        console.log('ViewImage: Assuming site version: ', version);

    // Clear any old extension elements
    clearExtElements();

    // Find the image url
    var imageURL = findImageURL(container, version);

    // Deprecated, extension now shows disabled button if URL is not found
    // Return if image was not found
    // if (!imageURL) {
    //     if (DEBUG)
    //         console.log('ViewImage: Adding links failed, image was not found.');
    //     return false;
    // }

    return addViewImageButton(container, node, imageURL, version);

    // Deprecated, see comment on function definition
    //addSearchImageButton(container, imageURL, version);
}

function parseDataSource(array) {

    if (DEBUG)
        console.log('ViewImage: Parsing data source...');

    var meta;
    try {
        meta = array[31][0][12][2];

        for (var i = 0; i < meta.length; i++) {
            try {
                images[meta[i][1][2][0]] = meta[i][1][3][0];
            } catch (error) {
                if (DEBUG)
                    console.log('ViewImage: Skipping image');
            }
        }
    }
    catch {
        // I encountered this alternative so I've added it here
        // We should probably find a way to do this dynamically
        meta = array[56][1][0][0][1][0];

        for (i = 0; i < meta.length; i++) {
            try {
                var data = Object.values(meta[i][0][0])[0];
                images[data[1][2][0]] = data[1][3][0];
            } catch (error) {
                if (DEBUG)
                    console.log('ViewImage: Skipping image');
            }
        }
    }
}

function parseDataSourceType1(params) {
    if (DEBUG)
        console.log('ViewImage: Parsing data source type 1...');

    const data_start_search = /\sdata:\[/;
    const data_end_search = '], ';

    var match = params.match(data_start_search);

    var start_index = match.index + match[0].length - 1;
    var end_index = start_index + params.slice(start_index).indexOf(data_end_search) + 1;

    parseDataSource(JSON.parse(params.slice(start_index, end_index)));
}

// Check if source holds array of images
try {
    const start_search = />AF_initDataCallback\(/g;
    const end_search = ');</script>';

    var success = false;

    let match;
    while (!success && ((match = start_search.exec(document.documentElement.innerHTML)) !== null)) {
        var start_index = match.index + match[0].length;
        var end_index = start_index + document.documentElement.innerHTML.slice(start_index).indexOf(end_search);

        var params = document.documentElement.innerHTML.slice(start_index, end_index);

        const ds_search = /key:\s'ds:(\d)'/;
        var ds_match = params.match(ds_search);

        if (ds_match === null) {
            continue;
        }

        if (ds_match[1] == 1) {
            // data source 1
            parseDataSourceType1(params);
            success = true;
        }
    }

    if (!success) {
        if (DEBUG)
            console.log('ViewImage: Failed to find data source.');
    }
    else if (DEBUG)
        console.log('ViewImage: Successfully created source images array.');

} catch (error) {
    if (DEBUG) {
        console.log('ViewImage: Failed to create source images array.');
        console.error(error);
    }
}


function processNode(node) {
    var imageNodes = document.querySelectorAll('img[src][style][jsaction]');
    for (var i = 0; i < imageNodes.length; i++) {
        var imageNode = imageNodes[i];
        if (nodeIsVisible(imageNode) && node.contains(imageNode) && addLinks(node)) {
            return;
        }
    }
}

// Define the mutation observers
var observer = new MutationObserver((mutations) => {
    if (TRACE)
        console.log('ViewImage: Mutations detected: ', mutations);

    for (var mutation of mutations) {
        if (mutation.type === 'attributes') {
            processNode(mutation.target);
        } else if (mutation.type === 'childList') {
            for (var node of mutation.addedNodes) {
                processNode(node);
            }
        }
    }
});

// Get options and start adding links
chrome.storage.sync.get(['options', 'defaultOptions'], function (storage) {
    options = Object.assign(storage.defaultOptions, storage.options);

    if (DEBUG)
        console.log('ViewImage: Initialising observer...');

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
});

// inject CSS into document
if (DEBUG)
    console.log('ViewImage: Injecting CSS...');

var customStyle = document.createElement('style');
customStyle.innerText = `
.irc_dsh>.irc_hol.vi_ext_addon,
.irc_ft>.irc_help.vi_ext_addon,
.PvkmDc.vi_ext_addon,
.qnLx5b.vi_ext_addon
{
margin: 0 4pt!important
}

.irc_hol.vi_ext_addon
{
flex-grow:0!important
}

.zSA7pe[href^="/searchbyimage"] {
margin-left: 4px;
}

.ZsbmCf.vi_ext_addon{
flex-grow:0
}`;
document.head.appendChild(customStyle);
