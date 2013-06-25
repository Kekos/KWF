<?php
/**
 * KWF Class: JsonEncoder, encodes real objects to JSON, wrapper for JsonSerializable for PHP < 5.4
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-02-10
 * @version 2.0
 */

class JsonEncoder
  {
  /**
   * Encodes object
   *
   * @param object $object The object to encode
   * @return string
   */
  static function encode($object)
    {
    // Is the installed version of PHP 5.4 or newer?
    if (strnatcmp(phpversion(), '5.4.0') >= 0)
      {
      return json_encode($object);
      }
    else
      {
      return json_encode(self::traverse($object));
      }
    }

  /**
   * Traverses a object and calls jsonSerialize for each object
   *
   * @param object $object The object to traverse
   * @return object
   */
  static function traverse($object)
    {
    // stdclass doesn't have the jsonSerialize method, instead it generates 
    // HTTP status 500
    if (is_object($object) && method_exists($object, 'jsonSerialize'))
      {
      $object = $object->jsonSerialize();
      }
    else if (is_array($object))
      {
      foreach ($object as &$o)
        {
        $o = self::traverse($o);
        }
      }

    return $object;
    }
  }
?>