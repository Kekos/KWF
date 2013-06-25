<?php
/**
 * KWF Controller: Contact
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-03-01
 * @version 3.1
 */

class Contact extends Controller
  {
  public function _default()
    {
    Language::load('pages');

    $this->view = new HTMLView('contact');
    if ($this->request->post('send'))
      {
      $this->sendMail();
      }
    }

  private function sendMail()
    {
    $errors = array();
    $from = $this->request->post('from');
    $email = $this->request->post('email');
    $message = $this->request->post('message');

    if (empty($from))
      $errors['from'] = __('CONTACT_ERROR_NAME');
    if (!preg_match('/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,6})$/', $email))
      $errors['email'] = __('CONTACT_ERROR_MAIL');
    if (strlen($message) < 30)
      $errors['message'] = __('CONTACT_ERROR_MESSAGE');

    if (!count($errors))
      {
      $this->view = new HTMLView('contact-sent');
      }
    else
      {
      $this->response->addFormError($errors);

      if ($this->request->ajax_request)
        {
        $this->view = null;
        }
      }
    }

  public function run()
    {
    if ($this->view != null)
      {
      $this->response->addContent($this->view->compile($this->route, $this->params));
      }
    }
  }
?>