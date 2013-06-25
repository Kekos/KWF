<?php
/**
 * KWF Controller: Upload
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-05-07
 * @version 3.0
 */

class Upload extends Controller
  {
  private $action = false;

  public function before()
    {
    Language::load('pages');
    }

  public function _default()
    {
    if ($this->request->file('file'))
      {
      $this->doUpload();
      $this->action = true;
      }

    if (!($this->action && $this->request->ajax_request))
      {
      $data['uploads'] = scandir('uploads/');
      $this->view = new HTMLView('upload', $data);
      }
    }

  public function remove($file)
    {
    if (file_exists('uploads/' . $file))
      {
      unlink('uploads/' . $file);

      $this->response->addInfo(__('UPLOAD_INFO_DELETED', $file));
      if ($this->request->ajax_request)
        {
        $this->view = new JsonView(array('controller' => 'UploadController', 
          'action' => 'remove', 
          'file' => $file));
        }
      }
    else
      {
      $this->response->addError(__('UPLOAD_ERROR_DELETE', $file));
      }

    $this->action = true;
    $this->_default();
    }

  public function datetime()
    {
    $this->view = new JsonView(array('datetime' => __('UPLOAD_LAST_UPDATE', date(__('DATETIME_FORMAT') . ':s'))));
    }

  private function doUpload()
    {
    $files = $this->request->file('file');
    $file_names = array();

    if (isset($files['name']))
      {
      $files = array($files);
      }

    foreach ($files as $file)
      {
      if (@move_uploaded_file($file['tmp_name'], 'uploads/' . $file['name']))
        {
        $file_names[] = $file['name'];
        }
      }

    if ($this->request->ajax_request)
      {
      $view_collection = array();
      foreach ($file_names as $file)
        {
        $view_collection[] = new HTMLView('uploaded-file', array('file' => $file));
        }

      $this->view = new JsonViewsCollection(array('controller' => 'UploadController', 
          'action' => 'upload'), 
        $view_collection);
      }

    $this->response->addInfo(__('UPLOAD_INFO_UPLOADED', implode(', ', $file_names)));
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