window.administrate = window.administrate || {}
window.administrate.mce = window.administrate.mce || {}
window.administrate.mce.toolbar = (function (Tools, Factory) {
	var defaultToolbar = "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | " +
		"bullist numlist outdent indent | link image";

	var createToolbar = function (editor, items, size) {
		var toolbarItems = [], buttonGroup;

		if (!items) {
			return;
		}

		Tools.each(items.split(/[ ,]/), function(item) {
			var itemName;

			var setActiveItem = function (name) {
				return function(state, args) {
					var nodeName, i = args.parents.length;

					while (i--) {
						nodeName = args.parents[i].nodeName;
						if (nodeName == "OL" || nodeName == "UL") {
							break;
						}
					}

					item.active(state && nodeName == name);
				};
			};

			var bindSelectorChanged = function () {
				var selection = editor.selection;

				if (itemName == "bullist") {
					selection.selectorChanged('ul > li', setActiveItem("UL"));
				}

				if (itemName == "numlist") {
					selection.selectorChanged('ol > li', setActiveItem("OL"));
				}

				if (item.settings.stateSelector) {
					selection.selectorChanged(item.settings.stateSelector, function(state) {
						item.active(state);
					}, true);
				}

				if (item.settings.disabledStateSelector) {
					selection.selectorChanged(item.settings.disabledStateSelector, function(state) {
						item.disabled(state);
					});
				}
			};

			if (item == "|") {
				buttonGroup = null;
			} else {
				if (Factory.has(item)) {
					item = {type: item, size: size};
					toolbarItems.push(item);
					buttonGroup = null;
				} else {
					if (!buttonGroup) {
						buttonGroup = {type: 'buttongroup', items: []};
						toolbarItems.push(buttonGroup);
					}

					if (editor.buttons[item]) {
						// TODO: Move control creation to some UI class
						itemName = item;
						item = editor.buttons[itemName];

						if (typeof item == "function") {
							item = item();
						}

						item.type = item.type || 'button';
						item.size = size;

						item = Factory.create(item);
						buttonGroup.items.push(item);

						if (editor.initialized) {
							bindSelectorChanged();
						} else {
							editor.on('init', bindSelectorChanged);
						}
					}
				}
			}
		});

		return {
			type: 'toolbar',
			layout: 'flow',
			items: toolbarItems
		};
	};

	/**
	 * Creates the toolbars from config and returns a toolbar array.
	 *
	 * @param {String} size Optional toolbar item size.
	 * @return {Array} Array with toolbars.
	 */
	var createToolbars = function (editor, size) {
		var toolbars = [], settings = editor.settings;

		var addToolbar = function (items) {
			if (items) {
				toolbars.push(createToolbar(editor, items, size));
				return true;
			}
		};

		// Convert toolbar array to multiple options
		if (Tools.isArray(settings.toolbar)) {
			// Empty toolbar array is the same as a disabled toolbar
			if (settings.toolbar.length === 0) {
				return;
			}

			Tools.each(settings.toolbar, function(toolbar, i) {
				settings["toolbar" + (i + 1)] = toolbar;
			});

			delete settings.toolbar;
		}

		// Generate toolbar<n>
		for (var i = 1; i < 10; i++) {
			if (!addToolbar(settings["toolbar" + i])) {
				break;
			}
		}

		// Generate toolbar or default toolbar unless it's disabled
		if (!toolbars.length && settings.toolbar !== false) {
			addToolbar(settings.toolbar || defaultToolbar);
		}

		if (toolbars.length) {
			return {
				type: 'panel',
				layout: 'stack',
				classes: "toolbar-grp",
				ariaRoot: true,
				ariaRemember: true,
				items: toolbars
			};
		}
	};

	return {
		createToolbar: createToolbar,
		createToolbars: createToolbars
	};
})(window.tinymce.util.Tools, window.tinymce.ui.Factory)
