<?php
declare(strict_types=1);
$paste = $this->getProperty('paste');
//Please do not allow for any characters on line 10, within the DIV!
?>
<body onload="decryptPaste()">
<h1>SecureBin</h1>
<p>Zero knowledge pastebin, that does encryption in the browser!</p>
<h3>Paste: <?= $paste->urlCode ?></h3>
<div id="cipherText" hidden><?= $paste->cipherText ?></div>
<div>
    <label for="pasteContent">Decrypted content</label>
</div>
<div>
    <textarea cols="70" rows="40" id="pasteContent" required></textarea>
</div>
<p style="font-weight: bold">Encryption is handled using AES-256-CTR & cryptographically safe key generation</p>
</body>
<footer>
    <a href="https://github.com/lopatar/SecureBin" target="_blank">Source code</a>
</footer>
</html>