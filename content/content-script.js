'use strict';


var viewImageExtension = {
    init: function() {
        ppcontent.addEventListener("DOMContentLoaded", viewImageExtension.onPageLoad, true);
    },

    onPageLoad: function(aEvent) {
        if (aEvent.originalTarget.nodeName == "#document") {

        }
    },
}




// Define the mutation observer
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