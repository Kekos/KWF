<?php
/**
 * KWF Class: DbObject, the generalized database object class. Must be extended
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-08-21
 * @version 2.3
 */

abstract class DbObject
  {
  protected $_model = null;

  private $_edited = array();

  public function __sleep()
    {
    return array("\0DbObject\0_edited");
    }

  /*
   * Setter for object's properties. For internal use by db_objects.
   * Makes sure that property changes gets saved into database
   *
   * @param string $name Name of property
   * @param string $value New value of property
   */
  protected function _set($property, $value)
    {
    if ($this->$property !== $value)
      {
      $this->$property = $value;
      $this->_edited[$property] = true;
      }
    }

  /*
   * Getter for object's protected properties
   *
   * @param string $name Name of property
   * @return mixed Value of requested property
   */
  public function __get($name)
    {
    return $this->$name;
    }

  /*
   * Creates an UPDATE query (only the SET part)
   *
   * @return string The SET part of an UPDATE SQL query
   */
  protected function _updateQuery()
    {
    $query = array();

    foreach ($this->_edited as $property => $v)
      {
      $query[] = '`' . $property . '` = ?';
      }

    return implode(', ', $query);
    }

  /*
   * Creates an INSERT query (only the fields and VALUES part)
   *
   * @return string The fields and VALUES part of an INSERT SQL query
   */
  protected function _insertQuery()
    {
    $query_fields = array();
    $query_values = array();

    foreach ($this->_edited as $property => $v)
      {
      $query_fields[] = '`' . $property . '`';
      $query_values[] = '?';
      }

    return '(' . implode(', ', $query_fields) . ') VALUES (' . implode(', ', $query_values) . ')';
    }

  /*
   * Returns the values of changed properties
   *
   * @return array(mixed) Array of changed properties
   */
  protected function _getEdited()
    {
    $values = array();

    foreach ($this->_edited as $property => $v)
      {
      $values[] = $this->$property;
      }

    return $values;
    }

  /*
   * Returns a string with type definitions of changed properties
   *
   * @return string String with a 's' for every changed property
   */
  protected function _getTypes()
    {
    return str_repeat('s', count($this->_edited));
    }

  /*
   * Restores the internal counter for changed properties
   *
   * @return void
   */
  protected function _restoreEdited()
    {
    $this->_edited = array();
    }

  /*
   * Populates the object's properties with values from array
   * Shouldn't be used with MySQLi (Improved) because it has this funtionality built-in
   *
   * @return void
   */
	protected function _populate($array)
    {
    foreach ($array as $property => $value)
      {
      $this->$property = $value;
      }
    }
  }
?>