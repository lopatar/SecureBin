const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function checkSecureContext() {
    if (!isSecureContext) {
        alert('Not in secure context!');
        document.getElementById('createPasteBtn').disabled = true;
    }
}

function generateEncryptionKey() {
    return window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
    );
}

function exportEncryptionKey(encryptionKey) {
    return window.crypto.subtle.exportKey('raw', encryptionKey).then(exportedEncryptionKey => {
        return exportedEncryptionKey;
    });
}

function generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12));
}

function encryptData(data, encryptionKey, encryptionIV) {
    return window.crypto.subtle.encrypt(
        {name: 'AES-GCM', iv: encryptionIV},
        encryptionKey,
        data,
    );
}

function ArrayBase64Encode(data)
{
    const arrayBufferString = textDecoder.decode(data);
    return Base64.encode(arrayBufferString);
}


function sendToServer(encryptedData, burnOnRead, password) {
    encryptedData = ArrayBase64Encode(encryptedData);

    return fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({
            'cipherText': encryptedData,
            'burnOnRead': burnOnRead,
            'password': password
        })
    })
}

function postProcessLink(jsonData, encryptionKey, encryptionIV, shortenUrl) {
    exportEncryptionKey(encryptionKey).then(rawEncryptionKey => {
        rawEncryptionKey = base64ArrayBuffer(rawEncryptionKey);
        encryptionIV = base64ArrayBuffer(encryptionIV);

        const url = jsonData.url.data.url + rawEncryptionKey + '--' + encryptionKey;

        if (!shortenUrl) {
            return url;
        }

        fetch('https://s.lopatar.dev/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'link': url
            })
        }).then(shortenedUrl => shortenedUrl.text()).then((shortenedUrl) => {
            return shortenedUrl;
        });
    });

    return '';  //so IDEs show string as return value
}

function savePaste() {
    const pasteContent = document.getElementById('pasteContent').value;

    const burnOnRead = document.getElementById('burnOnRead').checked;
    const shortenUrl = document.getElementById('shortenUrl').checked;

    let password = document.getElementById('pastePassword').value;

    if (password === null) {
        password = '';
    }

    if (pasteContent.length === 0) {
        alert('You must supply content!');
        return;
    }

    document.getElementById('createPasteBtn').disabled = true;

    generateEncryptionKey().then(encryptionKey => {
        const encryptionIV = generateIV();

        encryptData(pasteContent, encryptionKey, encryptionIV)
            .then(encryptedData => {
                sendToServer(encryptedData, burnOnRead, password)
                    .then(httpResponse => httpResponse.json())
                    .then(httpJson => {
                            if (httpJson.error) {
                                alert('Error occured: ' + httpJson.error);
                                return;
                            }

                            postProcessLink(httpJson, encryptionKey, encryptionIV, shortenUrl).then(pasteUrl => {
                                navigator.clipboard.writeText(pasteUrl).then(() => {
                                    alert('Link has been copied to clipboard!');
                                });
                            });
                        }
                    )
            })
    });
}

function decryptPaste() {
    const pasteMetadata = JSON.parse(document.getElementById('pasteMetadata').textContent.trim());

    if (pasteMetadata.burnOnRead) {
        const shouldView = confirm('This paste is set to burn on read, do you want to read it? It won\'t be able to viewed anymore!');

        if (!shouldView) {
            window.location.hash = '';
            window.location.href = '/';
            return;
        }
    }

    let password = '';

    if (pasteMetadata.passwordProtected) {
        password = prompt('This paste is password protected, please input the password!');

        if (password === null) {
            password = '';
        }
    }

    const pasteContentField = document.getElementById('pasteContent');

    pasteContentField.value = 'Fetching...';

    fetch('/api/cipherText/' + pasteMetadata.urlCode, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'password': password
        })
    }).then(response => response.json()).then(data => {
        if (data.error) {
            alert('Error: ' + data.data);
            return;
        }

        let cipherText = data.data.cipherText;
        cipherText = aesjs.utils.hex.toBytes(cipherText);
        let key = window.location.hash.substring(1);
        key = aesjs.utils.hex.toBytes(key);

        try {
            const aesCtr = new aesjs.ModeOfOperation.ctr(key);
            let decrypted = aesCtr.decrypt(cipherText);
            decrypted = aesjs.utils.utf8.fromBytes(decrypted);
            pasteContentField.value = decrypted;
        } catch {
            alert('Invalid key provided!');
        }
    })
}