// On options button click
document.getElementById('options-page').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
});

// Get debug info
var manifestData = chrome.runtime.getManifest();
chrome.runtime.getPlatformInfo(function (info) {
    var debugString = 'v' + manifestData.version + ' (' + info.os + ' ' + info.nacl_arch + ')  - ' + manifestData.current_locale;
    document.getElementById('debug').innerText = debugString;
});
