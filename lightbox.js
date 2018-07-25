;(function($){

	var LightBox = function(){
		var _self = this;

		//创建遮罩和弹出框
		this.popupMask = $('<div id="G-lightbox-mask">');
		this.popupWin = $('<div id="G-lightbox-popup">');

		//保存body
		this.bodyNode = $(document.body);

		//渲染剩余的DOM，并且插入到body
		this.renderDOM();

		//图片预览区域
		this.picViewArea = this.popupWin.find("div.lightbox-pic-view");
		//图片
		this.popupPic = this.popupWin.find("img.lightbox-image");
		//图片描述区域
		this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption");
		//
		this.nextBtn = this.popupWin.find("span.lightbox-next-btn");
		this.prevBtn = this.popupWin.find("span.lightbox-prev-btn");

		this.captionText = this.popupWin.find("p.lightbox-pic-desc");//图片描述
		this.currentIndex = this.popupWin.find("span.lightbox-of-index");//图片索引
		this.closeBtn = this.popupWin.find("span.lightbox-close-btn"); //关闭按钮

		//准备开发事件委托，获取组数据
	/*	var lightbox = $(".js-lightbox, [data-role=lightbox]");
		lightbox.click(function(){
			alert(" ");
		})*/

		this.groupName = null;
		this.groupData = [];  //放置同一组数据
		this.bodyNode.delegate(".js-lightbox, *[data-role=lightbox]","click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			
			var currentGroupName = $(this).attr("data-group");

			if(currentGroupName != _self.groupName){
				_self.groupName = currentGroupName;
				//根据当前组名获取同一组数据
				_self.getGroup();
			};

			//初始化弹出
			_self.initPopup($(this));
		});

			//关闭弹出
		this.popupMask.click(function(){
			$(this).fadeOut();
			_self.popupWin.fadeOut();
		});
		this.closeBtn.click(function(){
			_self.popupMask.fadeOut();
			_self.popupWin.fadeOut();
		});

		//绑定上下切换按钮事件
		this.flag = true;

		this.nextBtn.hover(function(){

							if($(this).hasClass("disabled") && _self.groupData.length > 1){
								$(this).addClass("lightbox-next-btn-show");
							};

						  },function(){

						  	if(!$(this).hasClass("disabled") && _self.groupData.length > 1){
								$(this).removeClass("lightbox-next-btn-show");
							};

						  }).click(function(e){
						  	if($(this).hasClass("disabled") && _self.flag){
						  		_self.flag = false;
						  		e.stopPropagation();
						  		_self.goto("next");
						  	}
						  });

		this.prevBtn.hover(function(){

							if($(this).hasClass("disabled") && _self.groupData.length > 1){
								$(this).addClass("lightbox-prev-btn-show");
							};

						  },function(){

						  	if(!$(this).hasClass("disabled") && _self.groupData.length > 1){
								$(this).removeClass("lightbox-prev-btn-show");
							};

						  }).click(function(e){
						  	if($(this).hasClass("disabled") && _self.flag){
						  		_self.flag = false;
						  		e.stopPropagation();
						  		_self.goto("prev");
						  	};
						  });
	};

	LightBox.prototype = {

		goto: function(dir){
			if(dir === "next"){
				
				this.index++;
				if(this.index >= this.groupData.length -1){
					this.nextBtn.removeClass("disabled").removeClass("lightbox-next-btn-show");		
				};
				if(this.index != 0){
					this.prevBtn.addClass("disabled");
				};

				var src = this.groupData[this.index].src;
				this.loadPicSize(src);

			}else if(dir === "prev"){
				this.index--;
				
				if(this.index <= 0){
					this.prevBtn.removeClass("disabled").removeClass("lightbox-prev-btn-show");				
				};
				if(this.index != this.groupData.length - 1){
					this.nextBtn.addClass("disabled");
				};
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);
			};
		},

		loadPicSize: function(sourceSrc){
			var _self = this;

			_self.popupPic.css({
				width:"auto",
				height: "auto"
			}).hide(); //图片变形

			this.preLoadImg(sourceSrc, function(){
				//alert("ok");
				_self.popupPic.attr("src", sourceSrc);
				var picWidth = _self.popupPic.width(),
				    picHeight = _self.popupPic.height();

				    //console.log(picWidth + ":" + picHeight);
				_self.changePic(picWidth, picHeight);

			});
		},

		changePic: function(width, height){
			var _self = this,
				winWidth = $(window).width();
				winHeight = $(window).height();

			//如果图片的宽高大于浏览器适口的宽高比例，就看是否溢出
			var scale = Math.min(winWidth/(width + 10), winHeight/(height + 10), 1);
			width = width * scale;
			height = height * scale;


			this.picViewArea.animate({
				width: width - 10,
				height: height - 10
			});

			this.popupWin.animate({
				width: width,
				height: height,
				marginLeft: -(width/2),
				top: (winHeight-height)/2
			},function(){
				_self.popupPic.css({
					width: width - 10,
					height: height - 10
				}).fadeIn();
				_self.picCaptionArea.fadeIn();
				_self.flag = true;
			});
		//设置描述文字和当前索引
		this.captionText.text(this.groupData[this.index].caption);
		this.currentIndex.text("当前索引：" + (this.index + 1) + " of " + this.groupData.length);
		},

		preLoadImg: function(src, callback){
			var img = new Image();
			if(!!window.ActiveXObject){
				img.onreadystatechange = function(){
					if(this.readyState == "complete"){
						callback();
					};

				};
			}else{
				img.onload = function(){
					callback();
				};
			};
			img.src = src;

		},

		showMaskAndPopup: function(sourceSrc, currentId){
			var self_ = this;

			this.popupPic.hide();
			this.picCaptionArea.hide();

			this.popupMask.fadeIn();

			var winWidth = $(window).width(),
				winHeight = $(window).height();

			this.picViewArea.css({
									width: winWidth/2,
									height: winHeight/2
								});

			this.popupWin.fadeIn();

			var viewHeight = winHeight/2 + 10;

			this.popupWin.css({
									width: winWidth/2 + 10,
									height: winHeight/2 + 10,
									marginLeft: -(winWidth/2 + 10)/2,
									top: -viewHeight
							  }).animate({
											top:(winHeight- viewHeight)/2
										 }, function(){
										 	//加载图片
										 	self_.loadPicSize(sourceSrc);
										 });
						      

						      //根据当前点击的元素ID获取在当前组别里面的索引              });
							  this.index = this.getIndexOf(currentId);

							  var groupDataLength = this.groupData.length;
							  if(groupDataLength > 1){
							  	if(this.index === 0){
							  		this.prevBtn.addClass("disabled");
							  		this.nextBtn.removeClass("disabled");
							  	}else if(this.index === groupDataLength -1){
							  		this.nextBtn.addClass("disabled");
							  		this.prevBtn.removeClass("disabled");
							    }else{
							    	this.nextBtn.addClass("disabled");
							    	this.prevBtn.addClass("disabled");
							         };
							     }

			                    

		},

		getIndexOf: function(currentId){
			var index = 0;
			$(this.groupData).each(function(i){
				index = i;
				if(this.id === currentId){
					return false;
				}
			});
			return index;
		},

		initPopup: function(currentObj){
			var self_ = this,
				sourceSrc = currentObj.attr("data-source"),
				currentId = currentObj.attr("data-id");

			this.showMaskAndPopup(sourceSrc, currentId);
		},

		getGroup:  function(){
			var _self = this;
			//根据当前的组别名称获取页面中所有相同组别的对象
			var groupList = this.bodyNode.find("*[data-group ="+ this.groupName +"]");

			//清空数组数据
			_self.groupData.length = 0;

			groupList.each(function(){
				_self.groupData.push({
					src: $(this).attr("data-source"),
					id: $(this).attr("data-id"),
					caption: $(this).attr("data-caption")
				});
			});	
			console.log(_self.groupData)		
		},

		renderDOM: function(){
			var strDom = '<div class="lightbox-pic-view">'+
							'<span class="lightbox-btn lightbox-prev-btn">'+	
							'</span>'+
							'<img class="lightbox-image" src="img/1.jpg">'+
							'<span class="lightbox-btn lightbox-next-btn">'+
							'</span>'+
						'</div>'+
						'<div class="lightbox-pic-caption">'+
							'<div class="lightbox-caption-area">'+
								'<p class="lightbox-pic-desc"></p>'+
								'<span class="lightbox-of-index">当前索引： 0 of 0</span>'+
							'</div>'+	
							'<span class="lightbox-close-btn">'+
							'</span>'+
						'</div>';

			//插入到this.popupWin
			this.popupWin.html(strDom);
			//把遮罩和弹出框插入到body
			this.bodyNode.append(this.popupMask, this.popupWin);
		}

	};

	window["LightBox"] = LightBox;

})(jQuery);