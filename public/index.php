<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Config;
use App\Middleware\HtmlHeader;
use Sdk\App;

$config = new Config();
$app = new App($config);
$htmlHeader = new HtmlHeader();

$app->view('/', 'Home.html')
	->addMiddleware($htmlHeader);

$app->get('/{urlCode}', 'Api::decrypt')
	->addMiddleware($htmlHeader)
	?->whereParam('urlCode')
	->setLimit(16, 16);

$app->post('/api/save', 'Api::save');

$app->run();