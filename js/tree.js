+function ($) { "use strics";

	var Tree = function (element) {
		$(element).find('a').on('click', this.toggle)
	}

	Tree.prototype.toggle = function(e) {
		$(e.target).siblings().toggleClass('collapse')
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