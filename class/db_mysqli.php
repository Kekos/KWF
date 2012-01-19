<?php
/**
 * KWF Class: db_mysqli (MySQL Improved), establish connection, makes queries to the database and returns data
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2011-05-19
 * @version 1.1
 */

class db_mysqli extends mysqli
  {
  public $statement;

  static $instance = null;

  public function __construct()
    {
    parent::__construct(MySQL_SERVER, MySQL_USER, MySQL_PASSWORD, MySQL_DB);

    if ($this->connect_error)
      {
      throw new Exception('Database connection error: ' . $this->connect_error);
      }

    $this->set_charset('utf8');
    }

  /*
   * Returns the only instance of this class (singleton)
   *
   * @return object(db_mysqli) Instance of class db_mysqli
   */
  static function getInstance()
    {
    if (self::$instance == null)
      {
      self::$instance = new db_mysqli;
      }

    return self::$instance;
    }

  /*
   * Prepares and executes queries to database
   *
   * @param string $query The query to ask, in SQL
   * @param string $types The types of the corresponding arguments in $args
   * @param array(string) $args An array of arguments that should be merged into the query. Every ? is replaced by a arg
   * @return bool True on success, false on failure
   */
  public function exec($query, $types = '', $args = array())
    {
    /* Replace PREFIX_ with DB_PREFIX from config */
    $query = str_replace('PREFIX', DB_PREFIX, $query);

    /* Walkaround for PHP installations without MySQL Native Driver */
    if (method_exists('MySQLi_STMT', 'get_result'))
      {
      $this->statement = $this->prepare($query);

      /* Did the preparation succeed? */
      if (!$this->statement)
        {
        throw new Exception('Database query error: <code>' . $query . '</code><br />' . $this->error);
        }

      /* First argument to bind_param() must be the argument types */
      $new_args = array($types);

      /* Reference all arguments, because bind_param() expects references to arguments */
      foreach ($args as $key => $arg)
        {
        $new_args[$key + 1] = &$args[$key];
        }
      }
    else
      {
      $this->statement = new db_mysqli_statement($this, $query);
      $new_args = &$args;
      array_unshift($new_args, $types);
      }

    /* Call bind_param() if there are arguments to bind */
    if (count($args))
      {
      call_user_func_array(array($this->statement, 'bind_param'), $new_args);
      }

    /* Execute the query */
    return ($this->statement->execute() ? true : false);
    }

  /*
   * Fetches all rows in the result set and returns them in an array as objects
   *
   * @param string $class_name A string specifing a class to instantiate (stdClass if empty)
   * @param array $params An optional array of parameters to pass to $class_name class
   * @return array(object) An array contaning the resulting data of the asked question
   */
  public function fetchAll($class_name = null, $params = null)
    {
    $statement_result = $this->statement->get_result();
    $arr_result = array();

    while ($arr_row = ($class_name ? 
        $statement_result->fetch_object($class_name, $params) : 
        $statement_result->fetch_object()))
      {
      array_push($arr_result, $arr_row);
      }

    $statement_result->free();

    return $arr_result;
    }

  /*
   * Fetches only ONE row in the result set and returns it as an object
   *
   * @param string $class_name A string specifing a class to instantiate (stdClass if empty)
   * @param array $params An optional array of parameters to pass to $class_name class
   * @return array(object) The resulting data of the asked question
   */
  public function fetch($class_name = null, $params = null)
    {
    $statement_result = $this->statement->get_result();

    if ($class_name)
      $obj = $statement_result->fetch_object($class_name, $params);
    else
      $obj = $statement_result->fetch_object();

    $statement_result->free();

    return $obj;
    }
  }
?>