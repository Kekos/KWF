<?php
/**
 * KWF Controller: Index
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-06-12
 * @version 2.3
 */

class Index extends Controller
  {
  #private $db = null;

  public function _default()
    {
    $this->view = new view('index');
    #$this->response->addInfo('Kakan innehåller ' . $this->request->cookie->get('kwf_cookie'));

    #$this->db = db_mysqli::getInstance();
    }

  public function set($value)
    {
    $this->view = new view('index');

    if (strlen($value) > 0)
      {
      $this->request->cookie->set('kwf_cookie', $value, 0, '/');
      $this->response->addInfo('Kakan sattes till ' . $value);
      }
    }

  public function delete()
    {
    $this->view = new view('index');

    $this->request->cookie->delete('kwf_cookie', '/');
    $this->response->addInfo('Kakan togs bort.');
    }

  public function redirect()
    {
    $this->response->redirect(urlModr('kontakt'));
    }

  public function run()
    {
    if ($this->view != null)
      {
      $this->response->setContentType('html');
      $this->response->addContent($this->view->compile($this->route, $this->params));
      }
    }
  }
?>