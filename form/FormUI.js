import FormEditing from './FormEditing';
import FormElementUI from '../FormElementUI';
import fieldIcon from '../theme/icons/form.svg';
export default class FormUI extends FormElementUI {

	/**
	 * @inheritDoc
	 */
	 static get requires() {
		return [ FormEditing ];
	}
	
	constructor(editor){
		super(editor);
		
		this.command = editor.plugins.get( FormEditing ).command;
		this.label = editor.plugins.get( FormEditing ).label;
		this.fields = editor.plugins.get( FormEditing ).fields;
		this.fieldIcon = fieldIcon;
	}

	/**
	 * Setup validation for form 
	 * @param {Object} t  
	 * @returns {Object} 
	 */
	 getFormValidators( t ) {
		return [
		];
	}
}

