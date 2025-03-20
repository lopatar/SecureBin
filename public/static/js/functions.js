const pasteContentArea = document.getElementById('pasteContent');
const burnOnReadCheck = document.getElementById('burnOnRead');
const pastePassword = document.getElementById('pastePassword');
const shortenUrlCheck = document.getElementById('shortenUrl');
const createPasteBtn = document.getElementById('createPasteBtn');

const dynamicElements = [pasteContentArea, burnOnReadCheck, pastePassword, shortenUrlCheck, createPasteBtn];

function checkSecureContext()
{
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

function generateAesIV()
{
    return crypto.getRandomValues(new Uint8Array(12));
}

async function savePaste()
{
    const cryptoKey = await generateAesKey();
    const cryptoIv = generateAesIV();


}