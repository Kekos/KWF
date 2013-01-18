<?php
/**
 * KWF Class: Db (database), establish connection, makes queries to the database and returns data
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-01-18
 * @version 2.3
 */

class Db
  {
  private $query = null;

  static $instance = null;

  public function __construct()
    {
    if (!mysql_connect(MySQL_SERVER, MySQL_USER, MySQL_PASSWORD))
      {
      throw new Exception('Database connection error: ' . mysql_error());
      }
    if (!mysql_select_db(MySQL_DB))
      {
      throw new Exception('Database selection error: ' . mysql_error());
      }

    mysql_set_charset('utf8');
    }

  /**
   * Returns the only instance of this class (singleton)
   *
   * @return Db Instance of class Db
   */
  static function getInstance()
    {
    if (self::$instance == null)
      {
      self::$instance = new Db;
      }

    return self::$instance;
    }

  /**
   * Asks queries to database
   *
   * @param string $query The query to ask, in SQL-format
   * @param string[] $args An array of arguments that should be merged into the query. Every ?x? is replaced by a arg
   * @param bool $debug If set to true, then the interpreted query (query after argument merge) will be outputted
   * @return resource The resource to the query
   */
  public function query($query, $args = array(), $debug = false)
    {
    $num_args = count($args);
    $num_placeholders = substr_count($query, '?x?');
    if ($num_args != $num_placeholders)
      {
      throw new Exception('Database query error: Argument count (' . $num_args . ') did not match placeholder count (' . $num_placeholders . '): <code>' . $query . '</code>');
      }

    $query = str_replace('PREFIX', DB_PREFIX, $query);
    foreach ($args as $a)
      {
      $a = str_replace('?x?', '\?x\?', $a);
      $occ = strpos($query, '?x?');
      $to_occ = substr($query, 0, $occ);
      $from_occ = substr($query, $occ + 3, strlen($query));
      $query = $to_occ . mysql_real_escape_string($a) . $from_occ;
      }

    $this->query = mysql_query($query);
    if (!$this->query)
      {
      throw new Exception('Database query error: <code>' . $query . '</code><br />' . mysql_error());
      }
    else
      {
      if ($debug)
        {
        echo $query . "\n";
        }

      return $this->query;
      }
    }

  /**
   * Fetches all rows in the result set and returns them in an array
   *
   * @return string[][] An array contaning the resulting data of the asked question
   */
  public function fetchAll()
    {
    $arr_result = array();
    while ($arr_row = mysql_fetch_assoc($this->query))
      {
      array_push($arr_result, $arr_row);
      }

    return $arr_result;
    }

  /**
   * Fetches only ONE row in the result set and returns it
   *
   * @return string[] The resulting data of the asked question
   */
  public function fetch()
    {
    return mysql_fetch_assoc($this->query);
    }

  /**
   * Returnes the generated ID for the last inserted post
   *
   * @return int The generated ID
   */
  public function lastInsertID()
    {
    return mysql_insert_id();
    }
  }
?>