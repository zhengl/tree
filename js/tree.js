+function ($) { "use strics";

	var Tree = function (element, options) {
		this.$element = $(element)
		this.options = $.extend({}, Tree.DEFAULTS, options)
		
		this.initialize();
	}

	Tree.DEFAULTS = {
		draggable: false,
		dragstart: dragstart,
		dragover: dragover,
		droppable: false,
		drop: drop,
	}

	Tree.prototype.initialize = function() {
		var $links = this.$element.find('a')
		$links.on('click', this.toggle)

		this.enableFeatures($links)
		if(this.options.menu) this.addMenu()
	};

	Tree.prototype.enableFeatures = function($links) {
		var _this = this;
		$links.each(function(){
			var $this = $(this)
			if(_this.$element.hasClass('tree-default')) _this.addIcon($this)
			if(_this.$element.hasClass('tree-checkbox')) _this.addCheckbox($this)
			if(_this.options.draggable) _this.enableDraggable($this)
			if(_this.options.droppable) _this.enableDroppable($this)
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
		var _this = this
		$links.each(function(){
			$(this).parent()
			.attr('draggable', true)
			.on('dragstart', _this.options.dragstart)
		})
	};

	Tree.prototype.enableDroppable = function($links) {
		var _this = this
		$links.each(function(){
			$(this)
			.on('dragover', _this.options.dragover)
			.on('drop', _this.options.drop)
		})
	};

	Tree.prototype.addMenu = function() {
		this.$menu = this.createMenu()
		var $menuWrapper = $('<div id="tree-dropdown"></div>')
		$menuWrapper.append(this.$menu)
		this.$element.after($menuWrapper)

		var _this = this
		$(document).on('contextmenu', '.tree a', function(e){
			if($(e.target).prop('tagName') == 'A') {
				_this.setFocusedNode($(e.target))
				$menuWrapper.css({
					left: e.pageX,
					top: e.pageY,
				})
				_this.$menu.show();
			} else {
				_this.$menu.hide();
			}
			return false;
		})

		$(document).on('click', function(){
			_this.$menu.hide()
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
		var _this = this
		var $newFolderItem = this.createMenuItem('<span class="glyphicon glyphicon-folder-close"></span>New Folder')
		$newFolderItem.on('click', function(event){
			event.stopPropagation()
			var $link = _this.getFocusedNode()
			var $node = _this.createFolderNode()
			if($link.siblings('ul').length == 0) $link.parent().after($node)
			else $link.siblings('ul').append($node)

			_this.enableFeatures($node.find('a'))

			$node.find('input').focus()

			_this.$menu.hide()
		})
		return $newFolderItem
	};

	Tree.prototype.createNewFileMenuItem = function() {
		var _this = this
		var $newFileItem = this.createMenuItem('<span class="glyphicon glyphicon-file"></span>New File')
		$newFileItem.on('click', function(event){
			event.stopPropagation()
			var $link = _this.getFocusedNode()
			var $node = _this.createFileNode()
			if($link.siblings('ul').length == 0) $link.parent().append($node)
			else $link.siblings('ul').append($node)

			_this.enableFeatures($node.find('a'))

			$node.find('input').focus()

			_this.$menu.hide()
		})
		return $newFileItem
	};

	Tree.prototype.createFindMenuItem = function() {
		var _this = this
		var $findItem = this.createMenuItem('<span class="glyphicon glyphicon-search"></span>')
		var $findItemInput = this.createFindInput()
		$findItem.find('a').append($findItemInput)
		return $findItem
	};

	Tree.prototype.createRenameMenuItem = function() {
		var _this = this
		var $renameItem = this.createMenuItem('<span class="glyphicon glyphicon-pencil"></span>Rename')
		$renameItem.on('click', function(event){
			event.stopPropagation()
			var $link = _this.getFocusedNode()
			$link.removeClass('found')
			var $input = _this.createNodeInput()
			$nodeName = $link.contents().last()
			$input.val($nodeName.text())
			$nodeName.replaceWith($input)

			$input.focus()

			_this.$menu.hide()
		})
		return $renameItem
	};

	Tree.prototype.createDeleteMenuItem = function() {
		var _this = this
		var $deleteItem = this.createMenuItem('<span class="glyphicon glyphicon-remove"></span>Delete')
		$deleteItem.on('click', function(event){
			event.stopPropagation()
			var $link = _this.getFocusedNode()
			var $node = _this.createFileNode()
			$link.parent().remove()

			_this.$menu.hide()
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
		var _this = this;
		var $input = $('<input type="text" placeholder="Find">')
		$input.on('keypress', function(event){
			if (event.which == 13) {
				var $this = $(this)
				if($this.val() == '') {
					$this.addClass('has-error')
				} else {
					var regex = new RegExp($this.val(), 'i')
					_this.$element.find('a').each(function(){
						if(regex.test($(this).text())) {
							$(this).addClass('found')
							$(this).parent().parents().removeClass('tree-collapse')
						}
						else $(this).removeClass('found')
					})
					$this.val('')
					_this.$menu.hide()
				}
			}
		})
		$input.on('click', function(event){
			event.stopPropagation()
		})
		return $input
	};

	Tree.prototype.toJson = function($element) {
		var result = {}
		var _this = this
		var $root = $element || this.$element
		$root.children('li').each(function() {
			var key = $(this).children('a').text()
			if($(this).children('ul').length == 0) {
				result[key] = {type: 'file'}
			} else {
				result[key] = {type: 'dir'}
				result[key].children = _this.toJson($(this).children('ul'))
			}
		})
		return result
	};

	Tree.prototype.fromJson = function(json) {
		this.clear();
		this.fromJsonToPlainHtml(json, this.$element);
		this.initialize();
	};

	Tree.prototype.fromJsonToPlainHtml = function(json, $element) {
		for(var node in json) {
			if(json[node].type == 'file') {
				$element.append($('<li><a>' + node + '</a></li>'))
			} 
			else if(json[node].type == 'dir') {
				var $child = $('<li></li>')
				$child.append($('<a>' + node + '</a>'))
				$child.append(this.fromJsonToPlainHtml(json[node].children, $('<ul></ul>')))
				$element.append($child)
			}
		}
		return $element;
	};

	Tree.prototype.clear = function() {
		this.$element.empty();
	};

	$.fn.tree = function (options) {
		var $this = $(this)
		var data = $this.data('bsx.tree')

		if (!data) $this.data('bsx.tree', (data = new Tree(this, options)))
		return data
	}

	$.fn.tree.Constructor = Tree

	$.fn.outerHTML = function() {
	  return jQuery('<div />').append(this.eq(0).clone()).html();
	};

}(window.jQuery)

