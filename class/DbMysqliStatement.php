<?php
/**
 * KWF Class: DbMysqliStatement (MySQL Improved Statement)
 * Internal class for "preparing" (only binding) and executing SQL statements. 
 * Only used when MySQL Native Driver is not present
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-11-13
 * @version 1.2
 */

class DbMysqliStatement
  {
  private $caller;
  private $query;
  private $result;

  public function __construct($caller, $query)
    {
    $this->caller = $caller;
    $this->query = $query;
    }

  /**
   * Binds arguments to placeholders (NB: it doesn't support the b (blob) type)
   *
   * @param string $types The types of the corresponding arguments in $args
   * @param mixed $arg,... $argN The arguments 
   */
  public function bind_param()
    {
    /* First argument is the types */
    $types = func_get_arg(0);
    /* Rest of the arguments is, believe it or not, arguments */
    $args = func_get_args();
    array_shift($args); // Remove the types from arguments

    /* Cound types, arguments and placeholders and check they're equal */
    $num_types = strlen($types);
    $num_args = count($args);
    $num_placeholders = substr_count($this->query, '?');
    if ($num_args != $num_placeholders || $num_args != $num_types)
      {
      throw new Exception('Database query error: Argument count (' . $num_args . ') did not match placeholder count (' . $num_placeholders . '): <code>' . $this->query . '</code>');
      }

    /* Check if any binding is necessary */
    if ($num_args)
      {
      $parts = explode('?', $this->query);

      /* Start replacing placeholders with values */
      foreach ($args as $n => $arg)
        {
        /* Determine argument type */
        switch ($types[$n])
          {
          case 'i':
            $arg = intval($arg);
          break;

          case 'd':
            $arg = floatval($arg);
          break;

          case 's':
            // NULL values are allowed to enter the SQL untouched.
            // This is a must, otherwise NULL values can't be stored.
            if ($arg === null)
              {
              $arg = 'NULL';
              }
            else
              {
              $arg = "'" . $this->caller->real_escape_string($arg) . "'";
              }
          break;
          }

        $parts[$n] .= $arg;
        }

      $this->query = implode('', $parts);
      }
    }

  /**
   * Executes "prepared" queries to database
   *
   * @return bool True
   */
  public function execute()
    {
    $this->result = $this->caller->query($this->query);

    if (!$this->result)
      {
      throw new Exception('Database query error: <code>' . $this->query . '</code><br />' . $this->caller->error);
      }

    return true;
    }

  /**
   * Returns the result object returned from last query
   *
   * @return MySQLi_Result The result object
   */
  public function get_result()
    {
    return $this->result;
    }
  }
?>