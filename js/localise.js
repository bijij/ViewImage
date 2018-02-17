'use-strict';

function localiseHtmlPage() {
    var data = document.querySelectorAll('[data-localise]');

    for (var i in data) if (data.hasOwnProperty(i)) {
        var obj = data[i];
        var tag = obj.getAttribute('data-localise').toString();

        toI18n(obj, tag);
    }
}

localiseHtmlPage();