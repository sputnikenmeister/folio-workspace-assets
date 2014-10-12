/* ©2012 Pablo Canillas */

$(function(){
	var maps = window.maps || {"bundle-to-keywords":{}, "keyword-to-type":{}};
	delete window.maps;
	
	/** Bootstrap data processing */
	maps["bundle-to-types"] = (function () {
		var rMap = {};
		var tKey, bKey, kArr, tArr;
		var bundleToKeywords = maps["bundle-to-keywords"];
		var keywordToType = maps["keyword-to-type"];
		for (bKey in bundleToKeywords)
		{
			tArr = [];
			kArr = bundleToKeywords[bKey];
			for (var i = 0; i < kArr.length; i++)
			{
				var tKey = keywordToType[kArr[i]];
				if (tArr.indexOf(tKey) < 0)
				{
					tArr.push(tKey);
				}
			}
			rMap[bKey] = tArr;
		}
		return rMap;
	})();
	
	maps["keyword-to-bundles"] = (function () {
		var rMap = {};
		var kKey, bKey, bArr, kArr;
		var bundleToKeywords = maps["bundle-to-keywords"];
		for (bKey in bundleToKeywords)
		{
			kArr = bundleToKeywords[bKey];
			for (var i = 0; i < kArr.length; i++)
			{
				var kKey = kArr[i];
				bArr = rMap.hasOwnProperty(kKey)? rMap[kKey]: [];
				bArr.push(bKey);
				rMap[kKey] = bArr;
			}
		}
		return rMap;
	})();
		
	/** Component: Bundle List */
	$(".xhtml-page #bundles").hover(
		function () { $("#keywords").addClass("collapsed"); },
		function () { $("#keywords").removeClass("collapsed"); }
	).find(".item").each(
		function (idx, elt) {
			var refs = maps["bundle-to-keywords"][this.id]
					.concat(maps["bundle-to-types"][this.id]);
			refs = $("#" + refs.join(",#"));
			$(this).hover(
				function (e) { refs.addClass("highlight"); },
				function (e) { refs.removeClass("highlight"); }
			).click(
				function (e) {
					if (e.isDefaultPrevented()) {
						return;
					}
					e.preventDefault();
					changeHash(this.id);
					var jqxhr = $.getJSON("/json/bundles/" + this.id + "/",
						function (data) {
							$('#bundles .item').each(function(idx, elt) {
							    if (this.id == (data.id))
							        $(this).addClass('selected').focus();
							    else
							        $(this).removeClass('selected');
							});
							$('.pubDate').html(data.completed);
							$('.bd-detail .bd-title').html(data.name);
							$('.bd-detail .description').html(data.description || "<p> </p>");
						}
					).done(
						function() {
							console.log("success");
						}
					).fail(
						function(res, msg, err) {
							console.log(msg + ":" + err.message);
						}
					);
				}
			);
		}
	);
		
	/** Component: Keyword List */
	$(".xhtml-page #keywords").hover(
		function () { $("#bundles").addClass("collapsed"); },
		function () { $("#bundles").removeClass("collapsed"); }
	).find(".item").each(
		function (idx, elt) {
			var refs = maps["keyword-to-bundles"][this.id];
			refs = $("#" + refs.join(",#"));
			$(this).hover(
				function (e) { refs.addClass("highlight"); },
				function (e) { refs.removeClass("highlight"); }
			).click(
				function (e) {
					if (e.isDefaultPrevented()) {
						return;
					}
					e.preventDefault();
				}
			);
		}
	);
		
	var changeHash = function (str) {
		str = '#/xhtml/bundles/' + str + "/";
		if(history.pushState)
			history.pushState(null, null, str);
		else
			location.hash = str;
	};
	
//	/** Requires jquery.address.js */
//	$.address.state(location.origin).init(
//		function() {
//			/** Remove the root state part form url */
//    		$('#bundles .item a').address(function() { 
//    	    	return $(this).attr('href').replace(location.origin, '');  
//    		});
//		}
//	).change(
//		function(event) {
//			/** Selects the proper navigation link */
//		    $('#bundles .item a').each(
//		    	function(idx, elt) {
//		        	if ($(this).attr('href') == ($.address.state() + event.path))
//		        	    $(this).addClass('selected').focus();
//		        	else
//		        		$(this).removeClass('selected');
//	    		}
//	    	);
//		    $('#main').html(event.path);
//		    $.address.title(/>([^<]*)<\/title/.exec(data)[1]);
//		}
//	);
});


/** Requires ga.js */
//try {
//	var tracker = _gat._getTracker("UA-9123564-6");
//	tracker._trackPageview();
//	tracker._setDomainName("canillas.name");
//} catch (e) {}


/** Requires jquery-ui.js */
//$(".keywords").selectable({
//	filter: "li a",
//	create: function (e, ui) {
//		$(this).children().each(function (idx) {
//			var refs = $(".entry:not(." + this.id + ")");
//			$(this).hover(
//				function () { refs.addClass("highlight"); },
//				function () { refs.removeClass("highlight"); }
//			);
//		});
//	},
//	selected: function (e, ui) {
//		$(".entry." + ui.selected.id).addClass("selected");
//		changeHash(ui.selected.id);
//	},
//	unselected: function (e, ui) {
//		$(".entry." + ui.unselected.id).removeClass("selected");
//	}
//});

	
/** Requires jquery.cycle.js */
//$(".pageable").each(
//	function (idx, elt) {
//		var list = $(this).children("ul");
//		list.children(":not(:first-child)").hide();
//		list.cycle({
//			fx: "fade", speed:"fast", timeout:0,
//			next: $(this).children(".next-button"),
//			prev: $(this).children(".prev-button")
//		});
//	}
//);
