<?php
#$start = microtime();
require('config.php');
require(BASE . 'include/init.php');

$route = (isset($_GET['r']) ? $_GET['r'] : '');

$request = new Request(new Session(), new Cookie(), $route);
$page_model = new FilePageModel();

Language::configure($request, LANGUAGE_SESSION, LANGUAGE_DEFAULT);
Language::acceptHeader();

$router = new Router($request, $page_model);
$page = $router->getPage();
$page->runControllers($request);

echo $page->getResponseContent();

#echo "\n<!--\n";
#echo "page generated in " . round((microtime() - $start), 4) . " seconds";
#echo "\n-->";
?>