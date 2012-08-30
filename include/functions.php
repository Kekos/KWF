<?php
/**
 * KWF Functions
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-08-30
 * @version 3.1
 */

function __autoload($class_name)
  {
  $path = BASE . 'class/' . $class_name . '.php';
  if (!file_exists($path))
    {
    $path = BASE . 'class/model/' . $class_name . '.php';
    if (!file_exists($path))
      {
      $path = BASE . 'class/controller/' . $class_name . '.php';
      if (!file_exists($path))
        {
        throw new Exception('Controller file "' . $class_name . '" is missing');
        }
      }
    }

  require($path);
  }

function easyDate($time_pattern, $timestamp, $lowercase = 0)
  {
  $date = date('Y-m-d', $timestamp);
  if ($date == date('Y-m-d'))
    $date = ($lowercase) ? __('DATE_TODAY_LOW') : __('DATE_TODAY');
  else if ($date == date('Y-m-d', strtotime('today -1 day')))
    $date = ($lowercase) ? __('DATE_YESTERDAY_LOW') : __('DATE_YESTERDAY');
  else
    $date = date(__('DATE_FORMAT'), $timestamp);

  $date .= ' ' . date($time_pattern, $timestamp);

  if ($timestamp == 0)
    $date = '-';

  return $date;
  }

function nl2brSafe($str)
  {
  $str = preg_replace("/(\r\n|\r|\n)/", '<br />', $str);
  return $str;
  }

function urlFilter($param)
  {
  return ($param !== '');
  }

function urlCreate($params)
  {
  $params = array_filter($params, 'urlFilter');

  if (count($params))
    return implode('/', $params) . '/';
  else
    return '';
  }

function urlModr()
  {
  $url = (MOD_REWRITE ? FULLPATH . '/' : BASE . 'index.php?r=');
  if (func_num_args() > 0)
    $params = (is_array(func_get_arg(0)) ? func_get_arg(0) : func_get_args());
  else
    $params = array();

  return $url . urlCreate($params);
  }

function urlModrOuter()
  {
  $url = FULLURL . (MOD_REWRITE ? '/' : '/index.php?r=');
  if (func_num_args() > 0)
    $params = (is_array(func_get_arg(0)) ? func_get_arg(0) : func_get_args());
  else
    $params = array();

  return $url . urlCreate($params);
  }

function urlModrAdd($params, $new_param)
  {
  if (!is_array($new_param))
    $new_param = array($new_param);

  $params = array_merge($params, $new_param);

  return urlModr($params);
  }

function urlModrRange($params, $start, $end)
  {
  if ($end < 0)
    {
    $end = count($params) + $end;
    }
  else
    ++$end;

  return urlModr(array_splice($params, $start, $end));
  }

function urlSafe($str, $allow_extra = '')
  {
  $str = utf8_encode(strtolower(utf8_decode($str)));
  $pattern = array('Å', 'Ä', 'Ö', 'å', 'ä', 'ö');
  $repl = array('a', 'a', 'o', 'a', 'a', 'o');
  $str = str_replace($pattern, $repl, $str);
  $str = preg_replace("/[^A-Za-z0-9" . $allow_extra . "]/i", '-', $str);
  $str = preg_replace("/-+/i", '-', $str);
  $str = preg_replace("/^-|-$/i", '', $str);
  return $str;
  }

function generatePassword($length)
  {
  $password = '';
  $tiny_letters = range('a', 'z');
  $humongous_letters = range('A', 'Z');
  $we_r_special = array('<', '@', '#', '$', '%', '&', '>');
  for ($i = 0; $i < $length; $i++)
    {
    $rand = mt_rand(0, 6);
    if ($rand < 3)
      $password .= $tiny_letters[mt_rand(0, 25)];
    else if ($rand == 3)
      $password .= $humongous_letters[mt_rand(0, 25)];
    else if ($rand < 6)
      $password .= mt_rand(0, 9);
    else if ($rand == 6)
      $password .= $we_r_special[mt_rand(0, count($we_r_special) - 1)];
    }

  return $password;
  }

function getWeekday($id)
  {
  $w = __('DATE_WEEKDAYS');
  return $w[$id];
  }

function getMonth($id)
  {
  if ($id[0] == '0')
    $id = $id[1];

  $m = __('DATE_MONTHS');
  return $m[$id];
  }

function logMsg($class, $what)
  {
  $text = '[' . date('Y-m-d H:i') . '] ' . $class . ' logs: ' . $what . "\r\n";
  file_put_contents(BASE . $class . '.log', $text, FILE_APPEND);
  }

function move_ajax_uploaded_file($source_stream, $destination_name)
  {
  if (!$new_file = fopen($destination_name, 'w'))
    return false;

  $bytes = stream_copy_to_stream($source_stream, $new_file);
  fclose($new_file);
  return $bytes;
  }

function stringIndex($array, $index)
  {
  $index = explode('[', $index);
  $element = $array;

  for ($i = 0; $i < count($index); $i++)
    {
    $this_index = ($i > 0 ? substr($index[$i], 0, -1) : $index[$i]);

    if (isset($element[$this_index]))
      $element = $element[$this_index];
    else
      return '__KWF_UNSET_ELEMENT';
    }

  return $element;
  }

function __($lang_key)
  {
  global $lang;
  $args = func_get_args();
  array_shift($args);

  if (is_array($lang[$lang_key]))
    {
    return $lang[$lang_key];
    }

  return vsprintf($lang[$lang_key], $args);
  }
?>