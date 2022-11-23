function generateKey() {
    let buf = new Uint8Array(32);

    if (!isSecureContext) {
        return false;
    }

    window.crypto.getRandomValues(buf);
    return buf;
}

function savePaste() {
    let pasteContent = document.getElementById('pasteContent').value;
    const burnOnRead = document.getElementById('burnOnRead').checked;
    let password = document.getElementById('pastePassword').value;

    if (password === null)
    {
        password = '';
    }

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

    document.getElementById('createPasteBtn').disabled = true;

    fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({
            'cipherText': encrypted,
            'burnOnRead': burnOnRead,
            'password': password
        })
    }).then(response => response.json()).then(data => {
        if (data.error) {
            alert('Error occurred: ' + data.data);
            return;
        }

        const url = data.data.url + keyHex;
        const shortenUrl = document.getElementById('shortenUrl').checked;

        if (shortenUrl) {
            fetch('https://s.lopatar.me/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'link': url
                })
            }).then(response => response.text()).then(link => {
                navigator.clipboard.writeText(link).then(() => {
                    alert('Shortened link has been copied to clipboard!');
                    window.location.href = url;
                });
            });
        } else {
            window.location.href = url;
        }
    })
}

function decryptPaste() {
    const pasteMetadata = JSON.parse(document.getElementById('pasteMetadata').textContent.trim());

    if (pasteMetadata.burnOnRead) {
        const shouldView = confirm("This paste is set to burn on read, do you want to read it? It won't be able to viewed anymore!");

        if (!shouldView) {
            window.location.href = '/';
            return;
        }
    }

    let password = '';

    if (pasteMetadata.passwordProtected) {
        password = prompt("This paste is password protected, please input the password!");

        if (password === null) {
            password = '';
        }
    }

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
            document.getElementById('pasteContent').value = decrypted;
        } catch (ex) {
            alert(ex);
        }
    })
}