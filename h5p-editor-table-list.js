H5PEditor.TableList = (function ($) {

  /**
   * Renders UI for the table list.
   *
   * @class
   * @param {List} list
   */
  function TableList(list) {
    var self = this;

    // Grab entity and make first letter upper case
    var entity = list.getEntity();
    entity = entity.substr(0,1).toLocaleUpperCase() + entity.substr(1);

    // Create DOM elements
    var $wrapper = $('<table/>', {
      'class': 'h5p-editor-table-list'
    });
    var $thead = $('<thead/>', {
      appendTo: $wrapper
    });
    var $headRow;
    var $tbody = $('<tbody/>', {
      appendTo: $wrapper
    });
    var $tfoot = $('<tfoot/>', {
      appendTo: $wrapper
    });
    var $footRow;

    /**
     * Adds UI items to the widget.
     *
     * @public
     * @param {Object} item
     */
    self.addItem = function (item) {

      if (!(item instanceof H5PEditor.Group)) {
        return; // Only support multiple fields
      }

      if (!$headRow) {
        addHeaders(item.field.fields);
        addFooter(item.field.fields.length);
      }

      // Set default params in case item has no params
      if (item.params === undefined) {
        item.params = {};
        item.setValue(item.field, item.params);
      }

      addRow(item);
    };

    /**
     * @private
     */
    var addHeaders = function (fields) {
      $headRow = $('<tr/>', {
        appendTo: $thead
      });
      for (var i = 0; i < fields.length; i++) {
        $('<th/>', {
          'class': 'h5peditor-type-' + fields[i].type,
          html: (fields[i].label ? fields[i].label : ''),
          appendTo: $headRow
        });
        fields[i].label = 0; // No labels inside table rows
      }
      $('<th/>', {
        'class': 'h5peditor-remove-header',
        appendTo: $headRow
      });
    };

    /**
     * @private
     */
     var addFooter = function (length) {
      $footRow = $('<tr/>', {
        appendTo: $tfoot
      });
      $footCell = $('<td/>', {
        colspan: length,
        appendTo: $footRow
      });
      H5PEditor.createButton(list.getImportance(), H5PEditor.t('core', 'addEntity', {':entity': entity}), function () {
        list.addItem();
      }, true).appendTo($footCell);
    };

    /**
     * @private
     */
    var addRow = function (item) {
      // Keep track of field instances
      item.children = [];

      // Create row element
      var $tableRow = $('<tr/>', {
        appendTo: $tbody
      });
      var rowIndex = $tableRow.index();

      for (var i = 0; i < item.field.fields.length; i++) {
        var field = item.field.fields[i];
        var $cell = $('<td/>', {
          appendTo: $tableRow
        });

        var fieldInstance = processSemanticsField(item, field);
        fieldInstance.appendTo($cell);

        item.children.push(fieldInstance);
      }

      // Add remove button
      $removeButtonCell = $('<td/>', {
        'class': 'h5peditor-remove-button',
        appendTo: $tableRow
      });

      H5PEditor.createButton('remove', H5PEditor.t('core', 'removeItem'), function () {
        confirmRemovalDialog.show($(this).offset().top);
      }).appendTo($removeButtonCell);

      // Create confirmation dialog for removing list item
      var confirmRemovalDialog = new H5P.ConfirmationDialog({
        dialogText: H5PEditor.t('core', 'confirmRemoval', {':type': entity.toLocaleLowerCase()})
      }).appendTo(document.body);
      confirmRemovalDialog.on('confirmed', function () {
        // Remove him!
        list.removeItem(rowIndex);
        $tableRow.remove(); // Bye, bye
      });
    };

    /**
     * @private
     */
    var processSemanticsField = function (parent, field) {
      // Check required field properties
      if (field.name === undefined || field.type === undefined) {
        throw ns.t('core', 'missingProperty', {':index': i, ':property': 'name/type'});
      }

      // Set default value
      if (parent.params[field.name] === undefined && field['default'] !== undefined) {
        parent.params[field.name] = field['default'];
      }

      // Locate widget
      var widget = ns.getWidgetName(field);

      // Create new field instance
      return new ns.widgets[widget](parent, field, parent.params[field.name], function (field, value) {
        if (value === undefined) {
          delete parent.params[field.name];
        }
        else {
          parent.params[field.name] = value;
        }
      });
    };

    /**
     * Puts this widget at the end of the given container.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = function ($container) {
      $wrapper.appendTo($container);
    };

    /**
     * Remove this widget from the editor DOM.
     *
     * @public
     */
    self.remove = function () {
      $wrapper.remove();
    };
  }

  return TableList;
})(H5P.jQuery);
