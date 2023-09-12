import TextFieldEditing from './TextFieldEditing';
import FormElementUI from '../FormElementUI';
import fieldIcon from '../theme/icons/textfield.svg';
export default class TextFieldUI extends FormElementUI {

	/**
	 * @inheritDoc
	 */
	 static get requires() {
		return [ TextFieldEditing ];
	}

	constructor(editor){
		super(editor);
		
		this.command = editor.plugins.get( TextFieldEditing ).command;
		this.label = editor.plugins.get( TextFieldEditing ).label;
		this.fields = editor.plugins.get( TextFieldEditing ).fields;
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
				if ( !form.formdata.type || !form.formdata.type.length ) {
					return { field: 'type', message: t( 'Please select text type' )}
				}
			},
			async form => {
				if ( form.formdata.size && !(/^[0-9]*$/.test(form.formdata.size)) ) {
					return {field: 'size', message: t( 'Only numeric characters are allowed' )}
				}  
			},
			async form => {
				if ( form.formdata.maxlength && !(/^[0-9]*$/.test(form.formdata.maxlength)) ) {
					return {field: 'maxlength', message: t( 'Only numeric characters are allowed' )}
				} 
			},
		];
	}
}

