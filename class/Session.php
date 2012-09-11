<?php
/**
 * KWF Class: Session, keeps track of all sessions and adds a little more security to sessions
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-09-11
 * @version 2.1
 */

class Session
  {
  public function __construct()
    {
    session_start();
    }

  /*
   * Sets a session variable
   *
   * @param string $key The array key that identificates the variable
   * @param string $value Value to store in variable
   * @return void
   */
  public function set($key, $value)
    {
    $_SESSION[SESSION_PREFIX . '_' . $key] = $value;
    }

  /*
   * Deletes a session variable
   *
   * @param string $key The array key that identificates the variable
   * @return void
   */
  public function delete($key)
    {
    unset($_SESSION[SESSION_PREFIX . '_' . $key]);
    }

  /*
   * Gets a session variable
   *
   * @param string $key The array key that identificates the variable
   * @param boolean/numeric $return_empty_undefined If true it returns an empty string if the variable doesn't exist
   * @return string/boolean Returns the session variable or false/empty string
   */
  public function get($key, $return_empty_undefined = 0)
    {
    if (isset($_SESSION[SESSION_PREFIX . '_' . $key]))
      {
      return $_SESSION[SESSION_PREFIX . '_' . $key];
      }
    else
      {
      return ($return_empty_undefined ? '' : false);
      }
    }
  }
?>