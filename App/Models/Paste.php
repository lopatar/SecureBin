<?php
declare(strict_types=1);

namespace App\Models;

use Sdk\Database\MariaDB\Connection;
use Sdk\Http\Request;
use Sdk\Utils\Random;

final class Paste
{
	public function __construct(public readonly string $urlCode, public readonly string $cipherText, public readonly bool $burnOnRead, public readonly string $passwordHash) {}

	public static function fromCode(string $urlCode): ?self
	{
		if (!self::exists($urlCode)) {
			return null;
		}

		$query = Connection::query('SELECT content,burnOnRead,password FROM pastes WHERE urlCode=?', [$urlCode]);
		$data = $query->fetch_assoc();
		return new self($urlCode, $data['content'], boolval($data['burnOnRead']), $data['password']);
	}

	private static function exists(string $urlCode): bool
	{
		return Connection::query('SELECT urlCode FROM pastes WHERE urlCode=?', [$urlCode])->num_rows === 1;
	}

	public static function insert(string $cipherText, bool $burnOnRead, string $password): self
	{
		if ($password !== '')
		{
			$password = password_hash($password, PASSWORD_DEFAULT);
		}

		echo "<script>alert($burnOnRead)</script>";

		$urlCode = self::generateUrlCode();
		Connection::query('INSERT INTO pastes VALUES(?,?,?,?)', [$urlCode, $cipherText, $password, intval($burnOnRead)], 'sssi');
		return new self($urlCode, $cipherText, $burnOnRead, $password);
	}

	private static function generateUrlCode(): string
	{
		do {
			$code = Random::stringSafe(16);
		} while (self::exists($code));

		return $code;
	}

	public function isPasswordProtected(): bool
	{
		return $this->passwordHash !== '';
	}

	public function validatePassword(string $password): bool
	{
		if (!$this->isPasswordProtected()) {
			return true;
		}

		return password_verify($password, $this->passwordHash);
	}

	public function getPublicUrl(Request $request): string
	{
		$url = $request->getUrl();
		$domainName = $url->domainName->fullText;
		return "$url->scheme://$domainName/$this->urlCode#";
	}

	public function metadataAsJson(): string
	{
		return json_encode([
			'urlCode' => $this->urlCode,
			'burnOnRead' => $this->burnOnRead,
			'passwordProtected' => $this->isPasswordProtected()
		]);
	}

	public function remove(): void
	{
		Connection::query('DELETE FROM pastes WHERE urlCode=?', [$this->urlCode]);
	}
}