<?php
/**
 * KWF Model: ItemModel
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-07-08
 * @version 1.0
 */

class ItemModel
  {
  private $items = array();
  private $changed = false;

  const DB_NAME = 'items.db';

  public function __construct()
    {
    if (!file_exists(BASE . self::DB_NAME))
      {
      $this->changed = true;
      $this->__destruct();
      }

    $this->items = json_decode(file_get_contents(BASE . self::DB_NAME), true);
    }

  public function __destruct()
    {
    if ($this->changed)
      {
      file_put_contents(BASE . self::DB_NAME, json_encode($this->items));
      }
    }

  public function fetch($id)
    {
    if (isset($this->items[$id]))
      {
      return $this->items[$id];
      }
    else
      {
      return null;
      }
    }

  public function fetchAll()
    {
    return $this->items;
    }

  public function insert($name)
    {
    $this->items[] = $name;
    $this->changed = true;

    return max(array_keys($this->items));
    }

  public function update($name, $id)
    {
    $this->items[$id] = $name;
    $this->changed = true;
    }

  public function delete($id)
    {
    unset($this->items[$id]);
    $this->changed = true;
    }
  }
?>