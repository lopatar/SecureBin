# Currently, being refactored to use the [browser subtle crypto apis](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/) instead of bundled aes library

# SecureBin

Zero knowledge alternative to pastebin, that delegates crypto operations to the client!
Backend written using own [PHP-SDKv2](https://github.com/lopatar/PHP-SDKv2).

# Security
- Using browser built-in [cryptographic APIs](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) to prevent supply-chain attacks.
- Using [AES-256-GCM](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm) for authenticated encryption.
- Secure encryption key [generation](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey).
- Secure encryption IV [generation](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).

# Features

- Burn on read (encrypted paste data is permanently removed after being read).
- Password protection (a password is needed to fetch encrypted paste data).
- **TODO:** Involve password in encryption key generation to improve security.

# Try me

[paste.lopatar.dev](https://paste.lopatar.dev)

# Requirements

- PHP 8.3
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
