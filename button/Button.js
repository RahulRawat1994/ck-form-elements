import ButtonEditing from './ButtonEditing';
import ButtonUI from './ButtonUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class Button extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ButtonEditing, ButtonUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ckButton';
	}
}
