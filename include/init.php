<?php
/**
 * KWF System: Initiation
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-07-21
 * @version 5.1
 */

if (!defined('BASE'))
  die('Access denied.');

define('KWF_VERSION', '5.1');

if (get_magic_quotes_gpc())
  {
  $process = array(&$_GET, &$_POST, &$_COOKIE);
  while (list($key, $val) = each($process))
    {
    foreach ($val as $k => $v)
      {
      unset($process[$key][$k]);
      if (is_array($v))
        {
        $process[$key][stripslashes($k)] = $v;
        $process[] = &$process[$key][stripslashes($k)];
        }
      else
        {
        $process[$key][stripslashes($k)] = stripslashes($v);
        }
      }
    }

  unset($process);
  }

require(BASE . 'include/errors.php');
require(BASE . 'include/functions.php');
require(BASE . 'include/functions_extra.php');

ini_set('register_globals', false);
ini_set('register_long_arrays', false);
ini_set('magic_quotes_runtime', false);
date_default_timezone_set('Europe/Paris');
?>