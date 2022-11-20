<?php
declare(strict_types=1);

namespace App\Models;

use Sdk\Database\MariaDB\Connection;
use Sdk\Http\Request;
use Sdk\Utils\Random;

final class Paste
{
	public function __construct(public readonly string $urlCode, public readonly string $cipherText) {}

	public static function fromCode(string $urlCode): ?self
	{
		if (!self::exists($urlCode)) {
			return null;
		}

		$query = Connection::query('SELECT content FROM pastes WHERE urlCode=?', [$urlCode]);
		$cipherText = $query->fetch_assoc()['content'];
		return new self($urlCode, $cipherText);
	}

	private static function exists(string $urlCode): bool
	{
		return Connection::query('SELECT urlCode FROM pastes WHERE urlCode=?', [$urlCode])->num_rows === 1;
	}

	public static function insert(string $cipherText): self
	{
		$urlCode = self::generateUrlCode();
		Connection::query('INSERT INTO pastes VALUES(?,?)', [$urlCode, $cipherText]);
		return new self($urlCode, $cipherText);
	}

	private static function generateUrlCode(): string
	{
		do {
			$code = Random::stringSafe(16);
		} while (self::exists($code));

		return $code;
	}

	public function getPublicUrl(Request $request): string
	{
		$url = $request->getUrl();
		$domainName = $url->domainName->fullText;
		return "$url->scheme://$domainName/$this->urlCode#";
	}
}