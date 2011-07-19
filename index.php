<?php
#$start = microtime();
require('config.php');
require(BASE . 'include/init.php');

$route = (isset($_GET['r']) ? $_GET['r'] : '');

$request = new request(new session(), new cookie());
$page_model = new page_model();

$router = new router($route, $request, $page_model);
$page = $router->getPage();
$page->runControllers();

echo $page->getResponseContent();

#echo "\n<!--\n";
#echo "page generated in " . round((microtime() - $start), 4) . " seconds";
#echo "\n-->";
?>