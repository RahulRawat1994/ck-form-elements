import SelectionFieldEditing from './SelectionFieldEditing';
import SelectionFieldUI from './SelectionFieldUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
;

export default class SelectionField extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ SelectionFieldEditing, SelectionFieldUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SelectionField';
	}
	
}
