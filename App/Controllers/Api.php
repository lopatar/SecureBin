<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Models\Paste;
use Sdk\Http\Entities\StatusCode;
use Sdk\Http\Request;
use Sdk\Http\Response;

final class Api
{
	public static function save(Request $request, Response $response, array $args): Response
	{
		$response->addHeader('Content-Type', 'application/json');
		$cipherText = $request->getPost('cipherText');
		$burnOnRead = $request->getPost('burnOnRead');
		$password = $request->getPost('password');

		if ($cipherText === null || $burnOnRead === null || $password === null) {
			$response->setStatusCode(StatusCode::BAD_REQUEST);
			$response->write(self::buildResponse('Data required', true));
			return $response;
		}

		$response->write((string)boolval($burnOnRead));
		return $response;

		if (!ctype_xdigit($cipherText)) {
			$response->setStatusCode(StatusCode::BAD_REQUEST);
			$response->write(self::buildResponse('Invalid data format', true));
			return $response;
		}

		$paste = Paste::insert($cipherText, $burnOnRead, $password);
		$response->write(self::buildResponse([
			'url' => $paste->getPublicUrl($request)
		]));
		return $response;
	}

	private static function buildResponse(array|string $dataOrErrorMsg, bool $error = false): string
	{
		$message = [
			'error' => $error,
			'data' => $dataOrErrorMsg
		];

		return json_encode($message);
	}

	public static function viewPaste(Request $request, Response $response, array $args): Response
	{
		$urlCode = $args['urlCode'];
		$paste = Paste::fromCode($urlCode);

		if ($paste === null) {
			$response->addHeader('Location', '/');
			return $response;
		}

		$response->createView('ViewPaste.php')
			?->setProperty('paste', $paste);

		return $response;
	}

	public static function getCipherText(Request $request, Response $response, array $args): Response
	{
		$urlCode = $args['urlCode'];
		$password = $request->getPost('password');

		$paste = Paste::fromCode($urlCode);

		if ($paste === null || $password === null) {
			$response->setStatusCode(StatusCode::NOT_FOUND);
			$response->write(self::buildResponse('Paste not found or invalid data!', true));
			return $response;
		}

		if (!$paste->validatePassword($password))
		{
			$response->setStatusCode(StatusCode::FORBIDDEN);
			$response->write(self::buildResponse('Invalid password!', true));
			return $response;
		}

		$response->write(self::buildResponse([
			'cipherText' => $paste->cipherText
		]));

		if ($paste->burnOnRead) {
			$paste->remove();
		}

		return $response;
	}
}