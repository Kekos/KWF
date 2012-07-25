<?php
/**
 * KWF Controller: Contact
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-07-24
 * @version 3.0
 */

class Contact extends Controller
  {
  public function _default()
    {
    Language::load('pages');

    $this->view = new view('contact');
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
      $errors['from'] = _('CONTACT_ERROR_NAME');
    if (!preg_match('/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,6})$/', $email))
      $errors['email'] = _('CONTACT_ERROR_MAIL');
    if (strlen($message) < 30)
      $errors['message'] = _('CONTACT_ERROR_MESSAGE');

    if (!count($errors))
      {
      $this->response->addInfo(_('CONTACT_INFO_SENT'));
      }
    else
      {
      $this->response->addFormError($errors);
      }

    if ($this->request->ajax_request)
      {
      $this->view = null;
      }
    }

  public function run()
    {
    if ($this->view != null)
      {
      $this->response->setContentType('html'); // The controller MUST set the content type
      $this->response->addContent($this->view->compile($this->route, $this->params));
      }
    }
  }
?>