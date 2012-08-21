<?php
/**
 * KWF System: Initiation
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-08-21
 * @version 4.0
 */

if (!defined('BASE'))
  die('Access denied.');

define('KWF_VERSION', '4.0');

require(BASE . 'include/errors.php');
require(BASE . 'include/functions.php');
require(BASE . 'include/functions_extra.php');

ini_set('register_globals', false);
ini_set('register_long_arrays', false);
ini_set('magic_quotes_runtime', false);
date_default_timezone_set('Europe/Paris');
?>