<?php
declare(strict_types=1);

use App\Models\Paste;

/**
 * @var $paste Paste
 */
$paste = $this->getProperty('paste');
?>
<body onload="decryptPaste()">
<a href="/"><-- Back</a>
<h1>SecureBin</h1>
<p>Zero knowledge pastebin, that does encryption in the browser!</p>
<h3>Paste: <?= $paste->urlCode ?></h3>
<script type="application/json" id="pasteMetadata"><?= $paste->metadataAsJson() ?></script>
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