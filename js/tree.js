+function ($) { "use strics";

	var Tree = function (element) {
		this.$element = $(element)
		var $links = this.$element.find('a')
		$links.on('click', this.toggle)

		if(this.$element.hasClass('tree-default')) this.addIcon($links)
	}

	Tree.prototype.toggle = function(e) {
		var $a = $(e.target)
		if($a.siblings('ul').length != 0) $a.parent().toggleClass('tree-collapse')
	};

	Tree.prototype.addIcon = function($links) {
		$links.each(function(){
			var $this = $(this)
			var $fileIcon = $('<span class="glyphicon glyphicon-file"></span>')
			var $openIcon = $('<span class="glyphicon glyphicon-folder-open"></span>')
			$this.html(" " + $this.html()) //dirty hack to prepend padding
			if($this.siblings('ul').length == 0) $this.prepend($fileIcon)
			else $this.prepend($openIcon)
		})

	};

	$.fn.tree = function () {
		return this.each(function () {
			var $this = $(this)
			var data = $this.data('bsx.tree')

			if (!data) $this.data('bsx.tree', (data = new Tree(this)))
		})
	}

	$.fn.tree.Constructor = Tree

}(window.jQuery)