'use-strict';

function toI18n(str) {
    return str.replace(/__MSG_(\w+)__/g, function (match, v1) {
        return v1 ? chrome.i18n.getMessage(v1) : '';
    });
}

function localiseObject(obj, tag) {
    var msg = toI18n(tag);
    if (msg != tag) obj.innerHTML = msg;
}

function localiseHtmlPage() {
    var data = document.querySelectorAll('[data-localise]');

    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var tag = obj.getAttribute('data-localise').toString();

        localiseObject(obj, tag);
    }
}

localiseHtmlPage();
