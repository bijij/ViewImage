module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "chrome": false,
        "browser": false
    },
    "rules": {
        "no-global-assign": [
            "error"
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "eol-last": "error"
    }
};
