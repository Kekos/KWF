<?php
/**
 * KWF Class: Request, handles the request of the document, like POST, AJAX, cookies and sessions
 *
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-01-18
 * @version 3.1
 */

class Request
  {
  public $params = array();
  public $redirect_params = array();
  public $session;
  public $cookie;
  public $ajax_request = false;

  /**
   * Constructor: request
   *
   * @param Session $session The session object that will be used through the whole request
   * @param Cookie $cookie The cookie object that will be used through the whole request
   */
  public function __construct($session, $cookie)
    {
    $this->session = $session;
    $this->cookie = $cookie;

    if ($this->server('HTTP_X_AJAX_REQUEST') || $this->post('X-ajax-request'))
      {
      $this->ajax_request = true;
      }

    if ($this->session->get('was_ajax_request'))
      {
      $this->ajax_request = true;
      $this->session->delete('was_ajax_request');
      }

    unset($_GET);
    }

  /**
   * Get a SERVER variable
   *
   * @param string $key The array key that identificates the variable
   * @param bool|int $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string|bool Returns the SERVER variable or false/empty string
   */
  public function server($key, $return_empty_undefined = 0)
    {
    if (isset($_SERVER[$key]))
      {
      return $_SERVER[$key];
      }
    else
      {
      return ($return_empty_undefined ? '' : false);
      }
    }

  /**
   * Get a POST variable
   *
   * @param string $key The array key that identificates the variable
   * @param bool|int $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string|bool Returns the POST variable or false/empty string
   */
  public function post($key, $return_empty_undefined = 0)
    {
    $value = stringIndex($_POST, $key);

    if ($value == '__KWF_UNSET_ELEMENT')
      {
      return ($return_empty_undefined ? '' : false);
      }
    else
      {
      return $value;
      }
    }

  /**
   * Get a FILE file, uploaded through a classic form or with the KWF AJAX functions.
   * If it is uploaded through AJAX, the array returned from this function will 
   * have an "ajax" key set together with a "stream" key containing the stream 
   * to the uploaded temporary file.
   *
   * @param string $key The array key that identificates the file
   * @return bool|string[] Returns the FILE file info or false
   */
  public function file($key)
    {
    if (isset($_FILES[$key]))
      {
      if (is_array($_FILES[$key]['name']))
        {
        $new_files = array();

        foreach ($_FILES[$key] as $fieldname => $fieldval)
          {
          foreach ($fieldval as $i => $value)
            {
            $new_files[$i][$fieldname] = $value;
            }
          }

        return $new_files;
        }
      else
        {
        return $_FILES[$key];
        }
      }
    else
      {
      return false;
      }
    }

  /**
   * Outputs HTML for use in forms to preserve the state of POST forms. Escapes inappropriate chars
   *
   * @param string $key The array key that identificates the variable that holds the value
   * @param string $type The type of HTML form element to output (text|radio|checkbox|textarea|select)
   * @param string $compare A value to compare with the POST value, used with radio, checkbox or select
   * @param string $default If the POST value doesn't exist, then this is the default value to print
   */
  static function formStatePost($key, $type, $compare = '', $default = '')
    {
    $value = stringIndex($_POST, $key);

    if ($value != '__KWF_UNSET_ELEMENT' && ($value !== ''))
      {
      echo request::formState($type, htmlspecialchars($value), $compare);
      }
    else if ($default !== '')
      {
      echo request::formState($type, htmlspecialchars($default), $compare);
      }
    }

  /*
   * Help function for the formState functions
   *
   * @param string $type The type of HTML form element to return (text|radio|checkbox|textarea|select)
   * @param string $value The value of the posted element
   * @param string $compare A value to compare with the posted value, used with radio, checkbox or select
   * @return string HTML for forms
   */
  static function formState($type, $value, $compare)
    {
    if ($type == 'text')
      return ' value="' . $value . '"';
    else if (($type == 'radio' || $type == 'checkbox') && $value == $compare)
      return ' checked="checked"';
    else if ($type == 'textarea')
      return $value;
    else if ($type == 'select' && $value == $compare)
      return ' selected="selected"';
    }
  }
?>