function addLinks() {
    setTimeout(function() {
        var immersiveContent = document.querySelectorAll('.irc_c');

        for (var i = 0; i < immersiveContent.length; i++) {
    
            var object = immersiveContent[i];
    
            // Retrive image links, and image url
            var imageLinks = object.querySelector('._FKw.irc_but_r > tbody > tr');
            var imageText = object.querySelector('._cjj > .irc_it > .irc_hd > ._r3');

            var imageURL = object.querySelector('.irc_mi').src;


            // Remove previously generated view image buttons
            oldViewImage = imageLinks.querySelector('.ext_addon');
            if (oldViewImage){
                imageLinks.removeChild(oldViewImage);
            }
            
            // remove previously generated search by image links
            oldSearchByImage = imageText.querySelector('.ext_addon')
            if (oldSearchByImage){
                imageText.removeChild(oldSearchByImage);
            }


            // Create Search by image button
            var searchByImage = document.createElement('a');
            searchByImage.setAttribute('href', 'https://www.google.com/searchbyimage?&image_url=' + imageURL);
            searchByImage.setAttribute('class', 'ext_addon');
            searchByImage.setAttribute('style', 'margin-left:4pt;');

            var searchByImageText = document.createElement('span');
            searchByImageText.innerText = 'Search by image';
            searchByImage.appendChild(searchByImageText);

            // Append Search by image button
            imageText.appendChild(searchByImage);


            // Create ViewImage button
            var viewImage = document.createElement('td');
            viewImage.setAttribute('class', 'ext_addon');
    
            // Add ViewImage button URL
            var viewImageLink = document.createElement('a');    
            viewImageLink.innerHTML = '<span>View Image</span>';
            viewImageLink.setAttribute('href', imageURL);
            viewImage.appendChild(viewImageLink)
    
            // Add ViewImage button to Image Links
            var save = imageLinks.childNodes[1]
            imageLinks.insertBefore(viewImage, save)
    
        }
    }, 300);
}

window.addEventListener ('load', addLinks, false);
document.addEventListener('click', addLinks, false);