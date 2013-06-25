<?php
/**
 * KWF Functions
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-06-14
 * @version 4.0
 */

/**
 * Includes a class definition file
 *
 * Magic PHP function, called when a class is going to be constructed but is
 * not yet included. This function includes that class definition file.
 * Looks in three different folders (1. class/ 2. class/model/ 3. class/controller/)
 *
 * @param string $class_name Name of the class to include
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

/**
 * Formats a time stamp with preferred format and "today/yesterday" notations
 *
 * @param string $time_pattern The format pattern to use for time part
 * @param int $timestamp An UNIX timestamp
 * @param bool $lowercase]Set to true for lowercase "today/yesterday". Default is false (uppercase)
 * @return string The formatted time stamp
 */
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

/**
 * Translates all line breaks (UNIX type, Windows type and Mac type ones) to 
 * HTML <br /> break tag
 *
 * @param string $str The string to translate
 * @return string The translated string
 */
function nl2brSafe($str)
  {
  $str = preg_replace("/(\r\n|\r|\n)/", '<br />', $str);
  return $str;
  }

/**
 * (Internal) Filter for urlCreate()
 *
 * @ignore
 * @param string $param A URL parameter to test
 * @return bool True if $param is non-empty
 */
function urlFilter($param)
  {
  return ($param !== '');
  }

/**
 * (Internal) Creates a new slash-separated URL, with no empty parameters
 *
 * @ignore
 * @param string[] $params The parameter parts
 * @return string The finished URL
 */
function urlCreate($params)
  {
  $params = array_filter($params, 'urlFilter');

  if (count($params))
    return implode('/', $params) . '/';
  else
    return '';
  }

/**
 * Creates a new slash-separated URL relative to the application's root
 *
 * @param string $param,... A parameter part (optional to have any parts at all)
 * @return string The finished URL
 */
function urlModr()
  {
  $url = (MOD_REWRITE ? FULLPATH . '/' : BASE . 'index.php?r=');
  if (func_num_args() > 0)
    $params = (is_array(func_get_arg(0)) ? func_get_arg(0) : func_get_args());
  else
    $params = array();

  return $url . urlCreate($params);
  }

/**
 * Creates a new slash-separated URL relative to the application's full URL 
 * (including domain name etc.)
 *
 * @param string $param,... A parameter part (optional to have any parts at all)
 * @return string The finished URL
 */
function urlModrOuter()
  {
  $url = FULLURL . (MOD_REWRITE ? '/' : '/index.php?r=');
  if (func_num_args() > 0)
    $params = (is_array(func_get_arg(0)) ? func_get_arg(0) : func_get_args());
  else
    $params = array();

  return $url . urlCreate($params);
  }

/**
 * Adds one or several new parameters to an URL array and then creates a new
 * slash-separated URL relative to the application's root
 *
 * @param string[] $params The URL array
 * @param string|string[] $new_param The new parameter part or array with new parameters
 * @return string The finished URL
 */
function urlModrAdd($params, $new_param)
  {
  if (!is_array($new_param))
    $new_param = array($new_param);

  $params = array_merge($params, $new_param);

  return urlModr($params);
  }

/**
 * Removes one or several parameters from an URL array and then creates a new
 * slash-separated URL relative to the application's root
 *
 * @param string[] $params The URL array
 * @param int $start Offset to start removing parameters FROM
 * @param int $end The number of parameters to remove (if positive) OR the end
 *                 offset to stop removing parameters
 * @return string The finished URL
 */
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

/**
 * Escapes a string to be suitable for using in an URL
 *
 * Replaces NOT alphanumeric characters with dash. Removes double dashes (--)
 * with a single dash. Replaces the Swedish special characters å, ä, ö with 
 * a, a, o.
 *
 * @param string $str The string to escape
 * @param string $allow_extra Characters to NOT escape (you might need to 
 *                            escape these to confirm with Regex standard)
 * @return string Escaped string
 */
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

