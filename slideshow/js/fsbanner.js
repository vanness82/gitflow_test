var fsBanner = function(container,options) {
	var self = this;
	var defaults = {
		'showName':true,	
		'toUpdate':{},
		'whenEmpty':{},
		'trigger':'click',
		'hideParent':null,
		'onChanged':null
	}

	self.options = $.extend({}, defaults, options);

	self.ilast = -1;

	self.setup = function() {
		self.container = $(container);
		self.items = self.container.find('a.fsitem');
		self.titles = self.container.find('div.title');
		self.imgs = self.container.find('img.tran');
		if (!self.container.width()) self.container.width(self.container.parent().width());

		self.part = self.container.width() / self.items.length; //初始单元格宽度
		self.widmain = self.container.width()/2;  //单元格最大宽度
		self.mini = (self.container.width()-self.widmain)/(self.items.length-1); //单元格挤压之后的宽度
		self.items.css({'height':self.container.height(),'width':self.widmain});	
		if (!self.options.showName) self.items.find('.shade').hide();

		self.items.each(function(i) {
			var $item = $(this);
			$item.css({'z-index':i});
			if (self.options.trigger == 'click') $item.on('click',function() { self.selectItem($item,i); });
			if (self.options.trigger == 'mouse') $item.on('mouseenter',function() { self.selectItem($item,i,true); });
		});

		if (self.options.trigger == 'mouse') {
			self.container.on('mouseleave',function() { self.resetcss(); });
		}

		self.resetcss();
		container.show();
	}

	self.resetcss = function() {
		self.titles.show();
		self.titles.stop().animate({'width':(self.part/self.widmain)*100+'%'});
		self.imgs.hide();
		self.items.each(function(i) {
			var $item = $(this);
			$item.stop().animate({'left':i*self.part});

			if (self.options.showName) {
				var $shade = $item.find('.shade');
				$shade.addClass('minimized').fadeIn('fast');
			}
		});
		self.ilast = null;
		self.updateHtml();
	};

	self.selectItem = function($expanded,iexpanded,forceClick) {
		self.$lastexpanded = self.$expanded;

		if (forceClick) self.ilast = null;
		if (iexpanded == self.ilast) {
			self.$expanded = null;			
			self.resetcss();
		} else {
			self.$expanded = $expanded;			
			self.items.each(function(i) {
				var $item = $(this);
				var $title = $item.find('.title');
				var $img = $item.find('.tran');
				if (i <= iexpanded) {
					$item.stop().animate({'left':i*self.mini});
				} else {
					$item.stop().animate({'left':(i-1)*self.mini+self.widmain});
				}
				$title.stop().animate({'width':(self.mini / self.widmain)*100+'%'});
				if (self.options.showName) {
					var $shade = $item.find('.shade');
					var method = (i == iexpanded) ? 'removeClass' : 'addClass';				
					if (method == 'addClass' && $shade.hasClass('minimized')) {
						method = '';
					}
					if (method){
						$shade.hide()[method]('minimized').fadeIn('fast');
						//console.log('if'+i+':'+$shade.hide()[method]('minimized').fadeIn('fast'));
					}
				}
				if(i == iexpanded) {
					$title.hide();
					$img.fadeIn(1500);
				}
				else{
					$title.show();
					$img.hide();
				}
			});
			self.ilast = iexpanded;
			self.updateHtml($expanded);
		}
		self.fireChanged();
	};

	self.updateHtml = function($expanded) {
		self.$expanded = $expanded;

		var $parent = $(self.options.hideParent);
		$.each(self.options.toUpdate,function(field,selector) {
			var $obj = $(selector);
			var showit = false;
			var value = '';
			if ($expanded) {
				$parent.show();
				value = $expanded.find('.'+field).html();
				showit = true;
			} else {
				if ($parent.length) {
					showit = false;
					$parent.hide();
				} else {
					if (self.options.whenEmpty[field]) {
						value = self.options.whenEmpty[field];
						showit = true;
					}
				}
			}
			$obj.hide();
			if (showit) $obj.html(value).fadeIn('fast');
		});
	};

	self.fireChanged = function() {
		if (self.options.onChanged) {
			self.options.onChanged(self.$expanded,self.$lastexpanded);
		}
	}; 
	self.setup();
};

$.fn.fsBanner = function(options) {
	return new fsBanner(this,options);
};