import TextFieldEditing from './TextFieldEditing';
import TextFieldUI from './TextFieldUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class TextField extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TextFieldEditing, TextFieldUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ckTextField';
	}
}
