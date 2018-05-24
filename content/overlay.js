"use strict";

Cu.import("resource://gre/modules/Services.jsm");

function addLinks(node) {
    var doc = node.ownerDocument;
    var options = Services.prefs.getBranch("extensions.viewimage.");
    var strings = Services.strings.createBundle("chrome://viewimage/locale/viewimage.properties");

    var object = node.closest('.irc_c[style*="visibility: visible;"], .irc_c[style*="transform: translate3d(0px, 0px, 0px);"]');

    if (!object)
        object = node.closest('.irc_c[style*="transform: translate3d(0px, 0px, 0px);"]');

    // Stop if object not found
    if (object === null) {
        return;
    }

    // Remove previously generated elements
    var oldExtensionElements = object.querySelectorAll('.ext_addon');
    for (var i = oldExtensionElements.length - 1; i >= 0; i--) {
        var element = oldExtensionElements[i];
        element.parentElement.removeChild(element);
    }

    // Retrive image links, and image url
    var imageLinks = object.querySelector('._FKw.irc_but_r > tbody > tr');
    if (!imageLinks)
        imageLinks = object.querySelector('.irc_but_r > tbody > tr');

    var imageText = object.querySelector('._cjj > .irc_it > .irc_hd > ._r3');
    if (!imageText)
        imageText = object.querySelector('.Qc8zh > .irc_it > .irc_hd > .rn92ee');

    // Retrive the image;
    var image = object.querySelector('img[alt^="Image result"][src]:not([src^="https://encrypted-tbn"]).irc_mut, img[src].irc_mi');

    // Override url for images using base64 embeds
    if (image === null || image.src === '' || image.src.startsWith('data')) {
        var thumbnail = doc.querySelector('img[name="' + object.dataset.itemId + '"]');
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
        var target_image = object.querySelector('img.target_image');
        if (target_image) {
            var link = target_image.closest('a');
            if (link) {
                var link_url = new URL(link.href);
                var new_imgLink = link_url.searchParams.get('imgurl');
                if (new_imgLink) {
                    image = new Object();
                    image.src = new_imgLink;
                }
            }
        }
    }

    // Supress error in console
    if (image === null)
        return;

    // Create more sizes button
    var moreSizes = doc.createElement('a');
    moreSizes.setAttribute('href', '#'); // TODO: Figure out how to generate a more sizes url
    moreSizes.setAttribute('class', 'ext_addon o5rIVb_ZR irc_hol irc_lth _r3');
    moreSizes.setAttribute('style', 'pointer-events:none'); // Disable click for now

    // Insert text into more sizes button
    var moreSizesText = doc.createElement('span');
    image.sizeText = moreSizesText;
    moreSizesText.innerHTML = object.querySelector('.irc_idim').innerHTML;
    moreSizes.appendChild(moreSizesText);

    // Create Search by image button
    var searchByImage = doc.createElement('a');
    searchByImage.setAttribute('href', '/searchbyimage?image_url=' + image.src);
    if (options.getBoolPref('open-search-by-in-new-tab')) {
        searchByImage.setAttribute('target', '_blank');
    }
    searchByImage.setAttribute('class', 'ext_addon o5rIVb_ZR irc_hol irc_lth _r3');

    // Insert text into Search by image button
    var searchByImageText = doc.createElement('span');
    if (options.getBoolPref('manually-set-button-text')) {
        searchByImageText.innerHTML = options.getStringPref('button-text-search-by-image');
    } else {
        searchByImageText.innerHTML = '<span>' + strings.GetStringFromName('viewimage.button-text-search-by-image') + '</span>';
    }
    searchByImage.appendChild(searchByImageText);

    // Append More sizes & Search by image buttons
    imageText.appendChild(moreSizes);
    imageText.appendChild(searchByImage);

    // Create View image button
    var viewImage = doc.createElement('td');
    viewImage.setAttribute('class', 'ext_addon');

    // Add globe to View image button if toggle enabled
    var viewImageLink = doc.createElement('a');
    if (options.getBoolPref('show-globe-icon')) {
        var globeIcon = doc.querySelector('._RKw._wtf._Ptf');
        if (!globeIcon)
            globeIcon = doc.querySelector('.RL3J9c.z1asCe.GYDk8c');
        viewImageLink.appendChild(globeIcon.cloneNode(true));
    }

    // hide copyright text if toggle enabled
    if (options.getBoolPref('hide-images-subject-to-copyright')) {
        var copyWarning = object.querySelector('.irc_bimg.irc_it');
        copyWarning.style = 'display: none;';
    }

    // add text to view image button
    var viewImageText = doc.querySelector('._WKw');
    if (!viewImageText)
        viewImageText = doc.querySelector('.Tl8XHc');
    var viewImageTextClone = viewImageText.cloneNode(true);

    if (options.getBoolPref('manually-set-button-text')) {
        viewImageTextClone.innerText = options.getStringPref('button-text-view-image');
    } else {
        viewImageTextClone.innerText = strings.GetStringFromName('viewimage.button-text-view-image');
    }
    viewImageLink.appendChild(viewImageTextClone);

    // Add View image button URL
    viewImageLink.setAttribute('href', image.src);
    if (options.getBoolPref('open-in-new-tab')) {
        viewImageLink.setAttribute('target', '_blank');
    }
    viewImage.appendChild(viewImageLink);

    // Add View image button to Image Links
    var save = imageLinks.childNodes[1];
    imageLinks.insertBefore(viewImage, save);
}


