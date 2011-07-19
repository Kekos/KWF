<?php
/**
 * KWF System: Initiation
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-06-17
 * @version 3.0
 */

if (!defined('BASE'))
  die('Access denied.');

define('KWF_VERSION', '3.4');

require(BASE . 'include/errors.php');
require(BASE . 'include/functions.php');
require(BASE . 'include/functions_extra.php');

ini_set('register_globals', false);
ini_set('register_long_arrays', false);
ini_set('magic_quotes_gpc', false);
ini_set('magic_quotes_runtime', false);
date_default_timezone_set('Europe/Paris');
?>