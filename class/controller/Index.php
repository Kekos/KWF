<?php
/**
 * KWF Controller: Index
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-03-17
 * @version 3.0
 */

class Index extends Controller
  {
  #private $db = null;

  public function before()
    {
    Language::load('pages');
    }

  public function _default()
    {
    $this->view = new HTMLView('index');
    #$this->response->addInfo(__('HOME_INFO_COOKIE_IS', $this->request->cookie->get('kwf_cookie')));

    #$this->db = DbMysqli::getInstance();
    }

  public function set($value)
    {
    $this->view = new HTMLView('index');

    if (strlen($value) > 0)
      {
      $this->request->cookie->set('kwf_cookie', $value, 0, '/');
      $this->response->addInfo(__('HOME_INFO_COOKIE_SET', $value));
      }
    }

  public function delete()
    {
    $this->view = new HTMLView('index');

    $this->request->cookie->delete('kwf_cookie', '/');
    $this->response->addInfo(__('HOME_INFO_COOKIE_DELETE'));
    }

  public function redirect()
    {
    $this->response->redirect(urlModr('kontakt'));
    }

  public function language($lang_code)
    {
    if (strlen($lang_code) == 2)
      {
      try
        {
        Language::set($lang_code);
        $this->before();
        }
      catch (Exception $ex)
        {
        $this->response->addError(__('HOME_ERROR_NO_LANG'));
        }
      }

    $this->_default();
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