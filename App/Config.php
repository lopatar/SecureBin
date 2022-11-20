<?php
declare(strict_types=1);

namespace App;

use Sdk\Http\Entities\CookieSameSite;
use Sdk\IConfig;

final class Config implements IConfig
{
	/**
	 * If false, we output {@see Exception::$message} thrown in {@see Route::execute()} to {@see Response::$text}
	 * Recommended value is false
	 */
	public function isProduction(): bool
	{
		return true;
	}

	/**
	 * MySQL/MariDB DB configuration
	 * Gets whether {@see App} should initialize the MariaDB connection
	 * @see Connection, App::initDatabaseConnection()
	 */
	public function isMariaDbEnabled(): bool
	{
		return true;
	}

	/**
	 * MySQL/MariDB DB configuration
	 * Gets the MariaDB server host
	 * @see Connection, App::initDatabaseConnection()
	 */
	public function getMariaDbHost(): string
	{
		return '';
	}

	/**
	 * MySQL/MariDB DB configuration
	 * Gets the MariaDB server username
	 * @see Connection, App::initDatabaseConnection()
	 */
	public function getMariaDbUsername(): string
	{
		return '';
	}

	/**
	 * MySQL/MariDB DB configuration
	 * Gets the MariaDB server password
	 * @see Connection, App::initDatabaseConnection()
	 */
	public function getMariaDbPassword(): string
	{
		return '';
	}

	/**
	 * MySQL/MariDB DB configuration
	 * Gets the MariaDB server DB name
	 * @see Connection, App::initDatabaseConnection()
	 */
	public function getMariaDbDatabaseName(): string
	{
		return '';
	}

	/**
	 * Session configuration
	 * Gets the session cookie name
	 * @see Session
	 */
	public function getSessionName(): string
	{
		return 'LINK-SHORTENER';
	}

	/**
	 * Session configuration
	 * Gets the session lifetime in seconds
	 * @see Session
	 */
	public function getSessionLifetime(): int
	{
		return 3600;
	}

	/**
	 * Session configuration
	 * Gets whether session should use strict mode, recommended value is <code>true</code>
	 * @see Session
	 */
	public function isSessionStrictModeEnabled(): bool
	{
		return true;
	}

	/**
	 * Session configuration
	 * Gets the session cookie path, recommended value is <code>/</code>
	 * @see Session
	 */
	public function getSessionCookiePath(): string
	{
		return '/';
	}

	/**
	 * Session configuration
	 * Gets whether the session cookie can be only transmitted over HTTP, recommended value is <code>true</code>
	 * @see Session
	 */
	public function isSessionCookieHttpOnly(): bool
	{
		return true;
	}

	/**
	 * Session configuration
	 * Gets the session cookie SameSite attribute, recommended value is </code>CookieSameSite::STRICT</code>
	 * @see Session
	 */
	public function getSessionCookieSameSite(): CookieSameSite
	{
		return CookieSameSite::STRICT;
	}

	/**
	 * Session configuration
	 * Gets the session cookie ID length, recommended value is <code>64</code>
	 * @see Session
	 */
	public function getSessionIdLength(): int
	{
		return 64;
	}

	/**
	 * Session configuration
	 * Gets the session ID bits per character, recommended value is <code>6</code>
	 * @see Session
	 */
	public function getSessionIdBitsPerChar(): int
	{
		return 6;
	}

	/**
	 * CSRF protection configuration
	 * Gets the CSRF token lifetime in seconds, recommended value is 600
	 * @see CSRF
	 */
	public function getCsrfTokenLifetime(): int
	{
		return 600;
	}

	/**
	 * Server header spoofing
	 * Gets whether spoofing Server head is enabled
	 * @see App::spoofServerHeader()
	 */
	public function isSpoofedServerHeadEnabled(): bool
	{
		return false;
	}

	/**
	 * Server header spoofing
	 * Gets the spoofed server head value
	 * @see App::spoofServerHeader()
	 */
	public function getSpoofedServerValue(): string
	{
		return 'nginx';
	}

	/**
	 * Cookie encryption
	 * Gets whether cookies should be automatically encrypted/decrypted
	 * @uses \Sdk\Utils\Encryption\AES, \Sdk\Middleware\Session
	 */
	public function isCookieEncryptionEnabled(): bool
	{
		return false;
	}
}