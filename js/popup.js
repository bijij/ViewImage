// On options button click
document.addEventListener('click', event => {
    if (event.target.id == 'options-page') {
        chrome.runtime.openOptionsPage();
    }
});