// Define the mutation obersever
var observer = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];

        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (var j = 0; j < mutation.addedNodes.length; j++) {
                var newNode = mutation.addedNodes[j];

                if (newNode.nodeType === Node.ELEMENT_NODE) {
                    if (newNode.classList.contains('irc_mi') | newNode.classList.contains('irc_mut') | newNode.classList.contains('irc_ris')) {
                        addLinks(newNode);
                    }
                }
            }
        }
    }
});

var viewImageExtension = {
    init: function () {
        // The event can be DOMContentLoaded, pageshow, pagehide, load or unload.
        if (gBrowser) gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
    },
    onPageLoad: function (aEvent) {
        var doc = aEvent.originalTarget;

        // run only on google.com pages
        if (doc.location.href.match(/https?:\/\/[^.]+\.google\.[^\/]+\/(?:(?:imgres\?)|(?:.*tbm=isch))/)) {



            var objects = doc.querySelectorAll('.irc_c');
            for (var i = 0; i < objects.length; i++) {
                addLinks(objects[i]);
            }

            observer.observe(doc.body, {
                childList: true,
                subtree: true
            });

            // inject CSS into document
            var customStyle = doc.createElement('style');
            customStyle.innerText = '._r3:hover:before{display:inline-block;pointer-events:none}._r3{margin: 0 4pt!important}';
            doc.head.appendChild(customStyle);

        }
    },
    optionsClick: function (event) {
        var prefsURL = "chrome://viewimage/content/prefs.xul";
        var windows = Services.wm.getEnumerator(null);

        //If the prefs window is already open, focus it
        while (windows.hasMoreElements())
        {
            var win = windows.getNext();
            if (win.document.documentURI == prefsURL)
            {
                win.focus();
                return;
            }
        }

        //Open the prefs window
        var features;
        try {
            var instantApply = Services.prefs.getBoolPref("browser.preferences.instantApply");
            if (instantApply)
                features = "chrome,titlebar,toolbar,centerscreen,dialog=no,modal";
            else
                features = "chrome,titlebar,toolbar,centerscreen,modal";
        } catch (e) {
            features = "chrome,titlebar,toolbar,centerscreen,modal";
        }
        var d = window.openDialog(prefsURL, "", features);
        d.focus();
    },
    githubClick: function (event) {
        openUILinkIn("https://github.com/bijij/ViewImage", "tab");
    },
    donateClick: function (event) {
        openUILinkIn("https://goo.gl/Kxyaq8", "tab");
    }
}
window.addEventListener("load", function load(event) {
    window.removeEventListener("load", load, false); //remove listener, no longer needed
    viewImageExtension.init();
}, false);
