import ButtonEditing from './ButtonEditing';
import FormElementUI from '../FormElementUI';

import fieldIcon from '../theme/icons/button.svg';
export default class ButtonUI extends FormElementUI {

	/**
	 * @inheritDoc
	 */
	 static get requires() {
		return [ ButtonEditing ];
	}

	constructor(editor){
		super(editor);
		
		this.command = editor.plugins.get( ButtonEditing ).command;
		this.label = editor.plugins.get( ButtonEditing ).label;
		this.fields = editor.plugins.get( ButtonEditing ).fields;
		this.fieldIcon = fieldIcon
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
			async form => {
				if ( !form.formdata.type || !form.formdata.type.length ) {
					return { field: 'type', message: t( 'Please select button type' )}
				}
			},
		];
	}
}

