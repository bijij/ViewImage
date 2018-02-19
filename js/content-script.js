'use strict';

function toI18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
}

function localiseObject(obj, tag) {
    var msg = toI18n(tag);
    if (msg != tag) obj.innerHTML = msg;
}

function addLinks(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('irc_mi') | node.classList.contains('irc_mut') | node.classList.contains('irc_ris')) {
            var object = node.closest('.irc_c');

            // Remove previously generated elements
            var oldExtensionElements = object.querySelectorAll('.ext_addon');
            for (var i = oldExtensionElements.length - 1; i >= 0; i--){
                var element = oldExtensionElements[i];
                element.parentElement.removeChild(element);
            }
            
            // Retrive image links, and image url
            var imageLinks = object.querySelector('._FKw.irc_but_r > tbody > tr');
            var imageText = object.querySelector('._cjj > .irc_it > .irc_hd > ._r3');

            // Retrive the image;
            var image = object.querySelector('img');

            // Create more sizes button
            var moreSizes = document.createElement('a');
            moreSizes.setAttribute('href', '#' + image.src); // TODO: Fix link
            moreSizes.setAttribute('class', 'ext_addon _ZR irc_hol irc_lth _r3');

            // Insert text into more sizes button
            var moreSizesText = document.createElement('span');
            image.sizeText = moreSizesText;
            moreSizesText.innerHTML = object.querySelector('.irc_idim').innerHTML;
            moreSizes.appendChild(moreSizesText);

            // Create Search by image button
            var searchByImage = document.createElement('a');
            searchByImage.setAttribute('href', '/searchbyimage?image_url=' + image.src);
            searchByImage.setAttribute('class', 'ext_addon _ZR irc_hol irc_lth _r3');

            // Insert text into Search by image button
            var searchByImageText = document.createElement('span');
            localiseObject(searchByImageText, '<span>__MSG_searchImg__</span>');
            searchByImage.appendChild(searchByImageText);

            // Append More sizes & Search by image buttons
            imageText.appendChild(moreSizes);
            imageText.appendChild(searchByImage);

            // Create View image button
            var viewImage = document.createElement('td');
            viewImage.setAttribute('class', 'ext_addon');
            
            // Add globe to View image button
            var viewImageLink = document.createElement('a');
            var globeIcon = document.querySelector('._RKw._wtf._Ptf').cloneNode(true);
            viewImageLink.appendChild(globeIcon);

            // add text to view image button
            var viewImageText = document.querySelector('._WKw').cloneNode(true);
            localiseObject(viewImageText, '__MSG_viewImage__');
            viewImageLink.appendChild(viewImageText);

            // Add View image button URL
            viewImageLink.setAttribute('href', image.src);
            if (options['open-in-new-tab']) {
                viewImageLink.setAttribute('target', '_blank');
            }
            viewImage.appendChild(viewImageLink);

            // Add View image button to Image Links
            var save = imageLinks.childNodes[1];
            imageLinks.insertBefore(viewImage, save);
        }
    }
}


// Get options and start adding links
var options;
chrome.storage.sync.get(['options', 'defaultOptions'], function (storage) {
    options = Object.assign(storage.defaultOptions, storage.options);

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var newNode = mutation.addedNodes[i];
                    addLinks(newNode);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // inject CSS into document
    var customStyle = document.createElement('style');
    customStyle.innerText = '._r3:hover:before{display:inline-block;pointer-events:none}';
    document.head.appendChild(customStyle);

    addLinks(document.body);
});
