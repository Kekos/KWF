<?php
/**
 * KWF Controller: Contact
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-06-12
 * @version 3.0
 */

class Contact extends Controller
  {
  public function _default()
    {
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
      $errors['from'] = 'Du måste ange ditt namn.';
    if (!preg_match('/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,6})$/', $email))
      $errors['email'] = 'Du måste ange en korrekt e-postadress.';
    if (strlen($message) < 30)
      $errors['message'] = 'Skriv ett lite längre meddelande.';

    if (!count($errors))
      {
      $this->response->addInfo('Meddelandet har skickats!');
      $this->view = null;
      }
    else
      {
      $this->response->addFormError($errors);
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