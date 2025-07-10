const pasteContentArea = document.getElementById('pasteContent');
const burnOnReadCheck = document.getElementById('burnOnRead');
const pastePassword = document.getElementById('pastePassword');
const shortenUrlCheck = document.getElementById('shortenUrl');
const createPasteBtn = document.getElementById('createPasteBtn');

const dynamicElements = [pasteContentArea, burnOnReadCheck, pastePassword, shortenUrlCheck, createPasteBtn];

function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let b of bytes) {
        binary += String.fromCharCode(b);
    }
    return btoa(binary);
}

function fromBase64(b64) {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}


function checkSecureContext() {
    if (!isSecureContext) {
        alert('Application isnt running in secure context!');
        dynamicElements.forEach(element => {
            element.disabled = true;
        })
    }
}

async function generateAesKey() {
    return await crypto.subtle.generateKey({
            name: 'AES-GCM',
            length: 256,
        },
        true, //extractable
        ['encrypt', 'decrypt'],
    );
}

function generateAesIV() {
    return crypto.getRandomValues(new Uint8Array(12));
}

async function savePaste() {
    checkSecureContext();

    if (createPasteBtn.disabled) {
        return;
    }

    const pasteContent = pasteContentArea.value;

    if (pasteContent.length === 0) {
        alert('Cannot create an empty paste');
        return;
    }

    const burnOnRead = burnOnReadCheck.checked;
    const password = pastePassword.value;

    const cryptoKey = await generateAesKey();
    const cryptoIv = generateAesIV();

    const textEncoder = new TextEncoder();
    const pasteContentBytes = textEncoder.encode(pasteContent);

    const cipherTextBuffer = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: cryptoIv
        },
        cryptoKey,
        pasteContentBytes
    );

    const cipherTextEncoded = toBase64(cipherTextBuffer);
    const exportedCryptoKey = toBase64(await crypto.subtle.exportKey('raw', cryptoKey));
    const exportedCryptoIv = toBase64(cryptoIv);
    const urlSelectorPart = exportedCryptoKey.concat(",", exportedCryptoIv);

    const postParams = new URLSearchParams()
    postParams.append("cipherText", cipherTextEncoded);
    postParams.append("burnOnRead", burnOnRead);
    postParams.append("password", password);

    await fetch('/api/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: postParams.toString()
    }).then(res => res.json())
        .then(jsonDecoded => {
            if (jsonDecoded.error) {
                alert("Error occured while saving the paste: ".concat(jsonDecoded.data));
                return;
            }

            window.location.href = jsonDecoded.data.url.concat(urlSelectorPart);
        });
}

function decryptPaste()
{
    const pasteMetadata = document.getElementById("pasteMetadata").json();
    const urlCode = pasteMetadata.urlCode;
    const burnOnRead = pasteMetadata.burnOnRead;
    const isPwdProtected = pasteMetadata.passwordProtected;
    var password = "";

    if (burnOnRead === true) {
        if (!confirm("Paste is set to be burnt after read, do you want to continue?"));
        {
            return;
        }

        if (isPwdProtected === true)
        {
            password = prompt("Paste is password protected, please enter the paste password: ", "");
        }


    }
}