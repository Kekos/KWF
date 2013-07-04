/*!
 * KWF Script: site.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-07-04
 * @version 4.1
 */

/* JSLint: First asume we have the KWF Framework */
/*global K, Kwf */

var Site = (function(window, document, K)
  {
  var failure_dialog = null, 
    upload_widget = null;

  function beforeAjax()
    {
    var ajax_loader = K('ajax_loader');

    if (!ajax_loader)
      {
      ajax_loader = K.create('div', {'id': 'ajax_loader'});
      ajax_loader.text('Laddar...');
      K(document.body).append(ajax_loader);
      }

    ajax_loader.replaceClass('hide', 'show');
    }

  function afterAjax()
    {
    var ajax_loader = K('ajax_loader');
    if (ajax_loader)
      {
      ajax_loader.replaceClass('show', 'hide');
      }
    }

  function ajaxFailure()
    {
    if (failure_dialog)
      {
      failure_dialog.close();
      }

    failure_dialog = new K.Dialog(K.__('AJAX_FAILURE_TITLE'), 
      '<p>' + K.__('AJAX_FAILURE_DESC') + '</p><p><button class="dialog-close">' + K.__('OK') + '</button></p>', 
      300, 100);
    }

  /**
   * Upload Controller
   * @class UploadController
   * @constructor
   */
  function UploadController()
    {
    var self = this,
    /**
     * The current view
     * @property view
     * @type UploadController.View
     * @private
     * @default null
     */
    view = null,
    /**
     * Date and time refresh timer
     * @property timer
     * @type Number
     * @private
     * @default null
     */
    timer = null;

    /**
     * Upload view class
     * @class UploadController.View
     * @constructor
     */
    function View()
      {
      /**
       * The list view of uploaded files
       * @property list_view
       * @type Kwf.element
       * @private
       */
      var list_view = K('upload_list_view'),
      /**
       * The date time view
       * @property datetime_view
       * @type Kwf.element
       * @private
       */
      datetime_view = K('upload_datetime'),
      /**
       * The file upload form
       * @property upload_form
       * @type Kwf.element
       * @private
       */
      upload_form = K('upload_form'),
      /**
       * Reference to opened dialog
       * @property remove_dialog
       * @type Kwf.Dialog
       * @private
       * @default null
       */
      remove_dialog = null,
      /**
       * Reference to file view under removal
       * @property remove_file_view
       * @type HTMLElement
       * @private
       * @default null
       */
      remove_file_view = null;

      /*
       * Constructor
       */
      upload_form.addEvent('submit', function(e)
        {
        e.preventDefault();
        K.ContentContext.request(upload_form.elem.action, K('file').elem);
        });

      /**
       * Opens a new dialog for removal of file
       * @method openRemoveDialog
       * @public
       * @param {HTMLAnchorElement} link The file removal link
       */
      this.openRemoveDialog = function(link)
        {
        remove_file_view = link.elem.parentNode;
        var filename = remove_file_view.getAttribute('data-file');

        remove_dialog = new K.Dialog(K.__('UPLOAD_DELETE'), 
          '<p>' + K.__('UPLOAD_DELETE_CONFIRM').replace('%s', filename) + '</p>'
          + '<p><button id="upload_delete_yes">' + K.__('YES') + '</button>'
          + '<button class="dialog-close">' + K.__('NO') + '</button></p>', 
          300, 150);

        K('upload_delete_yes').addEvent('click', function(e)
          {
          e.preventDefault();
          K.ContentContext.noHistory(link.elem.href);
          });
        };

      /**
       * Closes the dialog for file removal
       * @method closeRemoveDialog
       * @public
       */
      this.closeRemoveDialog = function()
        {
        remove_dialog.close();
        remove_dialog = null;
        K(remove_file_view).remove();
        remove_file_view = null;
        };

      /**
       * Adds a new file view to list
       * @method addFileView
       * @public
       * @param {String} view_html HTML for new file view
       */
      this.addFileView = function(view_html)
        {
        var file_view = K.toDOMnode(view_html);
        list_view.append(file_view);
        };

      /**
       * Returns the service URL for date and time
       * @method getDateTimeURL
       * @public
       * @return {String} The service URL
       */
      this.getDateTimeURL = function()
        {
        return datetime_view.elem.getAttribute('data-url');
        };

      /**
       * Sets new date and time
       * @method setDateTime
       * @public
       * @param {String} datetime Date and time
       */
      this.setDateTime = function(datetime)
        {
        datetime_view.text(datetime);
        };
      }

    /**
     * Called when date time response arrives
     * @method parseDateTimeResponse
     * @private
     * @param {Object} response The response
     */
    function parseDateTimeResponse(response)
      {
      // The view might have been destructed at this time, must check
      if (response.page.datetime && view)
        {
        view.setDateTime(response.page.datetime);
        }
      }

    /**
     * Initates some of the controller variables
     * @method construct
     * @public
     */
    self.construct = function()
      {
      view = new View();
      timer = setInterval(function()
        {
        K.Ajax.get(view.getDateTimeURL(), parseDateTimeResponse, ajaxFailure);
        }, 2000);
      };

    /**
     * Clears some of this controller variables
     * @method destruct
     * @public
     */
    self.destruct = function()
      {
      view = null;
      clearInterval(timer);
      timer = null;
      };

    /**
     * Controller action for finished file uploads
     * @method upload
     * @public
     * @param {Object} content The response content object
     */
    self.upload = function(content)
      {
      var i, 
        views = content.views;

      if (views)
        {
        for (i = 0; i < views.length; i++)
          {
          view.addFileView(views[i]);
          }
        }
      };

    /**
     * Controller action for removed files
     * @method remove
     * @public
     */
    self.remove = function()
      {
      view.closeRemoveDialog();
      };

    /**
     * Listener for clicks on file removal links
     * @method removeFile
     * @public
     * @param {HTMLAnchorElement} link The removal link
     */
    self.removeFile = function(link)
      {
      if (self.isValid())
        {
        view.openRemoveDialog(link);
        }
      };
    }

  /* Add listeners to the KWF click event */
  Kwf.click(function(e, target)
    {
    var prevent = 0;

    if (target.hasClass('upload-remove'))
      {
      upload_widget.removeFile(target);
      prevent = 1;
      }

    return prevent;
    });

  /* Add listeners to the KWF ready event */
  K.ready(function()
    {
    K.Ajax.setBeforeCallback(beforeAjax);
    K.Ajax.setAfterCallback(afterAjax);
    K.ContentContext.onFailure(ajaxFailure);
    K.BoxingContext.onFailure(ajaxFailure);

    upload_widget = K.Widget.register('UploadController', UploadController);
    });
  }(window, document, K));