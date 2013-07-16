<?php
/**
 * KWF Controller: AEDtestController
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-07-16
 * @version 1.0
 */

class AEDtestController extends Controller
  {
  private $model_item = null;

  public function before()
    {
    $this->model_item = new ItemModel();
    Language::load('pages');
    }

  public function _default()
    {
    if ($this->request->post('new_item_submit'))
      {
      $this->newItem();
      }

    if (!$this->is_ajax_postback)
      {
      $data['items'] = $this->model_item->fetchAll();
      $this->view = new HTMLView('list-items', $data);
      }
    }

  public function edit($item_id)
    {
    if ($this->request->post('edit_item_submit'))
      {
      $this->editItem($item_id);
      }

    if (!$this->is_ajax_postback)
      {
      $data['item'] = $this->model_item->fetch($item_id);
      $this->view = new HTMLView('edit-item', $data);
      }
    }

  public function delete($item_id)
    {
    if ($this->request->post('delete_item_yes'))
      {
      $this->deleteItem($item_id);
      $this->_default();
      }
    else if ($this->request->post('delete_item_no'))
      {
      $this->response->redirect(urlModr($this->route));
      }
    else
      {
      $data['item'] = $this->model_item->fetch($item_id);
      $this->view = new HTMLView('delete-item', $data);
      }
    }

  private function newItem()
    {
    $name = trim($this->request->post('name'));

    $item_id = $this->model_item->insert($name);

    if ($this->request->ajax_request)
      {
      $view_collection[] = new HTMLView('item', array(
          'item' => $name, 
          'id' => $item_id));

      $this->view = new JsonViewsCollection(array(
          'action' => 'add'), $view_collection);
      }

    $this->response->addInfo(__('AED_INFO_CREATED'));
    }

  private function editItem($item_id)
    {
    $name = trim($this->request->post('name'));

    $this->model_item->update($name, $item_id);

    if ($this->request->ajax_request)
      {
      $view_collection[] = new HTMLView('item', array(
          'item' => $name, 
          'id' => $item_id));

      $this->view = new JsonViewsCollection(array(
          'action' => 'edit',
          'id' => 'item_' . $item_id), $view_collection);
      }

    $this->response->addInfo(__('AED_INFO_EDITED'));
    }

  private function deleteItem($item_id)
    {
    $this->model_item->delete($item_id);
    $this->response->addInfo(__('AED_INFO_DELETED'));

    if ($this->request->ajax_request)
      {
      $this->view = new JsonView(array(
          'action' => 'delete',
          'ids' => array('item_' . $item_id)));
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