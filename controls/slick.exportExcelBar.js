/**
 * Created by whisper on 2016/9/1.
 */

(function ($) {
    function SlickExportExcelBar(dataView, grid, $container, options) {

        var $status;


        function init() {
            //初始化页脚样式
            constructPagerUI();

        }

        //表格导出当前页
        function exportDefaultGridData() {

            var a, b;
            if (options.exportselected == "xuanze") {//导出选择数据
                a = grid.getColumns();
                b = grid.getRowsInfoByIndex();

                b = $$.extend(true, [], b);
                if (b.length < 1) {
                    alert('请至少选择一条数据');
                    return;
                }
            } else {//导出当前页
                a = grid.getColumns();
                b = dataView.getItems();
            }
            var collection = grid.getOptions().collectionsDataArrayObject;
            var row = [];
            var cell = [];
            var cell_b = []
            var head = [];
            for (var k = 0; k < a.length; k++) {
                //剔除不被导出的的列
                if (a[k].id != "_checkbox_selector" && a[k].id != "__no" && !a[k].icon && a[k].id != "img" && options.haveSn != false) {

                    cell.push("\"" + a[k].field + "\"");
                    cell_b.push("\"" + a[k].id + "\"")
                    head.push("\"" + encodeURI(a[k].name) + "\"");
                }

            }

            //判断是否有表头
            if (options.exportNoHead) {
                row.push(head)
            }
            for (var i = 0; i < b.length; i++) {
                var cells = [];

                //判断是否是group,如果是 那么不导出这行
                if (b[i].__group || b[i].__groupTotals) {
                    continue;
                }

                for (var j = 0; j < cell.length; j++) {


                    var cData = b[i][cell[j].replace(/\"/g, "")];
                    if (cData == undefined || cData === "") {
                        cData = "";
                    } else {
                        //处理转义字符
                        cData = JSON.stringify(cData.toString());
                        cData = cData.substring(1, cData.length - 1);
                    }

                    //getFormatter(row, m)(row, cell, value, m, item)
                    //row:行数,m,该列信息,cell,该行所在的列数,value,值,item该行所有值
                    //转码处理
                    var m = a[grid.getColumnIndex(cell_b[j].replace(/\"/g, ""))];
                    cData = grid.getFormatter(i, m)(i, j, cData, m, b[i]);
                    cells.push("\"" + cData + "\"");
                }
                row.push(cells);
            }
            console.table(row)
            var form = $("form:first")[0];
            var url = form.action+"?"+"reqCode=taCommonExportExcl";
            var $input = $("<textarea/>").css("display", "none").val(obj2string(row)).attr("name", "_grid_item_export_excel").attr("id", "_grid_item_export_excel");
            var $inputFileName = $("<textarea/>").css("display", "none").val(options.exportExcelName).attr("name", "_grid__export_excelName").attr("id", "_grid__export_excelName");
            var $reqCode = $("<input/>").css("display", "none").val("taCommonExportExcl").attr("name", "reqCode").attr("id", "reqCode");
            var $form = $("<form></form>")
                .append($input).append($inputFileName).append($reqCode)
                .attr("method", "post")
                .prependTo("body")
                .attr("action", url)
                .submit()
                .remove();
        }

        function exportAllGridData() {

            if (grid.getDataView().getItems().length == 0) {
                alert("数据不能为空");
                return;
            }
            var a = grid.getColumns();
            var clt = {};
            //var obj = grid.getCollectionsDataArrayObject();

            var row = [];
            var cell = [];
            var head = [];
            for (var k = 0; k < a.length; k++) {
                if (a[k].id != "_checkbox_selector" && a[k].id != "__no" && !a[k].icon && a[k].id != "img" && options.haveSn != false) {
                    cell.push("\"" + a[k].field + "\"");
                    head.push("\"" + encodeURI(a[k].name) + "\"");
                }
            }
            row.push(head);
            row.push(cell);

            for (var i = 0; i < a.length; i++) {
                if (a[i].collection) {
                    if (!clt[a[i].collection])
                        clt[a[i].collection] = a[i].collectionData;
                }

            }
            //if(options.sqlStatementName && options.resultType){
            //    var sql = [],result = [];
            //    sql.push("\""+options.sqlStatementName+"\"");
            //    result.push("\""+options.resultType+"\"");
            //    row.push(sql);
            //    row.push(result);
            //}else{
            //    Base.alert("导出全部数据必须设置sqlStatementName和resultType属性");
            //    return;
            //}

            //
            row.push(clt);
            console.log(row);
            var form = $("form:first")[0];
            var url = form.action+"?"+"reqCode=taCommonExportAllDataExcl&_SlickGridId="+grid.getGridId();
            var $input = $("<textarea id='_gridHead_'/>").css("display", "none").val(obj2string(row)).attr("name", "_gridHead_");
            var $inputFileName = $("<textarea/>").css("display", "none").val(options.exportExcelName).attr("name", "_grid__export_excelName").attr("id", "_grid__export_excelName");
            var $reqCode = $("<input/>").css("display", "none").val("taCommonExportAllDataExcl").attr("name", "reqCode").attr("id", "reqCode");
            var $form = $("<form></form>")
                .append($input).append($inputFileName).append($reqCode)
                .attr("method", "post")
                .prependTo("body")
                .attr("action", url)
                .submit()
                .remove();


        }

        function constructPagerUI() {
            $container.empty();
            var $bar = $("<div></div>").appendTo($container);
            var $exportNow = $("<input type='button' value='导出当前页' class='exportnow'/>").click(exportDefaultGridData).appendTo($bar);

            var $exportAll = $("<input type='button' value='导出全部' class='exportall' />").click(exportAllGridData).appendTo($bar);


            $container.children().wrapAll("<div class='slick-bar' />");
        }
        // 将json对象转换为string
        function obj2string(o) {
            if (o == null || o == 'undefined')
                return null;
            var r = [];
            if (typeof o == "string")return o;

            if (typeof o == "object") {
                if (!jQuery$$.isArray(o)) {
                    for (var i in o) {
                        if (typeof o[i] == 'string' || typeof o[i] == 'number') {
                            if (o[i] != undefined) {
                                r.push("\"" + i + "\":\"" + o[i].toString().replace(/\"/g, "\\\"") + "\"");
                            } else {
                                r.push("\"" + i + "\":null");
                            }
                        } else {
                            r.push("\"" + i + "\":" + obj2string(o[i]));
                        }
                    }

                    if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
                        r.push("toString:" + o.toString.toString());
                    }

                    r = "{" + r.join() + "}";
                } else {
                    for (var i = 0; i < o.length; i++)
                        r.push(obj2string(o[i]));
                    r = "[" + r.join() + "]";
                }
                return r;
            }
            return o.toString();
        }


        init();


    }

    // Slick.Controls.exportExcelBar
    $.extend(true, window, {Slick: {Controls: {exportExcelBar: SlickExportExcelBar}}});
})(jQuery$$);
