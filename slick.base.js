/**
 * Created by whisper on 2016/8/25.
 */


//创建初始化
function ta2CreateSlickGrid(container, cols, ops, da) {

    //参数初始化
    var options = $$.extend({
        forceFitColumns: false,//自动列的宽度使填满表格;这时候宽度可能不起作用
        //fullWidthRows:true,
        enableCellNavigation: true,//就是一个优化速度的
        enableColumnReorder: false,
        asyncEditorLoading: false,
        topPanelHeight: 25,
        editable: true,//默认编辑
        autoEdit: false,
        allowExport: false,//默认不能导出
        exportNoHead: true,//默认导出含有表头
        showBar: false,//是否显示导出工具条
        havSn:false,//列序号默认false不显示
        totalFlag: false,//是否显示合计行默认不显示
        autoLoadData: true,//是否自动加载数据
        exportExcelName:"export",
        exportselected:"quanbu",//导出quanbu||xuanze
        editCommandHandler:queueAndExecuteCommand//编辑队列
    }, ops);

    var dataView,//视图
        groupItemMetadataProvider,//分组插件
        CheckboxSelect,//多选插件d
        RadioSelect,//单选插件
        columns,//列
        grid,//表格
        aggregators = [],//分组计算项
        visibleColumns = [];//隐藏列


    //初始化插件
    groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();//分组插件
    CheckboxSelect = new Slick.CheckboxSelectColumn();//多选插件
    RadioSelect = new Slick.RadioSelectColumn();//单选插件


    //视图初始化
    dataView = initBaseDataView();
    function initBaseDataView() {
        var dv;
        if (options.totalFlag) {//有分组
            dv = new Slick.Data.DataView({
                groupItemMetadataProvider: groupItemMetadataProvider,
                inlineFilters: true
            });
        }
        else {
            dv = new Slick.Data.DataView();
        }
        return dv;
    }


    //列初始化
    columns = initBaseColumns();
    function initBaseColumns() {
        var cls = cols;

        var sn = {//序号列
            'field': '_rowId_',
            'id': '_rowId_',
            'sortable': true,
            "width": 50,
            'name': '',
            'edit': false,
            'dataType':'number',
            'display': true,
        }
        //序号列是否显示
        if (options.havSn == true) {
            cls.unshift(sn);
        }

        if (options.selectType) {//添加复选框列
            if (options.selectType == "checkbox") {
                cls.unshift(CheckboxSelect.getColumnDefinition());
            }
            if (options.selectType == "radio") {
                //添加单选列
                cls.unshift(RadioSelect.getColumnDefinition());
            }
        }

        for (var i = 0; i < cls.length; i++) {
            cls[i] = $$.extend({
                display: true,//默认显示
                dataType:"string",//默认数据类型是string
            }, cls[i])
            if (cols[i].image) {//图片列
                cols[i].formatter = Slick.Formatters.image;
            }
            if (cls[i].collection) {//码表列
                cls[i].formatter = Slick.Formatters.collection;
            }
            if (cls[i].format) {//日期&数值
                cls[i].formatter = Slick.Formatters.format;
            }
            if (cls[i].valueExpression) {//计算表达式
                cls[i].formatter = Slick.Formatters.valueExpression;
            }
            if (cls[i].operation) {
                if (cls[i].operation == "avg") {
                    cls[i].groupTotalsFormatter = avgTotalsFormatter;
                    aggregators.push(new Slick.Data.Aggregators.Avg(cls[i].field))
                }
                if (cls[i].operation == "min") {
                    cls[i].groupTotalsFormatter = minTotalsFormatter;
                    aggregators.push(new Slick.Data.Aggregators.Min(cls[i].field))
                }
                if (cls[i].operation == "max") {
                    cls[i].groupTotalsFormatter = maxTotalsFormatter;
                    aggregators.push(new Slick.Data.Aggregators.Max(cls[i].field))
                }
                if (cls[i].operation == "sum") {
                    cls[i].groupTotalsFormatter = sumTotalsFormatter;
                    aggregators.push(new Slick.Data.Aggregators.Sum(cls[i].field))
                }
            }
            if(cls[i].edit){
                if(cls[i].dataType=="date"){                    
                    cls[i].editor=Slick.Editors.Date;
                }
                else if(cls[i].dataType=="number"){
                    cls[i].editor=Slick.Editors.Integer;
                }else {
                    cls[i].editor=Slick.Editors.Text;
                }
            }
            if(cls[i].max || cls[i].min){
                cls[i].validator=RangValidator
            }
            if (cls[i].display == true) {
                visibleColumns.push(cls[i]);//将columns的列push进去
            }
        }

        return cls;
    }

    //表格初始化
    grid = new Slick.Grid(container, dataView, columns, options);
    grid.setColumns(visibleColumns);//要显示的列
    
    grid.loadSlickData = function (mydata, pagenum, pagesize) {
        dataView.setItems(mydata);
        grid.invalidate();//强制刷新
    }
    
    //初始化注册插件
    initBasePlugins();
    function initBasePlugins() {
        //注册选择插件
        if (options.selectType) {
            grid.registerPlugin(CheckboxSelect);
            grid.registerPlugin(RadioSelect);
            //选择模式是行选择模式
            grid.setSelectionModel(new Slick.RowSelectionModel());
        }
        //注册分组插件
        if (options.totalFlag) {
            grid.registerPlugin(groupItemMetadataProvider);
            //grid.setSelectionModel(new Slick.CellSelectionModel());
            grid.setSelectionModel(new Slick.RowSelectionModel());
            //列计算初始化
            var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);
            //设置计算依据
            dataView.setGrouping({
                getter: null,
                formatter: function (g) {
                    return "显示:  " +
                            //"" + g.value + " " +
                        " <span style='color:green'>(" + g.count + " items)</span>";
                },
                aggregators: aggregators,
                aggregateCollapsed: false,
                lazyTotalsCalculation: true
            });
        }
        //注册分页插件
        if (options.pageSize) {
         $$("#"+container).after("<div id='"+container+"_pager' style='width:100%;'></div>");
            var rmtPageInfo = {
                pageSize: options.pageSize,	//分页大小
                pageNum: 1,      //现在是第几页
                totalRows: 10000, //总条数先默认，后服务端计算返回 //总条数
                totalPages: 1, //总共页数
                data:da        //初始数据
            }
            //注册分页控件
            var pager = new Slick.Controls.PagerSvr(dataView, grid, $$("#"+container+"_pager"), rmtPageInfo);
        }
        //注册导出bar
        if(options.showBar==true){
        	  if(options.pageSize){//如果有分页直接加载分页后面,否则加在container后面
                $$("#"+container+"_pager").after("<div id='"+container+"exportExclBar' style='width:100%;'></div>");
            }else {
                $$("#"+container).after("<div id='"+container+"exportExclBar' style='width:100%;'></div>");
            }
            var ExcelBar = new Slick.Controls.exportExcelBar(dataView, grid, $$("#"+container+"exportExclBar"),options);
        }

    }

    //让grid响应dataview的改变事件
    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
        grid.render();
    });
    dataView.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();

    });
    

    //数据装载
    if (options.autoLoadData == true) {//是否自动加载数据
        if (!options.pageSize) {
            if (da) {//如果有da直接显示数据
                grid.loadSlickData(da.dataList);
            } else if (options.ActionPath) {//异步
            	//由于后台返回不是JSON数据，自动装载数据由JAVA在组件生成时实现
            } else {
                grid.loadSlickData(da);
            }
        }
    }
    //dataViewSort排序
    grid.onSort.subscribe(function (e, args) {
        var comparer = function (a, b) {
            if (args.sortCol.dataType == "number") {//按数字
                return Number(a[args.sortCol.field]) - Number(b[args.sortCol.field]);
            } else {//按拼音
                return a[args.sortCol.field].toString().localeCompare(b[args.sortCol.field].toString());
            }
        }
        dataView.sort(comparer, args.sortAsc);
    });

    //通过行索引,获取到选取行的所有数据
    // 可以有参数,parma参数是一个数组,
    // 如果没有参数获取到的是选取到的的行信息
    grid.getRowsInfoByIndex = function (array) {//返回的是实际传入的值,并不是通过formatter转换的值

        var infos = [], ar = [];
        if (array) {
            ar = array;
        }
        else {
            ar = grid.getSelectedRows()
        }
        for (var i = 0; i < ar.length; i++) {
            var b=dataView.getItem(ar[i]);
            if(b.__group || b.__groupTotals){
                continue
            }
            infos.push(b);
        }
        return infos;
    }
    //获取选择行的index
    grid.getSelectRowsIndex= function () {

        var ar = [],infos=[];
            ar = grid.getSelectedRows()

        for (var i = 0; i < ar.length; i++) {
            var b=dataView.getItem(ar[i]);
            if(b.__group || b.__groupTotals){
                continue;
            }
            infos.push(ar);
        }
        return infos;
    }

    //获取单行选择元素的值
    grid.getRowInfoByIndex = function (item) {
        if (item) {
            return dataView.getItem(item);
        }
        else {
            return dataView.getItem(grid.getSelectedRows[0]);
        }
    }

   
    //点击弹出窗口
    grid.onClick.subscribe(function (e, args) {
        //args:row,cell,grid
       //点击列信息,行信息
        var clickcol=grid.getColumns()[args.cell],
            clickrow=dataView.getItem(args.row);
            if(clickcol.onclick){
                eval(clickcol.onclick+"(clickrow,clickcol);");
            }
    });
    grid.onDblClick.subscribe(function (e, args) {
        //args:row,cell,grid
        //点击列信息,行信息
        var clickcol=grid.getColumns()[args.cell],
            clickrow=dataView.getItem(args.row);
        if(clickcol.ondblclick){
            eval(clickcol.onclick+"(clickrow,clickcol);");
        }
    });



    //求和
    function sumTotalsFormatter(totals, columnDef) {
        var val = totals.sum && totals.sum[columnDef.field];
        if (val != null) {
            return "总计: " + ((Math.round(parseFloat(val) * 100) / 100));
        }
        return "";
    }

    //求max
    function maxTotalsFormatter(totals, columnDef) {
        var val = totals.max && totals.max[columnDef.field];
        if (val != null) {
            return "最大值: " + ((Math.round(parseFloat(val) * 100) / 100));
        }
        return "";
    }

    //求avg
    function avgTotalsFormatter(totals, columnDef) {
        var val = totals.avg && totals.avg[columnDef.field];
        if (val != null) {
            return "平均值: " + ((Math.round(parseFloat(val) * 100) / 100));
        }
        return "";
    }

    //求min
    function minTotalsFormatter(totals, columnDef) {
        var val = totals.min && totals.min[columnDef.field];
        if (val != null) {
            return "最小值: " + ((Math.round(parseFloat(val) * 100) / 100));
        }
        return "";
    }

    //输入范围验证
    function  RangValidator(value,column){
        if (isNaN(Number(value))) {
            alert("请输入规定的格式!");
            return {valid:false,msg:"请输入规定的格式"}
        }
        else if(Number(value)>Number(column.max) || Number(value)<Number(column.min)){
            var str=""
            if(column.max){str="最大值输入值为"+column.max+" "}
            if(column.min){str=str+"最输入小值为"+column.min}
            alert(str)
            return {valid: false, msg: null};
        }else {
            return {valid: true, msg: null};
        }

    }
    grid.getDataView = function () {
        return dataView;
    }

    var newdata={"deleteDatas":[],"addDatas":[],"EditDatas":[]}
    grid.updateDataView= function () {



        var skid=1
        var item= {
            'loginId': '33111yinhai',
            'sex': '1',
            'operateTime': '2016-03-17 16:01:53.0',
            'lastLoginDepartId': '3301',
            'available': '1',
            'passwordEditTime': '2016-03-17 16:01:54.0',
            'password': '29PYtt0CYAXxrlJgzd/HUg==',
            'operator': 999999998,
            'orgId': '3300',
            'passwordFaultNum': 0,
            'userId': '1000001782',
            'name': '银海测试',
            'lastLoginRoleId': '1000001781',
            'departId': '3301',
            'locked': '0',
            'orderId': 0,
            "book":12}
        item._rowId_=1;
        dataView.insertItem(0,item);
        grid.invalidate();//强制刷新


    }
    //插入元素,插入位置,如果没有index默认加在行末尾
    grid.addNewItem=function(item,index){
        var skid=dataView.getLength();
        options.totalFlag==true && (skid=skid-1);
        item._rowId_=skid;
        if(arguments.length==2){
            dataView.insertItem(index,item);
        }
        else {
            dataView.addItem(item);

        }
        grid.invalidate();//强制刷新
        newdata.addDatas.push(item);

    }
    //删除指定元素
    grid.deleteItem=function(index){
        if(arguments.length<=0){
            return;
        }
        newdata.deleteDatas.push(dataView.getItemByIdx(index));
        grid.setSelectedRows([]);
        grid.invalidate();//强制刷新
        dataView.deleteItem(dataView.getItemByIdx(index)._rowId_);
    }
    //批量删除
    grid.deleteItems=function(array){
        if(arguments.length<=0 || array.length<=0){
            return;
        }
        var dldate=grid.getRowsInfoByIndex(array);
            grid.setSelectedRows([]);
        for(var j=0;j<dldate.length;j++){
            dataView.deleteItem(dldate[j]._rowId_);
        }
        newdata.deleteDatas=newdata.deleteDatas.concat(dldate);
        grid.invalidate();//强制刷新

    }
    //编辑
    function queueAndExecuteCommand(item, column, editCommand) {
        dataView.beginUpdate();
        editCommand.execute();
        dataView.endUpdate();
        var i= 0,flag=true;
        for( i=0;i< newdata.EditDatas.length;i++){
            if(newdata.EditDatas[i]._rowId_==item._rowId_){
                newdata.EditDatas[i]=item;
                flag=false;
                break;
            }
        }
         if(flag){
                newdata.EditDatas.push(item)
         }


    }


    grid.getAddNewItems=function(){
        return newdata.addDatas;
    }
    grid.getDeleteDataItems=function(){
        return newdata.deleteDatas;
    }
    grid.getEditItems=function(){
        return newdata.EditDatas;
    }

    //提交数据之后 刷新表格表格数据 然后清空添加的数据
    grid.commitData=function(){
        //刷新表格


        //清空数据
        newdata.deleteDatas.splice(0,newdata.deleteDatas.length);
        newdata.EditDatas.splice(0,newdata.EditDatas.length);
        newdata.addDatas.splice(0,newdata.addDatas.length);

    }




    return grid;
}
