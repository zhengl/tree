+function ($) { "use strics";

	var Tree = function (element, options) {
		this.$element = $(element)
		this.options = $.extend({}, Tree.DEFAULTS, options)
		var $links = this.$element.find('a')
		$links.on('click', this.toggle)

		if(this.$element.hasClass('tree-default')) this.addIcon($links)
		if(this.$element.hasClass('tree-checkbox')) this.addCheckbox($links)
		if(this.options.draggable) this.enableDraggable($links)
		if(this.options.droppable) this.enableDroppable($links)
	}

	Tree.DEFAULTS = {
		draggable: false,
		dragstart: dragstart,
		dragover: dragover,
		droppable: false,
		drop: drop,
	}

	function dragstart(event){
		event.target.id = "tree-drag-temp-id"
	}

	function dragover(event){
		if($(event.target).siblings('ul').length != 0) {
			event.preventDefault()
		}
	}

	function drop(event){
		var $draggable = $('#tree-drag-temp-id')
		$draggable.removeAttr('id')
		var $droppable = $(event.target)
		if($droppable.parent()[0] !== $draggable[0]) {
			$droppable.siblings('ul').append($draggable)
		}
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

	Tree.prototype.addCheckbox = function($links) {
		$links.each(function(){
			var $this = $(this)
			var $checkbox = $('<input type="checkbox">')
			$this.before($checkbox)
		})
	};

	Tree.prototype.enableDraggable = function($links) {
		var self = this
		$links.each(function(){
			$(this).parent()
			.attr('draggable', true)
			.on('dragstart', self.options.dragstart)
		})
	};

	Tree.prototype.enableDroppable = function($links) {
		var self = this
		$links.each(function(){
			$(this)
			.on('dragover', self.options.dragover)
			.on('drop', self.options.drop)
		})
	};

	$.fn.tree = function (options) {
		return this.each(function () {
			var $this = $(this)
			var data = $this.data('bsx.tree')

			if (!data) $this.data('bsx.tree', (data = new Tree(this, options)))
		})
	}

	$.fn.tree.Constructor = Tree

}(window.jQuery)