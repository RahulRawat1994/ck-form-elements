
import FormElementEditing from '../FormElementEditing';
import formElements from '../form_elements.json';
import fieldIcon from '../theme/icons/button.svg';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export default class TextFieldEditing extends FormElementEditing {
  
	constructor(editor){
		super(editor)

		this.command = 'insertTextField'; 

		// names
		this.viewElementName = 'input';
		this.modelElementName = 'TextField';
		this.label = 'Text Field';
		this.fieldIcon = fieldIcon;
		// fields
		this.fields = formElements.textField;
		
		//  attributes
		this.allowAttributes = ['type', 'name', 'value', 'class','size', 'maxlength']
		this.defaultAttributes = {
			type: 'text',
			class:'ck-field__textfield',
		}
	}

	/**
	 * @private
	 * Define converter for model to view, view to model
	 */
	 _defineConverters(){
		const conversion = this.editor.conversion;

   		// InputBox   converters
		conversion.for( 'upcast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: {
				name: 'label',
				attributes: ['data-text']
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: ( modelElement, { writer: viewWriter } ) => {
				return viewWriter.createContainerElement( 'label' , { 'data-text' : 'true'});
			}
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'label', { 'data-text' : 'true'});
				return toWidget( section, viewWriter, );
			}
		});

		//  Input converters
		conversion.for( 'upcast' ).elementToElement( {
				view: this.viewElementName,
				model: ( viewElement, { writer } ) => {
					let attrs= {};
					viewElement._attrs.forEach((value,key)=> {
						attrs[key] = value;
					});
					return writer.createElement( `${this.modelElementName}Input`,attrs );
				}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: `${this.modelElementName}Input`,
			view: ( modelElement, { writer: viewWriter } ) => {
					let attrs= this.defaultAttributes || {};
					modelElement._attrs.forEach((value,key)=> attrs[key] = value);
					return viewWriter.createContainerElement( this.viewElementName, attrs );
			},
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
				model: `${this.modelElementName}Input`,
				view: ( modelElement, { writer: viewWriter } ) => {
					let attrs= this.defaultAttributes || {};  
					modelElement._attrs.forEach((value,key)=> attrs[key] = value);
					
					const section = viewWriter.createContainerElement( this.viewElementName, attrs );
					return toWidget( section, viewWriter, );
				}
		});
	}
}