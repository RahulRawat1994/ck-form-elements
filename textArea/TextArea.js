import TextAreaEditing from './TextAreaEditing';
import TextAreaUI from './TextAreaUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class TextArea extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TextAreaEditing, TextAreaUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ckTextArea';
	}
}