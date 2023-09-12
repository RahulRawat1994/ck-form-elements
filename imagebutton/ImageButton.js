import ImageButtonEditing from './ImageButtonEditing';
import ImageButtonUI from './ImageButtonUI.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

export default class ImageButton extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageButtonEditing, ImageButtonUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageButton';
	}
}
