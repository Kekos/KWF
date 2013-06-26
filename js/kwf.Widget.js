/*!
 * KWF Widget Script: kwf.Widget.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-05-07
 * @version 1.0
 */

/*global Kwf */

Kwf.Widget = (function(K)
  {
  /**
   * Collection of all registered widgets
   * @property widgets
   * @type Object
   * @private
   * @default {}
   */
  var widgets = {},

  /**
   * The Widget class
   * @class Widget
   * @private
   * @constructor
   * @param {String} controller_name The controller name
   */
  Widget = {
    /**
     * The last registered widget view element
     * @property element
     * @type Kwf.element
     * @private
     * @default null
     */
    element: null,

    /**
     * Empty constructor for a Widget Controller.
     * Overwrite this if needed.
     * @method construct
     * @public
     */
    construct: function() {},

    /**
     * Empty destructor for a Widget Controller.
     * Overwrite this if needed.
     * @method destruct
     * @public
     */
    destruct: function() {},

    /**
     * Checks if this Widget is still valid and in current context
     * @method isValid
     * @public
     * @return {Boolean} Returns true if Widget is valid
     */
    isValid: function()
      {
      var new_element = K(this.controller_name), 
        old_element = this.element, 
        valid = 0;

      // If the Widget view still exist
      if (new_element)
        {
        valid = 1;
        this.element = new_element;

        if (old_element)
          {
          if (new_element.elem !== old_element.elem)
            {
            this.destruct();
            this.construct();
            }
          }
        else
          {
          this.construct();
          }
        }
      // Destruct controller if existing Widget doesn't exist anymore
      else if (old_element)
        {
        this.destruct();
        this.element = null;
        }

      return valid;
      }
    };

  /**
   * Listener for Context afterload events
   * @method onResponse
   * @private
   * @param {Object} e The response event
   */
  function onResponse(e)
    {
    var found_controller = 0, 
      i, 
      content;

    // JSON responses must be handled specific
    if (e.target.content_type === 'application/json')
      {
      // The interesting content can be both in page and content object
      // content object only exists if any error/info messages was sent along
      content = e.target.page.content || e.target.page;

      if (content.controller)
        {
        // Find the Widget in collection and call it's controller
        if (widgets[content.controller])
          {
          widgets[content.controller][content.action](content);
          found_controller = 1;
          }
        else
          {
          throw new Error('Widget onResponse(): could not find controller: ' + content.controller);
          }
        }
      }

    // If response wasn't JSON, or no controller action was sent, notify all 
    // controllers to construct their views
    if (!found_controller)
      {
      for (i in widgets)
        {
        widgets[i].isValid();
        }
      }
    }

  /**
   * Initiates the Widget module
   * Appends event listeners
   */
  K.ready(function()
    {
    // Start listen on both content and Boxing load events
    // The "ready" event is fired when response is added to the DOM
    K.ContentContext.addEvent('ready', onResponse);
    K.BoxingContext.addEvent('ready', onResponse);
    });

  /**
   * Registers an element as Widget and returns the controller instance
   * @method register
   * @public
   * @param {String} controller_name The controller name
   * @param {Function} controller The controller constructor
   */
  function register(controller_name, controller)
    {
    // Create the Widget object
    controller.prototype = Widget;
    controller.prototype.controller_name = controller_name;

    // Make new instance of this controller, as Widget
    var controller_inst = new controller();

    // Add widget to collection
    widgets[controller_name] = controller_inst;

    return controller_inst;
    }

  return {
    'register': register
    };
  }(Kwf));