+function ($) { "use strics";

	var Tree = function (element, options) {
		this.$element = $(element)
		this.options = $.extend({}, Tree.DEFAULTS, options)
		var $links = this.$element.find('a')
		$links.on('click', this.toggle)

		this.enableFeatures($links)
		if(this.options.menu) this.addMenu()
	}

	Tree.DEFAULTS = {
		draggable: false,
		dragstart: dragstart,
		dragover: dragover,
		droppable: false,
		drop: drop,
	}

	Tree.prototype.enableFeatures = function($links) {
		var self = this;
		$links.each(function(){
			var $this = $(this)
			if(self.$element.hasClass('tree-default')) self.addIcon($this)
			if(self.$element.hasClass('tree-checkbox')) self.addCheckbox($this)
			if(self.options.draggable) self.enableDraggable($this)
			if(self.options.droppable) self.enableDroppable($this)
		})
	};

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
			if($this.siblings('ul').length == 0) $this.prepend($fileIcon)
			else $this.prepend($openIcon)
		})
	};

	Tree.prototype.addCheckbox = function($links) {
		$links.each(function(){
			var $this = $(this)
			var $checkbox = $('<input type="checkbox">')
			$checkbox.on('click', function(){
				var checked = this.checked
				$(this).siblings('ul').find('input[type="checkbox"]').prop('checked', checked)
			})
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

	Tree.prototype.addMenu = function() {
		this.$menu = this.createMenu()
		var $menuWrapper = $('<div id="tree-dropdown"></div>')
		$menuWrapper.append(this.$menu)
		this.$element.after($menuWrapper)

		var self = this
		$(document).on('contextmenu', '.tree a', function(e){
			if($(e.target).prop('tagName') == 'A') {
				self.setFocusedNode($(e.target))
				$menuWrapper.css({
					left: e.pageX,
					top: e.pageY,
				})
				self.$menu.show();
			} else {
				self.$menu.hide();
			}
			return false;
		})

		$(document).on('click', function(){
			self.$menu.hide()
		})
	};

	Tree.prototype.createMenu = function() {
		var $menu = $('<ul class="dropdown-menu"></ul>')
		$menu.append(this.createNewFolderMenuItem())
		$menu.append(this.createNewFileMenuItem())
		$menu.append(this.createRenameMenuItem())
		$menu.append(this.createDeleteMenuItem())
		$menu.append(this.createFindMenuItem())
		return $menu
	};

	Tree.prototype.createNewFolderMenuItem = function() {
		var self = this
		var $newFolderItem = this.createMenuItem('<span class="glyphicon glyphicon-folder-close"></span>New Folder')
		$newFolderItem.on('click', function(event){
			event.stopPropagation()
			var $link = self.getFocusedNode()
			var $node = self.createFolderNode()
			if($link.siblings('ul').length == 0) $link.parent().after($node)
			else $link.siblings('ul').append($node)
			
			self.enableFeatures($node.find('a'))

			$node.find('input').focus()

			self.$menu.hide()
		})
		return $newFolderItem
	};

	Tree.prototype.createNewFileMenuItem = function() {
		var self = this
		var $newFileItem = this.createMenuItem('<span class="glyphicon glyphicon-file"></span>New File')
		$newFileItem.on('click', function(event){
			event.stopPropagation()
			var $link = self.getFocusedNode()
			var $node = self.createFileNode()
			if($link.siblings('ul').length == 0) $link.parent().append($node)
			else $link.siblings('ul').append($node)

			self.enableFeatures($node.find('a'))

			$node.find('input').focus()

			self.$menu.hide()
		})
		return $newFileItem
	};

	Tree.prototype.createFindMenuItem = function() {
		var self = this
		var $findItem = this.createMenuItem('<span class="glyphicon glyphicon-search"></span>')
		var $findItemInput = this.createFindInput()
		$findItem.find('a').append($findItemInput)
		return $findItem
	};	

	Tree.prototype.createRenameMenuItem = function() {
		var self = this
		var $renameItem = this.createMenuItem('<span class="glyphicon glyphicon-pencil"></span>Rename')
		$renameItem.on('click', function(event){
			event.stopPropagation()
			var $link = self.getFocusedNode()
			$link.removeClass('found')
			var $input = self.createNodeInput()
			$nodeName = $link.contents().last()
			$input.val($nodeName.text())
			$nodeName.replaceWith($input)

			$input.focus()

			self.$menu.hide()
		})
		return $renameItem
	};	

	Tree.prototype.createDeleteMenuItem = function() {
		var self = this
		var $deleteItem = this.createMenuItem('<span class="glyphicon glyphicon-remove"></span>Delete')
		$deleteItem.on('click', function(event){
			event.stopPropagation()
			var $link = self.getFocusedNode()
			var $node = self.createFileNode()
			$link.parent().remove()

			self.$menu.hide()
		})
		return $deleteItem
	};		

	Tree.prototype.createMenuItem = function(itemName) {
		return $('<li><a>' + itemName + '</a></li>')
	};

	Tree.prototype.setFocusedNode = function($link) {
		this.focusedNode = $link
	};

	Tree.prototype.getFocusedNode = function() {
		return this.focusedNode
	};

	Tree.prototype.createFolderNode = function() {
		var $newFolderNode = $('<li><a></a><ul></ul></li>')
		var $input = this.createNodeInput()
		$newFolderNode.find('a').append($input)
		return $newFolderNode
	};

	Tree.prototype.createFileNode = function() {
		var $newFileNode = $('<li><a></a></li>')
		var $input = this.createNodeInput()
		$newFileNode.find('a').append($input)
		return $newFileNode
	};

	Tree.prototype.createNodeInput = function() {
		var $input = $('<input type="text">')
		$input.on('keypress', function(event){
			if (event.which == 13) {
				var $this = $(this)
				if($this.val() == '') {
					$this.addClass('has-error')
				} else {
					$this.parent().append($this.val())
					$this.remove()	
				}
			}
		})
		return $input
	};

	Tree.prototype.createFindInput = function() {
		var self = this;
		var $input = $('<input type="text" placeholder="Find">')
		$input.on('keypress', function(event){
			if (event.which == 13) {
				var $this = $(this)
				if($this.val() == '') {
					$this.addClass('has-error')
				} else {
					var regex = new RegExp($this.val(), 'i')
					self.$element.find('a').each(function(){
						if(regex.test($(this).text())) {
							$(this).addClass('found')
							$(this).parent().parents().removeClass('tree-collapse')
						}
						else $(this).removeClass('found')
					})
					$this.val('')
					self.$menu.hide()
				}
			}
		})
		$input.on('click', function(event){
			event.stopPropagation()
		})
		return $input
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