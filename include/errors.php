<?php
/**
 * KWF Functions: error handling
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-07-30
 * @version 3.1
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
    new error_response(ERROR_LAYOUT, 'error_debug', $error_type, $data);
    }
  else
    {
    errorLog($error_type, $string, $file, $row, $error_trace, $error_hash);
    new error_response(RESPONSE_LAYOUT, 'error_user', 'Internt serverfel', $data);
    }
  }

function exceptionHandle($exception_obj)
  {
  $error_hash = md5(time() . 'KWF');
  $data = array('exception' => $exception_obj, 
    'error_hash' => $error_hash);

  if (DEBUG)
    {
    new error_response(ERROR_LAYOUT, 'exception_debug', 'Exception', $data);
    }
  else
    {
    errorLog('Exception', $exception_obj->getMessage(), $exception_obj->getFile(), 
      $exception_obj->getLine(), $exception_obj->getTrace(), $error_hash);
    new error_response(RESPONSE_LAYOUT, 'error_user', 'Internt serverfel', $data);
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

class error_response
  {
  private $title = '';
  private $error_messages = array();
  private $info_messages = array();
  private $content_data = '';

  public function __construct($layout, $view, $title, $data)
    {
    $this->title = $title;
    ob_end_clean();

    $ajax_request = false;
    if (isset($_SERVER['HTTP_X_AJAX_REQUEST']) && $_SERVER['HTTP_X_AJAX_REQUEST'])
      {
      $ajax_request = true;
      }

    $content_type = 'text/html';
    if ($ajax_request)
      {
      header('X-ajax-error: true');
      $content_type = 'text/plain';
      }

    header('Content-Type: ' . $content_type . '; charset=utf-8');

    $view = new View($view, $data);
    $this->content_data = $view->compile();

    if (!$ajax_request)
      {
      ob_start();
      require(BASE . $layout);
      }
    else
      {
      echo $this->content_data;
      }

    die();
    }
  }
?>