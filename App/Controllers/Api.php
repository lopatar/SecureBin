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

		if ($cipherText === null) {
			$response->setStatusCode(StatusCode::BAD_REQUEST);
			$response->write(self::buildResponse('Data required', true));
			return $response;
		}

		if (!ctype_xdigit($cipherText)) {
			$response->setStatusCode(StatusCode::BAD_REQUEST);
			$response->write(self::buildResponse('Invalid data format', true));
			return $response;
		}

		$paste = Paste::insert($cipherText);
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

	public static function decrypt(Request $request, Response $response, array $args): Response
	{
		$urlCode = $args['urlCode'];
		$paste = Paste::fromCode($urlCode);

		if ($paste === null) {
			$response->addHeader('Location', '/');
			return $response;
		}

		$response->createView('Decrypt.php')
			->setProperty('paste', $paste);
		return $response;
	}
}