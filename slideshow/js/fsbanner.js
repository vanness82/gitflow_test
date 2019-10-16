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

	this.options = $.extend({}, defaults, options);

	this.ilast = -1;

	this.setup = function() {
		this.container = $(container);
		this.items = this.container.find('div.fsitem');
		this.titles = this.container.find('div.title');
		if (!this.container.width()) this.container.width(this.container.parent().width());

		this.part = this.container.width() / this.items.length;
		//console.log('container:'+this.container.width());
		//console.log('part:'+this.part);
		//this.mini = this.part/4;
		this.widmain = this.container.width()/2; //
		this.mini = (this.container.width()-this.widmain)/(this.items.length-1);
		console.log('mini:'+this.mini);
		//this.widmain = this.container.width() - (this.mini*this.items.length-1);
		console.log('widmain:'+this.widmain);
		this.items.css({'height':this.container.height(),'width':this.widmain});	
		if (!this.options.showName) this.items.find('.shade').hide();

		this.items.each(function(i) {
			var $item = $(this);
			$item.css({'z-index':i});
			if (self.options.trigger == 'click') $item.on('click',function() { self.selectItem($item,i); });
			if (self.options.trigger == 'mouse') $item.on('mouseenter',function() { self.selectItem($item,i,true); });
		});

		if (self.options.trigger == 'mouse') {
			this.container.on('mouseleave',function() { self.resetcss(); });
		}

		this.resetcss();
		this.container.show();
	}

	this.resetcss = function() {
		this.titles.show();
		this.titles.stop().animate({'width':(this.part/this.widmain)*100+'%'});
		this.items.each(function(i) {
			var $item = $(this);
			$item.stop().animate({'left':i*self.part});

			if (self.options.showName) {
				var $shade = $item.find('.shade');
				$shade.addClass('minimized').fadeIn('fast');
			}
		});
		this.ilast = null;
		this.updateHtml();
	};

	this.selectItem = function($expanded,iexpanded,forceClick) {
		this.$lastexpanded = this.$expanded;

		if (forceClick) this.ilast = null;
		if (iexpanded == this.ilast) {
			this.$expanded = null;			
			this.resetcss();
		} else {
			this.$expanded = $expanded;			
			this.items.each(function(i) {
				var $item = $(this);
				var $title = $item.find('.title');
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
						console.log('if'+i+':'+$shade.hide()[method]('minimized').fadeIn('fast'));
					}
				}
				if(i == iexpanded) {
					$title.hide();
				}
			});
			this.ilast = iexpanded;
			this.updateHtml($expanded);
		}
		this.fireChanged();
	};

	this.updateHtml = function($expanded) {
		this.$expanded = $expanded;

		var $parent = $(self.options.hideParent);
		$.each(this.options.toUpdate,function(field,selector) {
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

	this.fireChanged = function() {
		if (this.options.onChanged) {
			this.options.onChanged(this.$expanded,this.$lastexpanded);
		}
	};

	this.setup();
};

$.fn.fsBanner = function(options) {
	return new fsBanner(this,options);
};