import HiddenFieldEditing from './HiddenFieldEditing';
import HiddenFieldUI from './HiddenFieldUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
;

export default class HiddenField extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ HiddenFieldEditing, HiddenFieldUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HiddenField';
	}
	
}
