function generateKey() {
    let buf = new Uint8Array(32);

    if (!isSecureContext) {
        return false;
    }

    window.crypto.getRandomValues(buf);
    return buf;
}

function makeShortUrl(url)
{
    let shortenedUrl = '';

    fetch('https://s.lopatar.me/api/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'link': url
        })
    }).then(response => response.text()).then(data => {
        shortenedUrl = data;
    })

    while (shortenedUrl === '') { }
    return shortenedUrl;
}

function savePaste() {
    let pasteContent = document.getElementById('pasteContent').value;

    if (pasteContent.length === 0) {
        alert('You must supply content!');
        return;
    }

    pasteContent = aesjs.utils.utf8.toBytes(pasteContent);

    const keyBuf = generateKey();

    if (keyBuf === false) {
        alert('Could not generate key, not in secure context!!');
        return;
    }

    const keyHex = aesjs.utils.hex.fromBytes(keyBuf);
    const aesCtr = new aesjs.ModeOfOperation.ctr(keyBuf);

    let encrypted = aesCtr.encrypt(pasteContent);
    encrypted = aesjs.utils.hex.fromBytes(encrypted);

    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({
            'cipherText': encrypted
        })
    }).then(response => response.json()).then(data => {
        if (data.error) {
            alert('Error occurred: ' + data.data);
            return;
        }

        const url = data.data.url + keyHex;
        const shortenUrl = document.getElementById('shortenUrl').checked;

        if (shortenUrl) {
            const shortenedUrl = makeShortUrl(url);
            navigator.clipboard.writeText(shortenedUrl).then(() => {
                alert('Shortened link copied to clipboard!');
                window.location.href = url;
            });
        } else {
            window.location.href = url;
        }
    })
}

function decryptPaste() {
    let cipherText = document.getElementById('cipherText').textContent;
    cipherText = aesjs.utils.hex.toBytes(cipherText);

    let key = window.location.hash.substring(1);
    key = aesjs.utils.hex.toBytes(key);

    try {
        const aesCtr = new aesjs.ModeOfOperation.ctr(key);
        let decrypted = aesCtr.decrypt(cipherText);
        decrypted = aesjs.utils.utf8.fromBytes(decrypted);

        document.getElementById('pasteContent').value = decrypted;
    } catch {
        alert('Invalid key provided!');
    }
}