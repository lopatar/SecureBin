<?php
declare(strict_types=1);

namespace App\Middleware;

use Sdk\Http\Request;
use Sdk\Http\Response;
use Sdk\Middleware\Interfaces\IMiddleware;
use Sdk\Render\View;

final class HtmlHeader implements IMiddleware
{

	public function execute(Request $request, Response $response, array $args): Response
	{
		$view = new View('HtmlHeader.html');
		$view->render();
		return $response;
	}
}