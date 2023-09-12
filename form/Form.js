import FormEditing from './FormEditing';
import FormUI from './FormUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class Form extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FormEditing, FormUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Form';
	}	
}