/**
 * Generates a secure, randomized, password
 *
 * Returns password with letters, numbers and the following characters:
 * < @ # $ % & >
 *
 * @param string $str The string to escape
 * @param string $allow_extra Characters to NOT escape (you might need to 
 *                            escape these to confirm with Regex standard)
 * @return string Escaped string
 */
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

/**
 * Returns the name of a week day from it's number, with 0 being Monday
 *
 * This function is aware of the current selected language.
 *
 * @param string|int $id The numeric representation of a week day (0 = Monday)
 * @return string Name of week day
 */
function getWeekday($id)
  {
  $w = __('DATE_WEEKDAYS');
  return $w[$id];
  }

/**
 * Returns the name of a month from it's number, with 1 being January
 *
 * This function is aware of the current selected language.
 *
 * @param string|int $id The numeric representation of a month (1 = January). 
 *                       Ignores leading zero if value is a string.
 * @return string Name of month
 */
function getMonth($id)
  {
  if ($id[0] == '0')
    $id = $id[1];

  $m = __('DATE_MONTHS');
  return $m[$id];
  }

/**
 * Logs a message with current time stamp in a log file
 *
 * @param string $class A name to group this message with
 * @param string $what The log message
 */
function logMsg($class, $what)
  {
  $text = '[' . date('Y-m-d H:i') . '] ' . $class . ' logs: ' . $what . "\r\n";
  file_put_contents(BASE . $class . '.log', $text, FILE_APPEND);
  }

/**
 * Saves an file uploaded with the old AJAX uploader. Will throw exception  
 *
 * @depracted
 * @throws Exception to notify developers that it's depracted
 * @param resource $source_stream The file stream
 * @param string $destination_name Destination file name
 * @return int The number of bytes written
 */
function move_ajax_uploaded_file($source_stream, $destination_name)
  {
  throw new Exception('Use of depracted method move_ajax_uploaded_file!');
  }

/**
 * Finds an array element using a string
 *
 * Example: string "arr[el1][el11]" returns element with key el11 in element
 * with key el1 in array arr
 *
 * @param mixed[] $array The array to search in
 * @param string $index Search string
 * @return mixed The value of the found element
 */
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

/**
 * Returns a phrase in the current selected language
 *
 * @param string $lang_key The phrase key
 * @param mixed $var,... Variables to format in to the phrase. Optional for 
 *                       some phrases
 * @return string The phrase
 */
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

/**
 * Exports a language phrase to be available in JavaScript
 *
 * @param string $lang_key The phrase key
 */
function langExport($key)
  {
  global $lang_export;

  if ($lang_export == null)
    {
    $lang_export = array();
    }

  if (!in_array($key, $lang_export))
    {
    $lang_export[] = $key;
    }
  }

/**
 * Echoes all exported language phrases in a <script> tag
 * Makes phrases available to JavaScript via the K.__() function.
 */
function scriptLanguageExport()
  {
  global $lang_export;
  if (isset($lang_export))
    {
    echo '<script>Kwf.languages = {';

    $i = 0;

    foreach ($lang_export as $lang)
      {
      echo ($i > 0 ? ', ' : '') . $lang . ": ";
      if (is_array(__($lang, '%s')))
        {
        echo "['" . implode("','", __($lang)) . "']";
        }
      else
        {
        echo '"' . addslashes(__($lang, '%s')) . '"';
        }

      $i++;
      }

    echo "};</script>\n";
    }
  }

/**
 * Echoes script tags for all scripts in js/app/ folder.
 */
function appScriptTags()
  {
  $js_directory = 'js/app';

  foreach (scandir(BASE . $js_directory) as $file)
    {
    if ($file != '.' && $file != '..')
      {
      echo '  <script src="' . FULLPATH . '/' . $js_directory . '/' . $file . '"></script>' . "\n";
      }
    }
  }
?>