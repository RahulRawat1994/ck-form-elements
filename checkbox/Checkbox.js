import CheckboxEditing from './CheckboxEditing';
import CheckboxUI from './CheckboxUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class Checkbox extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CheckboxEditing, CheckboxUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Checkbox';
	}	
}
