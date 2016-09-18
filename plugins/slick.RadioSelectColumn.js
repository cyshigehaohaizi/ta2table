
(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "RadioSelectColumn": RadioSelectColumn
        }
    });
    function RadioSelectColumn(options) {
        var _grid;
        var notSelected=0;
        var _self = this;
        var _selectedRowsLookup = {};
        var _defaults = {
            columnId: "_radio_selector",
            cssClass: "slick-cell-checkbox",
            toolTip: "Select/Deselect Only One",
            width: 30
        };

        var _options = $.extend(true,{},_defaults,options);

        function init(grid) {
            _grid = grid;
            _grid.onSelectedRowsChanged.subscribe(handleSelectedRowsChanged);
            _grid.onClick.subscribe(handleClick);
        }

        function destroy() {
            _grid.onSelectedRowsChanged.unsubscribe(handleSelectedRowsChanged);
            _grid.onClick.unsubscribe(handleClick);
        }
		//当选择的行改变时，重新渲染
        function handleSelectedRowsChanged(e, args) {
            var selectedRows = _grid.getSelectedRows();
            var lookup = {}, row, i;
            for (i = 0; i < selectedRows.length; i++) {
                row = selectedRows[i];
                lookup[row] = true;
                if (lookup[row] !== _selectedRowsLookup[row]) {
                    _grid.invalidateRow(row);
                    delete _selectedRowsLookup[row];
                }
            }
            for (i in _selectedRowsLookup) {
                _grid.invalidateRow(i);
            }
            _selectedRowsLookup = lookup;
            _grid.render();

        }
		/**
		 * 点击事件判断是不是Radio
		 */
        function handleClick(e, args) {
           if (_grid.getColumns()[args.cell].id === _options.columnId && $(e.target).is(":radio")) {
                // if editing, try to commit
                if (_grid.getEditorLock().isActive() && !_grid.getEditorLock().commitCurrentEdit()) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }

                if (_selectedRowsLookup[args.row]) {
                    _grid.setSelectedRows($.grep(_grid.getSelectedRows(),function(n) { return n != args.row }));
                }
                else {
                	var radioRow = [];
                	radioRow[0] = args.row;
                    _grid.setSelectedRows(radioRow);
                }
                e.stopPropagation();
                e.stopImmediatePropagation();
            }

        }

        function getColumnDefinition() {
            return {
                id: _options.columnId,
                toolTip: _options.toolTip,
                field: "sel",
                width: _options.width,
                resizable: false,
                sortable: false,
                cssClass: _options.cssClass,
                formatter: RadioSelectionFormatter
            };
        }

        function RadioSelectionFormatter(row, cell, value, columnDef, dataContext) {
            if (dataContext) {
                return _selectedRowsLookup[row]
                        ? "<input type='radio' checked='checked'>"
                        : "<input type='radio'>";
            }
            return null;
        }

        $.extend(this, {
            "init":                         init,
            "destroy":                      destroy,
            "getColumnDefinition":          getColumnDefinition
        });
    }
})(jQuery$$);