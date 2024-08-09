# Currently, being refactored to use the [browser subtle crypto apis](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/) instead of bundled aes library

# SecureBin

Zero knowledge alternative to pastebin, that delegates crypto operations to the client!
using [AES-256-GCM](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm), keys are generated
using [cryptographically secure number generator](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).
Backend written using own [PHP-SDKv2](https://github.com/lopatar/PHP-SDKv2).

# Features

- Burn on read (encrypted pastes get deleted from DB after being read)
- Password protection (A password is required to fetch the encrypted data)

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
