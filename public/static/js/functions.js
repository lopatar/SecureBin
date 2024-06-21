function checkSecureContext() {
    if (!isSecureContext) {
        alert('Not in secure context!');
        document.getElementById('createPasteBtn').disabled = true;
    }
}

function textToBuf(text) {
    const textEncoder = new TextEncoder();
    return textEncoder.encode(text);
}

function bufToText(buf) {
    const textDecoder = new TextDecoder();
    return textDecoder.decode(buf);
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
    return window.crypto.subtle.exportKey('raw', encryptionKey);
}

function generateIV() {
    return window.crypto.getRandomValues(new Uint8Array(12));
}

function encryptData(data, encryptionKey, encryptionIV) {
    data = textToBuf(data);

    return window.crypto.subtle.encrypt(
        {name: 'AES-GCM', iv: encryptionIV},
        encryptionKey,
        data,
    );
}

function sendToServer(encryptedData, burnOnRead, password) {
    encryptedData = bufToText(encryptedData);

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

function postProcessLink(jsonData, encryptionKey, encryptionIV, shortenUrl)
{
    encryptionKey = bufToText(encryptionKey);
    encryptionIV = bufToText(encryptionIV);

    const url = jsonData.data.url + encryptionKey + "--" + encryptionIV;

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

    return '';
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
                            navigator.clipboard.writeText(pasteUrl).then(text => {
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