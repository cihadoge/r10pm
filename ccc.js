function findUsername(data)
{
	var al = data.split('<a href="members/');
	var t = al[1];
	var b = t.split('-');
	console.log('userid : ' + b[0]);
	localStorage['userid'] = b[0];
}
function onBlogSuccess(data)
{
	if(!localStorage['lastBlog'])
	{

	}
}
function onSuccess(data)
{
	if(!localStorage['userid'])
		findUsername(data);
	var span = $(data).find('#notifications');
	if(span != undefined)
	{
		var count = span.find('strong').html();
		if(count != null)
		{
			console.log(count + " yeni bildirim");
			chrome.browserAction.setBadgeText({ text: count });
			chrome.browserAction.setTitle({ title: count + " Yeni Bildirim" });
			if(localStorage['notifCount']!=count)
			{
				newPM(count);
				localStorage['notifCount'] = count;
			}
		}
		else {
			chrome.browserAction.setBadgeText({ text: "" });
			chrome.browserAction.setTitle({ title: "Yeni Bildirim Yok" });
			localStorage['notifCount'] = 0;
		}
	}
	else {
		chrome.browserAction.setBadgeText({ text: "" });
		chrome.browserAction.setTitle({ title: "Yeni Bildirim Yok" });
	}
}
function checkReply(data)
{
	var count = 0;
	var str = '<span style="cursor:pointer" onclick="window.open(\'members/';
	if(localStorage['newreply']=='my')
		str += localStorage['userid'];
	var al = data.split(str);

	for(i=1;al[i];i++)
	{
		var d = al[i-1];
		tut = d.split('<td class="alt1" id="td_threadtitle_');
		tut = tut[1].split('"');
		threadId = tut[0];

		tut = al[i].split('<td class="alt2" title="Cevaplar: ');
		tut = tut[1].split(',');
		replyCount = tut[0];

		if( localStorage['thread'+threadId]!=undefined && localStorage['thread'+threadId] < replyCount )
			count += replyCount-localStorage['thread'+threadId];
		localStorage['thread'+threadId] = replyCount;
		// console.log(threadId + " " + replyCount);
	}
	// console.log(count);
	if(count > 0)
		newMessage(count);
}
function checkBlog()
{
	console.log(localStorage['lastBlog']);
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			x=xmlhttp.responseXML.documentElement.getElementsByTagName("item");
			if(!localStorage['lastBlog'])
			{
				tut = x[0].getElementsByTagName("pubDate");
				localStorage['lastBlog'] = tut[0].firstChild.nodeValue;
			}
			for (i=0, tut = x[0].getElementsByTagName("pubDate");i<x.length && tut[0].firstChild.nodeValue!=localStorage['lastBlog'];i++)
			{
				a = x[i].getElementsByTagName("title");
				b = x[i].getElementsByTagName("link");
				localStorage['lastBlog'] = tut[0].firstChild.nodeValue;
				newBlog(a[0].firstChild.nodeValue,b[0].firstChild.nodeValue);
				if(i+1 < x.length)
					tut = x[i+1].getElementsByTagName("pubDate");
				break;
			}
		}
	}
	xmlhttp.open("GET","http://blog.r10.net/feed",true);
	xmlhttp.send();

}
function checkPM()
{
	var requestTimeout = 10000;
	$.ajax({
		type: "GET",
		dataType: "html",
		url: "http://www.r10.net/usercp.php",
		timeout: requestTimeout,
		success: function (data) { onSuccess(data); },
		error: function (xhr, status, err) { console.log(err); }
	});
	if(localStorage['newreply']=='my' || localStorage['newreply']=='all')
	{
		$.ajax({
			type: "GET",
			dataType: "html",
			url: "http://www.r10.net/subscription.php?do=viewsubscription&folderid=all",
			timeout: requestTimeout,
			success: function (data) { checkReply(data); },
			error: function (xhr, status, err) { console.log(err); }
		});
	}
}
function newMessage(count){
	var popup = window.webkitNotifications.createHTMLNotification("mes.html#"+count);
	popup.show();
	setTimeout(function(){
		popup.cancel();
	}, '15000');
}

function newPM(count){
	var popup = window.webkitNotifications.createHTMLNotification("pm.html#"+count);
	popup.show();
	setTimeout(function(){
		popup.cancel();
	}, '15000');
}
function newBlog(title,link){
	var popup = window.webkitNotifications.createHTMLNotification("blog.html#"+title+'#'+link);
	popup.show();
	setTimeout(function(){
		popup.cancel();
	}, '15000');
}