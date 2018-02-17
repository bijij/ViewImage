function toI18n(obj, tag) {
    var msg = tag.replace(/__MSG_(\w+)__/g, function(match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });

    if(msg != tag) obj.innerHTML = msg;
}


function addLinks(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('irc_ris')) {
            var object = node.closest('.irc_c');
            // Retrive image links, and image url
            var imageLinks = object.querySelector('._FKw.irc_but_r > tbody > tr');
            var imageText = object.querySelector('._cjj > .irc_it > .irc_hd > ._r3');

            // Retrive the image URL
            var thumbnail = document.querySelector('img[name="' + object.dataset.itemId + '"]');
            var meta = thumbnail.closest('.rg_bx').querySelector('.rg_meta');
            var metadata = JSON.parse(meta.innerHTML);
            var imageURL = metadata.ou;


            // Remove previously generated view image buttons
            var oldViewImage = imageLinks.querySelector('.ext_addon');
            if (oldViewImage) {
                imageLinks.removeChild(oldViewImage);
            }

            // remove previously generated search by image links
            var oldSearchByImage = imageText.querySelector('.ext_addon');
            if (oldSearchByImage) {
                imageText.removeChild(oldSearchByImage);
            }


            // Create Search by image button
            var searchByImage = document.createElement('a');
            searchByImage.setAttribute('href', '/searchbyimage?&image_url=' + imageURL);
            searchByImage.setAttribute('class', 'ext_addon');
            searchByImage.setAttribute('style', 'margin-left:4pt;');

            var searchByImageText = document.createElement('span');
            toI18n(searchByImageText, '<span>__MSG_SearchImg__</span>');
            searchByImage.appendChild(searchByImageText);

            // Append Search by image button
            imageText.appendChild(searchByImage);


            // Create ViewImage button
            var viewImage = document.createElement('td');
            viewImage.setAttribute('class', 'ext_addon');

            // Add ViewImage button URL
            var viewImageLink = document.createElement('a');
            toI18n(viewImageLink, '<span>__MSG_ViewImage__</span>');
            viewImageLink.setAttribute('href', imageURL);
            viewImage.appendChild(viewImageLink);

            // Add ViewImage button to Image Links
            var save = imageLinks.childNodes[1];
            imageLinks.insertBefore(viewImage, save);
        }
    }
}

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

addLinks(document.body);
