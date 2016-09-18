/**
 * Created by whisper on 2016/8/31.
 */
(function ($) {
    function SlickGridPagerSvr(dataView,grid,$container,pagingInfo) {
        var $status;
           var  mypagingInfo= $.extend({
                pageSize: 10,	//分页大小
                pageNum :1,      //现在是第几页
                totalRows:10000, //总条数先默认，后服务端计算返回 //总条数
                totalPages:1 //总共页数
            },pagingInfo);

        function init() {
            //当页数信息改变的时候
            //dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
            //    console.log("my",pagingInfo)
            //    //更新分页条信息
            //    updatePager(mypagingInfo);
            //});
            //初始化分页条样式
            constructPagerUI();
            //初始化分页条信息
            //updatePager(dataView.getPagingInfo());
            
            //判断是否有初始数据
            if(mypagingInfo.data){
            	updatePageByData(mypagingInfo.data);
            }else{
            	updatePager(mypagingInfo);
            }
        }
        function getNavState() {
            var cannotLeaveEditMode = !Slick.GlobalEditorLock.commitCurrentEdit();
            //var pagingInfo = dataView.getPagingInfo();
            var lastPage = mypagingInfo.totalPages ;
            return {
                canGotoFirst: !cannotLeaveEditMode && mypagingInfo.pageSize != 1 && mypagingInfo.pageNum > 1,
                canGotoLast: !cannotLeaveEditMode && mypagingInfo.pageSize != 1 && mypagingInfo.pageNum != lastPage,
                canGotoPrev: !cannotLeaveEditMode && mypagingInfo.pageSize != 1 && mypagingInfo.pageNum > 1,
                canGotoNext: !cannotLeaveEditMode && mypagingInfo.pageSize != 1 && mypagingInfo.pageNum < lastPage,
                pagingInfo: mypagingInfo
            }
        }

        function setPageSize(n) {
            //dataView.setRefreshHints({
            //    isFilterUnchanged: true
            //});
            //dataView.setPagingOptions({pageSize: n});

            //设置页数
            if(n<2){n=2}
            mypagingInfo.pageSize=n;
            mypagingInfo.pageNum=1;
            updatePager(mypagingInfo);

        }

        function gotoFirst() {
            if (getNavState().canGotoFirst) {
                //dataView.setPagingOptions({pageNum: 0});
                mypagingInfo.pageNum=1;

                updatePager(mypagingInfo);
            }

        }

        function gotoLast() {
            var state = getNavState();
            if (state.canGotoLast) {
                //dataView.setPagingOptions({pageNum: state.pagingInfo.totalPages - 1});
                mypagingInfo.pageNum=state.pagingInfo.totalPages;

                updatePager(mypagingInfo);
            }

        }

        function gotoPrev() {
            var state = getNavState();
            if (state.canGotoPrev) {
                //dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum - 1});
                mypagingInfo.pageNum=state.pagingInfo.pageNum-1;

                updatePager(mypagingInfo);
            }
        }

        function gotoNext() {
            var state = getNavState();
            if (state.canGotoNext) {
                //dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum + 1});
                mypagingInfo.pageNum=state.pagingInfo.pageNum+1;

                updatePager(mypagingInfo);
            }
        }
        function gotoAimPage(event){
            var event=event||window.event;
            if(event.target.tagName.toUpperCase()=="INPUT" && event.keyCode==13){
                   var state = getNavState();
                    var value=parseInt(event.target.value);
                       if(value==undefined){
                           return;
                       }
                    value<1 && (value=1);
                    value>state.pagingInfo.totalPages && (value=state.pagingInfo.totalPages);
                    mypagingInfo.pageNum=value;

                    updatePager(mypagingInfo);

            }


        }


        function constructPagerUI() {

            $container.empty();
            //上下页按钮容器
            var $nav = $("<span class='slick-pager-nav' />" ).appendTo($container);
            //选择分页页数
            var $settings = $("<span class='slick-pager-settings'  />").appendTo($container);
            //第几页的多少行
            $status = $("<span class='slick-pager-status'  />").appendTo($container);



            $settings
                .append("<span class='slick-pager-settings-expanded' style='display:inline-block'>" +
                    "每页显示:<input type='text'  style='width: 40px' class='aimpagesize'/> " +
                    "<a data=20 class='choosepage'>20</a>" +
                    "<a data=50 class='choosepage'>50</a>" +
                    "<a data=100 class='choosepage'>100</a></span>");

            var icon_prefix = "<span class='ui-state-default ui-corner-all ui-icon-container'><span class='ui-icon ";

            var icon_suffix = "' /></span>";

            $(icon_prefix + "ui-icon-lightbulb" + icon_suffix)
                .click(function () {
                    $(".slick-pager-settings-expanded").toggle()
                })
                .appendTo($settings);

            $(icon_prefix + "ui-icon-seek-first" + icon_suffix)
                .click(gotoFirst)
                .appendTo($nav);

            $(icon_prefix + "ui-icon-seek-prev" + icon_suffix)
                .click(gotoPrev)
                .appendTo($nav);
            $("<span style='vertical-align: 4px'> 第 " +
                "<input style='width: 20px;' type='text'  class='aimpage' value='"+mypagingInfo.pageNum+"'/> 页 / 共 <span class='totalPage'>"+mypagingInfo.totalPages+"</span> 页 </span> ").keydown(gotoAimPage)
                .appendTo($nav);
            $(icon_prefix + "ui-icon-seek-next" + icon_suffix)
                .click(gotoNext)
                .appendTo($nav);

            $(icon_prefix + "ui-icon-seek-end" + icon_suffix)
                .click(gotoLast)
                .appendTo($nav);

            $container.find(".ui-icon-container")
                .hover(function () {
                    $(this).toggleClass("ui-state-hover");
                });

            $container.children().wrapAll("<div class='slick-pager' />");

            $(".aimpagesize").bind("keydown",function(){

                var value=parseInt(this.value);
                if(value==undefined){
                    return;
                }
                var event=event||window.event;
                if(event.keyCode==13){
                    setPageSize(value);
                }

            });
            $(".choosepage").bind("click",function(){
                setPageSize(this.getAttribute("data"));
            })


        }
        
        //更新页面显示（by初始化数据）
        function updatePageByData(data){

        	grid.loadSlickData(data.dataList,mypagingInfo.pageNum,mypagingInfo.pageSize);
        	mypagingInfo.totalRows= data["totalRows"];
            mypagingInfo.totalPages= data["totalPages"];
            var state = getNavState();
            $container.find(".slick-pager-nav span").removeClass("ui-state-disabled");
            if (!state.canGotoFirst) {
                $container.find(".ui-icon-seek-first").addClass("ui-state-disabled");
            }
            if (!state.canGotoLast) {
                $container.find(".ui-icon-seek-end").addClass("ui-state-disabled");
            }
            if (!state.canGotoNext) {
                $container.find(".ui-icon-seek-next").addClass("ui-state-disabled");
            }
            if (!state.canGotoPrev) {
                $container.find(".ui-icon-seek-prev").addClass("ui-state-disabled");
            }

            $status.text("每页: " + (mypagingInfo.pageSize) + " 条  总计: " + mypagingInfo.totalRows+" 条记录 ");
            var $aimpage=$container.find(".aimpage").val(mypagingInfo.pageNum);
            var $aimpagesize=$container.find(".aimpagesize").val(mypagingInfo.pageSize);
            var $totalPage=$container.find(".totalPage").text(mypagingInfo.totalPages);
        }

        //更新页面显示
        function updatePager(mypagingInfo) {
            var form = $$("form:first")[0];
            //var url = form.action+"?"+"reqCode=collectionQuery4Slick";
            var url="test.do"
            $.ajax({
                type:'post',
                url:url,
                data:{
                    _SlickGridId :grid.getGridId(),
                    _pageSize :mypagingInfo.pageSize,
                    _goNum:mypagingInfo.pageNum},
                cache:false,
                dataType:'json',
                success:function(data){
                	if(data){

                		data.dataList = eval(data.dataList);

                	}
                    updatePageByData(data);
                },
                error:function(){
                	console.log("error");
                }
            });

            //console.log(pagingInfo,getNavState())
        }
        init();
    }

    // Slick.Controls.Pager
    $.extend(true, window, { Slick:{ Controls:{ PagerSvr:SlickGridPagerSvr }}});
})(jQuery$$);
