import HiddenFieldEditing from './HiddenFieldEditing';
import FormElementUI from '../FormElementUI';
import fieldIcon from '../theme/icons/hiddenfield.svg';
export default class HiddenFieldUI extends FormElementUI {

	/**
	 * @inheritDoc
	 */
	 static get requires() {
		return [ HiddenFieldEditing ];
	}

	constructor(editor){
		super(editor);
		
		this.command = editor.plugins.get( HiddenFieldEditing ).command;
		this.label = editor.plugins.get( HiddenFieldEditing ).label;
		this.fields = editor.plugins.get( HiddenFieldEditing ).fields;
		this.fieldIcon = fieldIcon;
	}

	/**
	 * Setup validation for form 
	 * @param {Object} t 
	 * @returns {Object} 
	 */
	 getFormValidators( t ) {
		return [
			async form => {
				if ( !form.formdata.name || !form.formdata.name.length ) {
					return {field: 'name', message: t( 'The name must not be empty.' )}
				} 
			},
			async form => {
				if ( !form.formdata.value || !form.formdata.value.length ) {
					return {field: 'value', message: t( 'The value must not be empty.' )}
				}
			},
		];
	}
}

