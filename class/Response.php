<?php
/**
 * KWF Class: Response, handles everything that is outputted
 *
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2014-02-07
 * @version 5.3
 */

class Response
  {
  static $form_messages = array();

  private $request;
  private $view = null;
  private $content_type = null;
  private $content_data = '';
  private $error_messages = array();
  private $info_messages = array();

  public $no_layout = false;
  public $title = '';
  public $data = array();

  public function __construct($request, $view)
    {
    $this->request = $request;
    $this->view = $view;
    }

  /**
   * Adds a error message to error-array
   *
   * @param string[]|string $msg A string describing the error, or a array containing such strings
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

  /**
   * Adds a info message to info-array
   *
   * @param string[]|string $msg A string describing the info, or a array containing such strings
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

  /**
   * Adds a error message to form error-array
   *
   * @param string[]|string $msg A string describing the error, or a array containing such strings
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

  /**
   * Echoes a <span> containing a form error message
   *
   * @param string $element The name of form element to return error message for
   */
  static function getFormError($element)
    {
    if (isset(Response::$form_messages[$element]))
      {
      echo '<strong class="kwf-form-error">' . Response::$form_messages[$element] . '</strong>';
      }

    echo "\n";
    }

  /**
   * Defines the HTTP response content type of the output. Must be the same through the whole
   * request, else an error will be thrown
   *
   * @param string $content_type Can be one of the predefined short hand values, or a real content-type value
   */
  public function setContentType($content_type)
    {
    if ($content_type != null)
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
    }

  /**
   * Adds content to the HTTP response output
   *
   * @param string $content The content to be appended to the output
   */
  public function addContent($content)
    {
    $this->content_data .= $content;
    }

  /**
   * Get all of the content body that should be outputted. Sets the content type of response
   * If it is a AJAX request (or a non-layout response like RSS feed), the layout file is omitted
   *
   * @return string The content data that will be the output in response
   */
  public function getContent()
    {
    // First, handle AJAX requests specially
    if ($this->request->ajax_request)
      {
      // ...but only if they have some kind of messages in response
      if (count($this->error_messages) || count($this->info_messages) || count(Response::$form_messages))
        {
        $resp = array('title' => $this->title, 'content' => $this->content_data);

        if (count($this->error_messages))
          {
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

        // Let the inner content type be the one requested by the controllers
        $resp['content_type'] = $this->content_type;

        if ($this->request->post('X-frame-upload'))
          {
          // For iframe based AJAX file upload (IE tries to download this JSON otherwise)
          $this->content_type = 'text/html';
          // HTML encode, otherwise IE parses possible HTML in the response
          $this->content_data = htmlspecialchars(json_encode($resp));
          }
        else
          {
          // Let the comlete response content type be JSON, so it can be 
          // parsed by the JavaScript library
          $this->content_type = 'application/json';
          $this->content_data = json_encode($resp);
          }
        }
      // Just a fallback if no content type has been set here
      else if (empty($this->content_type))
        {
        $this->content_type = 'text/plain';
        }

      // Tell the JavaScript framework that this response is a result of an
      // earlier redirect happened.
      if ($this->request->session->get('kwf_redirect'))
        {
        header('X-kwf-redirect-url: ' . urlModr($this->request->params));
        $this->request->session->delete('kwf_redirect');
        }
      }

    // If no content type has been set yet, let the Page view decide it
    if ($this->view != null && empty($this->content_type))
      {
      $this->setContentType($this->view->getContentType());
      }

    // Send Content-Type header to client. Always assume we are using UTF-8
    header('Content-Type: ' . $this->content_type . '; charset=utf-8');

    // AJAX responses OR if a controller requested the layout (page view) to 
    // be omitted OR if no page view was set
    if ($this->request->ajax_request || $this->no_layout || $this->view == null)
      {
      // Send the content ONLY to client NOT the page view
      return $this->content_data;
      }
    else if ($this->view != null)
      {
      // Add title and other data to view
      $this->view->addData('title', $this->title);
      $this->view->addData('route_parts', $this->request->params);
      $this->view->addData('error_messages', $this->error_messages);
      $this->view->addData('info_messages', $this->info_messages);
      $this->view->addData('content_data', $this->content_data);
      $this->view->addData('data', $this->data);

      // Compile the layout view
      return $this->view->compile();
      }
    }

  /**
   * Redirects the browser to a different URL, then ends all output
   *
   * @param string $url The URL to redirect the browser to
   */
  public function redirect($url)
    {
    // The JavaScript framework wants to know when a redirect occured.
    // The only way to fix this is by saving a session and then append the new
    // URL when second response is made.
    if ($this->request->ajax_request)
      {
      $this->request->session->set('kwf_redirect', true);
      }

    header('Location: ' . $url);
    die('Redirecting to <a href="' . $url . '">' . $url . '</a>');
    }
  }
?>