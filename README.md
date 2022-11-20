# SecureBin
Zero knowledge alternative to pastebin, that delegates crypto operations to the client! Encryption is done using [AES-256-CTR](https://github.com/ricmoo/aes-js), keys are generated using [cryptographically secure number generator](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).
Written using own [PHP-SDKv2](https://github.com/lopatar/PHP-SDKv2).

# Requirements
- PHP 8.1
- Composer
- MariaDB/MySQL DB server
- Web server (routing requests to public/index.php)

# Installation
- Clone repo
- Run
```shell
composer update
```
- Insert [DB schema](https://github.com/lopatar/SecureBin/blob/master/db.sql)
- Done!
