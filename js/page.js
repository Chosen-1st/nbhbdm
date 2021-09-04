/**
 * TheZihanGu/nbhbdm
 * https://nbhbdm.cn
 */
// 引用并初始化tip内容
var tip = new Vue({
    el: '#tip',
    data: {
        message: '输入搜索关键字'
    }
})
// 引用并初始化短链接内容
var shortlink = new Vue({
    el: '#shortlink',
    data: {
        message: '短链接等待生成'
    }
})
// 引用并初始化通用链接内容
var normallink = new Vue({
    el: '#normallink',
    data: {
        message: '通用链接等待生成'
    }
})
// 剪切板操作
var clipboard = new ClipboardJS('.copy');
clipboard.on('success', function(e) {
    console.log(e);
    tip.message = "已将链接复制到剪贴板";
});
clipboard.on('error', function(e) {
    console.log(e);
    tip.message = "emm...似乎无法复制到剪贴板呢.";
});
// 二维码生成
$("#generate-qr-code-button").click(function() {
    query_text = encodeURIComponent(input_text);
    new QRCode(document.getElementById("qrcode"), hostname + "?s=" + query_text);
    mdui.snackbar({
        message: '这是一个测试功能,如果出现问题,请前往 GitHub Issues 进行反馈!'
      });
});
// 通过正则表达式获取链接中的参数
function getQuery(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return r[2];
    }
    return null;
}
// 不使用window.location.host，以保证在本地也可用
function getHostname() {
    url = window.location.href;
    hostname = url.split("?");
    return hostname[0];
}
// 延迟递归完成文本数输入
function addSearchText(text, time) {
    text = String(text);
    time = Number(time);
    input = $("#search-input").val() + text.substr(0, 1);
    $("#search-input").val(input);
    text = text.slice(1); // 删除已经写入的第一个字符
    if (text.length == 0) {
        return; // 递归结束
    }
    // 递归循环写入
    func = "addSearchText('" + text + "', " + time + ");"
    setTimeout(func, time);
}
// 重置页面状态为无输入无动画状态
function gotoBeginStatus() {
    mouse_obj = $("#fake-mouse");
    mouse_obj.stop(true);
    mouse_obj.css("display", "none");
    tip.message = "输入搜索关键字";
    $("#link").css("display", "none");
}
// 用户点击输入框时终止所有动画
$("#search-input").click(function() {
    gotoBeginStatus(); // 重置页面状态
});
// “百度一下”按钮按下事件
$("#search-button").mousedown(function() {
    $("#search-button").addClass("wb-click"); // 更新按钮点击样式
});
// “百度一下”按钮释放事件
$("#search-button").mouseup(function() {
    $("#search-button").removeClass("wb-click"); // 更新按钮点击样式
});
// “百度一下”按钮的响应事件
$("#search-button").click(function() {
    input_text = $("#search-input").val();
    input_text = input_text.trim();
    query_text = encodeURIComponent(input_text);
    $(location).attr('href', hostname + "?s=" + query_text);
});
// "我要生成链接" 响应事件
$("#generate").click(function() {
    // 获取输入框输入内容
    input_text = $("#search-input").val();
    input_text = input_text.trim();
    // 重置页面状态
    gotoBeginStatus();
    // 根据输入框内容更新显示样式
    if (input_text.length !== 0) {
        tip.message = "蕴含知识的链接已经生成";
        $("#result").css("display", "block");
    }
    if (input_text.length == 0) {
        tip.message = "请正确输入搜索内容";
    }
    if (input_text.match("http")){
        mdui.snackbar({
            message: 'TIP: 请不要利用本站进行套娃跳转其他网页!'
        });
    }
    query_text = encodeURIComponent(input_text);
    normallink.message = hostname + "?s=" + query_text;
    shortlink.message = "正在生成中";
    var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', "https://api.tzg6.com/api/shortlink?token=nbhbdm&url=" + hostname + "?s=" + query_text, true);
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                var shortlink_result = httpRequest.responseText;
                console.log("短链接: " + shortlink_result);
                shortlink.message = shortlink_result;
            }
        }
});
// 主要业务逻辑
$(document).ready(function() {
    hostname = getHostname(); // 获取页面域名或地址
    query = getQuery("s"); // 试图获取查询参数
    if (query == null) {
        // 没有参数输入，中断处理
        return;
    }
    query = decodeURIComponent(query); // 对查询的内容进行URL解码
    query = query.trim(); // 删除可能很奇怪的空白字符
    console.log("输入内容")
    console.log(query)
    if (query.length !== 0) {
        // 参数不为空时呈现动态
        // 更新输入框与提示框内容
        $("#search-input").val("");
        $("#tip1").text("将光标移动到搜索框上并点击");
        // 获取输入框与按钮的位置
        input_offest = $("#search-input").offset();
        button_offest = $("#search-button").offset();
        console.log("输入框位置");
        console.log(input_offest);
        console.log("按钮位置");
        console.log(button_offest);
        // 显示鼠标图案
        mouse_obj = $("#fake-mouse");
        mouse_obj.css({
            "display": "block",
            "top": "240px",
            "left": "0"
        });
        // 从初始位置移动至输入框
        mouse_obj.animate({
            "top": input_offest.top + 30,
            "left": input_offest.left + 10,
        }, 2000, "swing", function() {
            // 计算每个字符的输入时间
            $("#tip1").text("输入要搜索的内容后点击\"百度一下\"按钮");
            time = 1800 / query.length;
            addSearchText(query, time); // 逐个写入文本内容
        });
        // 从输入框位置移动至按钮
        mouse_obj.animate({
            "top": button_offest.top + 10,
            "left": button_offest.left + 90
        }, 2000, "swing", function() {
            $("#search-button").addClass("wb-click");
            $("#tip1").text("是不是很简单呢");
            navigate = "https://www.baidu.com/s?wd=";
            navigate += encodeURIComponent(query);
            console.log("百度一下")
            console.log(navigate);
            setTimeout(function() {
                window.location.href = navigate;
            }, 1500);
        });
    }
});