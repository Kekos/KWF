<?php
/**
 * KWF Class: Response, handles everything that is outputted
 *
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-11-09
 * @version 4.0
 */

class Response
  {
  static $form_messages = array();

  private $request;
  private $content_type = null;
  private $content_data;
  private $error_messages = array();
  private $info_messages = array();

  public $no_layout;
  public $title = '';
  public $data = array();

  public function __construct($request)
    {
    $this->request = $request;
    }

  /*
   * Adds a error message to error-array
   *
   * @param array(string)/string $msg A string describing the error, or a array containing such strings
   * @return void
   */
  public function addError($msg)
    {
    if (is_array($msg))
      {
      $this->error_messages = array_merge($this->error_messages, $msg);
      }
    else
      {
      $this->error_messages[] = $msg;
      }
    }

  /*
   * Adds a info message to info-array
   *
   * @param array(string)/string $msg A string describing the info, or a array containing such strings
   * @return void
   */
  public function addInfo($msg)
    {
    if (is_array($msg))
      {
      $this->info_messages = array_merge($this->info_messages, $msg);
      }
    else
      {
      $this->info_messages[] = $msg;
      }
    }

  /*
   * Adds a error message to form error-array
   *
   * @param array(string)/string $msg A string describing the error, or a array containing such strings
   * @return void
   */
  public function addFormError($msg)
    {
    if (is_array($msg))
      {
      Response::$form_messages = array_merge(Response::$form_messages, $msg);
      }
    else
      {
      Response::$form_messages[] = $msg;
      }
    }

  /*
   * Echoes a <span> containing a form error message
   *
   * @param string $element The name of form element to return error message for
   * @return void
   */
  static function getFormError($element)
    {
    if (isset(Response::$form_messages[$element]))
      {
      echo '<span class="form-error">' . Response::$form_messages[$element] . '</span>';
      }

    echo "\n";
    }

  /*
   * Defines the HTTP response content type of the output. Must be the same through the whole
   * request, else an error will be thrown
   *
   * @param string $content_type Can be one of the predefined short hand values, or a real content-type value
   * @return void
   */
  public function setContentType($content_type)
    {
    switch ($content_type)
      {
      case 'xhtml':
        if (stristr($_SERVER['HTTP_ACCEPT'], 'application/xhtml+xml') || stristr($_SERVER['HTTP_USER_AGENT'], 'W3C_Validator'))
          {
          $content_type = 'application/xhtml+xml';
          }
        else
          {
          $content_type = 'text/html';
          }
      break;

      case 'html':
        $content_type = 'text/html';
      break;

      case 'plain':
        $content_type = 'text/plain';
      break;

      case 'xml':
        $content_type = 'application/xml';
      break;

      case 'atom':
        $content_type = 'application/atom+xml';
      break;

      case 'rss':
        $content_type = 'application/rss+xml';
      break;

      case 'json':
        $content_type = 'application/json';
      break;
      }

    if ($this->content_type == null)
      {
      $this->content_type = $content_type;
      }
    else if ($this->content_type != $content_type)
      {
      throw new Exception('The controllers tried to set different HTTP content types. This cannot be done. Execution terminated');
      }
    }

  /*
   * Adds content to the HTTP response output
   *
   * @param string $content The content to be appended to the output
   * @return void
   */
  public function addContent($content)
    {
    $this->content_data .= $content;
    }

  /*
   * Get all of the content body that should be outputted. Sets the content type of response
   * If it is a AJAX request (or a non-layout response like RSS feed), the layout file is omitted
   *
   * @return string The content data that will be the output in response
   */
  public function getContent()
    {
    if (!file_exists(BASE . RESPONSE_LAYOUT))
      {
      throw new Exception('Layout file "' . RESPONSE_LAYOUT . '" is missing');
      }

    if ($this->request->ajax_request)
      {
      if (count($this->error_messages) || count($this->info_messages) || count(Response::$form_messages))
        {
        $resp = array('title' => $this->title, 'content' => $this->content_data);

        if (count($this->error_messages))
          {
          header('X-ajax-error: true');
          $resp['errors'] = $this->error_messages;
          }

        if (count($this->info_messages))
          {
          $resp['info'] = $this->info_messages;
          }

        if (count(Response::$form_messages))
          {
          $resp['form_errors'] = Response::$form_messages;
          }

        if ($this->request->post('X-frame-upload'))
          {
          $this->content_type = 'text/html'; // For iframe based AJAX file upload (IE tries to download this JSON otherwise)
          $this->content_data = htmlspecialchars(json_encode($resp)); // Otherwise IE parses possible HTML in the response
          }
        else
          {
          $inner_content_type = $this->content_type;
          $this->content_type = 'application/json';
          $resp['content_type'] = $inner_content_type;
          $this->content_data = json_encode($resp);
          }
        }
      else if (empty($this->content_type))
        {
        $this->content_type = 'text/plain';
        }
      }

    if (empty($this->content_type))
      $this->setContentType('html');

    header('Content-Type: ' . $this->content_type . '; charset=utf-8');

    $data = &$this->data;

    if ($this->request->ajax_request || $this->no_layout)
      {
      return $this->content_data;
      }
    else
      {
      ob_start();
      require(BASE . RESPONSE_LAYOUT);
      return ob_get_clean();
      }
    }

  /*
   * Redirects the browser to a different URL, then ends all output
   *
   * @param string $url The URL to redirect the browser to
   * @return void
   */
  public function redirect($url)
    {
    if ($this->request->ajax_request)
      {
      /* This is a walk-around for a Firefox bug (when an AJAX request is 
          redirected, the new request loses its previous sent headers) */
      $this->request->session->set('was_ajax_request', true);
      }

    header('Location: ' . $url);
    die();
    }
  }
?>