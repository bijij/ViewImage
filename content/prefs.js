"use strict";

Components.utils.import("resource://gre/modules/Services.jsm");

var viewimagePrefs = {
    get buttonTextViewImagePref()
    {
        delete this.buttonTextViewImagePref;
        return this.buttonTextViewImagePref = document.getElementById("pref-buttontext-viewimage");
    },

    get buttonTextSearchByImagePref()
    {
        delete this.buttonTextSearchByImagePref;
        return this.buttonTextSearchByImagePref = document.getElementById("pref-buttontext-searchbyimage");
    },

    get buttonTextEnablePref()
    {
        delete this.buttonTextEnablePref;
        return this.buttonTextEnablePref = document.getElementById("pref-buttontext-enable");
    },

    buttonTextEnableChanged: function()
    {
        this.buttonTextViewImagePref.disabled = (this.buttonTextEnablePref.value == false);
        this.buttonTextSearchByImagePref.disabled = (this.buttonTextEnablePref.value == false);
    },

    onLoad: function()
    {
        this.buttonTextEnableChanged();
    },

    onReset: function() {
        var branch = Services.prefs.getBranch("extensions.viewimage");
        var prefs = branch.getChildList("");
        prefs.forEach(function (pref) {
            branch.clearUserPref(pref);
        });
    }
}
