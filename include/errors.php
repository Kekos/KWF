<?php
/**
 * KWF Functions: error handling
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-11-12
 * @version 5.2
 */

if (!defined('BASE'))
  die('Access denied.');

error_reporting(-1);

set_exception_handler('exceptionHandle');
set_error_handler('errorHandle');

function errorHandle($nr, $string, $file, $row, $context)
  {
  if (error_reporting() === 0)
    {
    return false;
    }

  $error_types = array(1 => 'E_ERROR',
    2 => 'E_WARNING',
    4 => 'E_PARSE',
    8 => 'E_NOTICE',
    16 => 'E_CORE_ERROR',
    32 => 'E_CORE_WARNING',
    64 => 'E_COMPILER_ERROR',
    128 => 'E_COMPILER_WARNING',
    256 => 'E_USER_ERROR',
    512 => 'E_USER_WARNING',
    1024 => 'E_USER_NOTICE',
    2048 => 'E_STRICT');

  $error_type = $error_types[$nr];
  $error_trace = debug_backtrace();
  $error_hash = md5(time() . 'KWF');
  $data = array('string' => $string, 
    'file' => $file, 
    'row' => $row, 
    'error_trace' => $error_trace, 
    'error_hash' => $error_hash);

  if (DEBUG)
    {
    new ErrorResponse(ERROR_LAYOUT, 'error_debug', $error_type, $data);
    }
  else
    {
    errorLog($error_type, $string, $file, $row, $error_trace, $error_hash);
    new ErrorResponse(RESPONSE_LAYOUT, 'error_user', 'Internt serverfel', $data);
    }
  }

function exceptionHandle($exception_obj)
  {
  $error_hash = md5(time() . 'KWF');
  $data = array('exception' => $exception_obj, 
    'error_hash' => $error_hash);

  if (DEBUG)
    {
    new ErrorResponse(ERROR_LAYOUT, 'exception_debug', 'Exception', $data);
    }
  else
    {
    errorLog('Exception', $exception_obj->getMessage(), $exception_obj->getFile(), 
      $exception_obj->getLine(), $exception_obj->getTrace(), $error_hash);
    new ErrorResponse(RESPONSE_LAYOUT, 'error_user', 'Internt serverfel', $data);
    }
  }

function errorLog($error_type, $string, $file, $row, $error_trace, $error_hash)
  {
  $text = $error_hash . ' (' . date('Y-m-d H:i') . "):\n[Error type]: " . $error_type . "\n[Message]: " . $string . "\n[File]: " . $file . "\n[Row]: " . $row . "\n";
  $text .= "[Trace]:\n";
  foreach ($error_trace as $t)
    {
    $text .= '--Function: ' . (isset($t['class']) ? $t['class'] . '->' . $t['function'] : $t['function']) . "\n";
    $text .= '--File: ' . (isset($t['file']) ? $t['file'] : '') . "\n";
    $text .= '--Line: ' . (isset($t['line']) ? $t['line'] : '') . "\n";
    $text .= '--Argument: ' . print_r($t['args'], 1) . "\n\n";
    }

  file_put_contents(ERROR_LOG_PATH . BASE . 'error.log', $text . "---------------------------------------------------------------------------------\n", FILE_APPEND);
  }

class ErrorResponse
  {
  public function __construct($layout, $view, $title, $data)
    {
    if (ob_get_length())
      {
      ob_end_clean();
      }

    $ajax_request = false;
    if (isset($_SERVER['HTTP_X_AJAX_REQUEST']) && $_SERVER['HTTP_X_AJAX_REQUEST'])
      {
      $ajax_request = true;
      }

    $content_type = 'text/html';
    if ($ajax_request)
      {
      header('X-kwf-runerror: true');
      $content_type = 'text/plain';
      }

    header('Content-Type: ' . $content_type . '; charset=utf-8');

    $view = new HTMLView($view, $data);
    $content_data = $view->compile();
    $error_messages = array();
    $info_messages = array();

    if (!$ajax_request)
      {
      ob_start();
      require(BASE . 'view/' . $layout . '.phtml');
      }
    else
      {
      echo $content_data;
      }

    die();
    }
  }
?>