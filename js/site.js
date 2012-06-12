/**
 * KWF Script: site.js
 * Based on DOMcraft
 * 
 * @author Christoffer Lindahl <christoffer@kekos.se>
 * @date 2012-06-12
 * @version 3.1
 */

/* JSLint: First asume we have the KWF Framework */
/*global elem, getTarget, returnFalse, addEvent, removeEvent, addSubmitEvent, 
   previousNode, nextNode, firstChildElement, lastChildElement, hasClass, 
   addClass, removeClass, giveOpacity, parseJSON, var_dump, toDOMnode, Ajax, 
   Boxing, Kwf, KWFEventTarget, content_request, boxing_request */

var site = (function(window, document, elem, content_request, boxing_request, Boxing)
  {
  function beforeAjax()
    {
    var ajax_loader = elem('ajax_loader');

    if (!ajax_loader)
      {
      ajax_loader = document.createElement('div');
      ajax_loader.id = 'ajax_loader';
      ajax_loader.appendChild(document.createTextNode('Laddar...'));
      elem('header').appendChild(ajax_loader);
      }

    ajax_loader.style.display = 'block';
    }

  function afterAjax()
    {
    elem('ajax_loader').style.display = 'none';
    }

  function loadContactform(e, targ)
    {
    boxing_request.load(e, targ.href, 300, 400);
    //content_request.load(e, targ.href);
    }

  function upload(e, targ)
    {
    returnFalse(e);
    Ajax.upload(document.location.href, content_request.parseResponse, 
      content_request.parseResponse, elem('file'), targ);
    }

  /* Add listeners to the KWF click event */
  Kwf.onclick = function(e, targ)
    {
    if (targ.id === 'load_contactform')
      {
      loadContactform(e, targ);
      }
    else if (targ.name === 'upload')
      {
      upload(e, targ);
      }
    };

  /* Add listeners to the KWF load event */
  Kwf.onload = function(e)
    {
    Ajax.setBeforeCallback(beforeAjax);
    Ajax.setAfterCallback(afterAjax);
    };
  }(window, document, elem, content_request, boxing_request, Boxing));