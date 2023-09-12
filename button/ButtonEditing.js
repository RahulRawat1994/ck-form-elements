
import FormElementEditing from '../FormElementEditing';
import formElements from '../form_elements.json';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import fieldIcon from '../theme/icons/button.svg';
export default class ButtonEditing extends FormElementEditing{
  
	constructor(editor){
		super(editor)
				
		this.command = 'insertButton'; 

		// names
		this.viewElementName = 'input';
		this.modelElementName = 'button';
		this.label = 'Button';
		this.fieldIcon = fieldIcon;
		// fields
		this.fields = formElements.button;
		
		//  attributes
		this.allowAttributes = ['type', 'name', 'value', 'class']
		this.defaultAttributes = {
			type:'button',
			class:'ck-field__button',
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
				name:'label',
				attributes: ['data-button']
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
				model: `${this.modelElementName}Box`,
				view: ( modelElement, { writer: viewWriter } ) => {
					return viewWriter.createContainerElement( 'label', {'data-button':'true'} );
				}
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'label', {'data-button':'true'} );
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
					if(attrs['buttonType'] == 'submit') {
						attrs['type'] = 'submit';
						delete attrs['buttonType'];
					}
					return viewWriter.createContainerElement( this.viewElementName, attrs );
			},
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
				model: `${this.modelElementName}Input`,
				view: ( modelElement, { writer: viewWriter } ) => {
            			let attrs= this.defaultAttributes || {};  
						modelElement._attrs.forEach((value,key)=> attrs[key] = value);
						if(attrs['type'] == 'submit'){
							attrs['type'] ='button';
							attrs['buttonType'] = 'submit';
						}
						return viewWriter.createContainerElement( this.viewElementName, attrs);						
					}
		});
	}
}