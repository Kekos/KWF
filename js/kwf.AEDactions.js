/*!
 * KWF Action-Edit-Delete Actions Script: kwf.AEDactions.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2013-07-16
 * @version 1.0
 */

/*global Kwf */

Kwf.AEDactions = (function(K)
  {
  /**
   * Adds items to a list view
   * @method addItems
   * @private
   * @param {Object} views Collection of new views
   * @param {HTMLElement} list_view The list view to append new views to
   * @param {HTMLFormElement} data_form The <form> element sending the request
   */
  function addItems(views, list_view, data_form)
    {
    var i, 
      view;

    data_form.reset();

    for (i in views)
      {
      view = K.toDOMnode(views[i]);
      view.addClass('kwf-aed-item-added');
      list_view.append(view);
      }
    }

  /**
   * Updates existing item view
   * @method editItem
   * @private
   * @param {String} view The new view
   * @param {String} id View identifier
   * @param {HTMLFormElement} data_form The <form> element sending the request
   */
  function editItem(view, id, data_form)
    {
    var old_view = K(id), 
      new_view = K.toDOMnode(view);

    // Append new view before old
    old_view.parent().insertBefore(new_view, old_view);

    // Remove old view
    old_view.remove();

    // Close Boxing
    K.Boxing.close();
    }

  /**
   * Removed existing item view
   * @method editItem
   * @private
   * @param {Object} ids Collection of view identifiers to remove from list view
   */
  function deleteItems(ids)
    {
    var i, 
      views = {};

    for (i in ids)
      {
      views[i] = K(ids[i]);
      views[i].addClass('kwf-aed-item-deleted');
      }

    // Close Boxing
    K.Boxing.close();

    setTimeout(function()
      {
      for (i in views)
        {
        views[i].remove();
        }
      }, 1000);
    }

  /**
   * Listener for Context afterload events
   * @method onResponse
   * @private
   * @param {Object} e The response event
   */
  function onResponse(e)
    {
    var content, 
      data_form = e.request.data, 
      list_view;

    // We only consider JSON responses for AED actions
    if (e.target.content_type === 'application/json')
      {
      // The interesting content can be both in page and content object.
      // content object only exists if any error/info messages was sent along.
      content = e.target.page.content || e.target.page;

      if (content.action)
        {
        switch (content.action)
          {
          case 'add':
            list_view = K(data_form.getAttribute('data-list-view'));
            addItems(content.views, list_view, data_form);
            break;

          case 'edit':
            editItem(content.views[0], content.id, data_form);
            break;

          case 'delete':
            deleteItems(content.ids);
            break;

          default:
            throw new Error('AEDactions onResponse(): invalid action: ' + content.action);
          }
        }
      }
    }

  /**
   * Initiates the AEDactions module
   * Appends event listeners
   */
  K.ready(function()
    {
    // Start listen on both content and Boxing load events
    // The "afterload" event is fired when response is recieved from server
    K.ContentContext.addEvent('afterload', onResponse);
    K.BoxingContext.addEvent('afterload', onResponse);

    // Listen on "click" events for capturing clicks on delete links
    K('content').addEvent('click', function(e)
      {
      var target = K(e.target);

      if (target.hasClass('action-delete'))
        {
        e.preventDefault();
        K.BoxingContext.request(target.attr('href'), null, 300, 200);
        }
      });
    });

  return {
    'add': addItems,
    'edit': editItem,
    'delete': deleteItems
    };
  }(Kwf));