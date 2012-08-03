<?php
/**
 * KWF Class: Language, handles language loading
 *
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-08-02
 * @version 1.0
 */

class Language
  {
  static $language = null;
  static $request = null;
  static $save_session = false;
  static $default_lang = 'en';

  /*
   * Configures the Language object for current context
   *
   * @param string $request The request object, to read Server variables from and getting the session model from
   * @param bool $save_session True if this class should save the language selection in a session
   * @param string $default_lang The default language
   * @return void
   */
  static function configure($request, $save_session, $default_lang)
    {
    self::$request = $request;
    self::$save_session = $save_session;
    self::$default_lang = $default_lang;
    }

  /*
   * Sets current language variable by reading the HTTP Accept-Language header
   * You must call configue() first!
   *
   * @return void
   */
  static function acceptHeader()
    {
    $language = self::$request->session->get('language');
    if (!$language)
      {
      $accept_language = self::$request->server('HTTP_ACCEPT_LANGUAGE');
      if ($accept_language)
        {
        $accepts = explode(',', $accept_language);
        foreach ($accepts as $lang)
          {
          $language_code = substr($lang, 0, 2);
          if (is_dir(BASE . 'language/' . $language_code))
            {
            $language = $language_code;
            break;
            }
          }
        }

      if (!$language)
        {
        $language = $default_lang;
        }
      }

    self::set($language);
    }

  /*
   * Sets current language variable and loads the "common" language file
   *
   * @param string $language The name of language to load
   * @return void
   */
  static function set($language)
    {
    if (is_dir(BASE . 'language/' . $language))
      {
      self::$language = $language;
      self::load('common');

      if (self::$save_session)
        {
        self::$request->session->set('language', $language);
        }
      }
    else
      {
      throw new Exception('Could not find language directory ' . $language);
      }
    }

  /*
   * Loads new language domain
   *
   * @param string $domain The language domain to load
   * @param string $override_language Optional. Specifies an other language code than is set in Language
   * @return void
   */
  static function load($domain, $override_language = null)
    {
    $path = BASE . 'language/' . ($override_language === null ? self::$language : $override_language) . '/' . $domain . '.lang.php';
    if (is_file($path))
      {
      global $lang;
      require($path);
      }
    else
      {
      throw new Exception('Could not find language domain file ' . $domain);
      }
    }
  }
?>