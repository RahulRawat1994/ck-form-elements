import TextAreaEditing from './TextAreaEditing';
import FormElementUI from '../FormElementUI';
import fieldIcon from '../theme/icons/textarea.svg';

export default class TextAreaUI extends FormElementUI {

	/**
	 * @inheritDoc
	 */
	 static get requires() {
		return [ TextAreaEditing ];
	}

	constructor(editor){
		super(editor);
		
		this.command = editor.plugins.get( TextAreaEditing ).command;
		this.label = editor.plugins.get( TextAreaEditing ).label;
		this.fields = editor.plugins.get( TextAreaEditing ).fields;
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
				if ( form.formdata.rows && !(/^[0-9]*$/.test(form.formdata.rows)) ) {
					return {field: 'rows', message: t( 'Only numeric characters are allowed' )}
				}  
			},
			async form => {
				if ( form.formdata.cols && !(/^[0-9]*$/.test(form.formdata.cols)) ) {
					return {field: 'cols', message: t( 'Only numeric characters are allowed' )}
				} 
			},
		];
	}
}