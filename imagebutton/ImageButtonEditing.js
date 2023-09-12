import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import FormElementEditing from '../FormElementEditing';
import formElements from '../form_elements.json';
import fieldIcon from '../theme/icons/imagebutton.svg';
import ImageBUttonCommand from './ImageButtonCommand';
export default class ImageButtonEditing extends FormElementEditing{
  
	constructor(editor){
		super(editor)
				
		this.command = 'imageButton';
		// names
		this.viewElementName = 'input';
		this.modelElementName = 'imagebutton';
		this.label = 'Image Button';
		this.fieldIcon = fieldIcon;
		// fields
		this.fields = formElements.imageButton;
		//  attributes
		this.allowAttributes = ['name', 'class', 'src','alt','id','dir','lang','longdesc','title','style','type']
		this.defaultAttributes = {
			class:'ck-field__imagebutton',
			type:'image'
		}
	}

	/**
	 * @inheritDoc
	 */
	init() {

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 
			this.command, 
			new ImageBUttonCommand( this.editor, this.fields, this.modelElementName, this.modelLabel ) 
		);
	}

	/**
	 * @private
	 * Defaine schema 
	 */
	_defineSchema(){
		const schema = this.editor.model.schema;
		// Configure the schema.
		schema.register( `${this.modelElementName}Box`, {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			
		});
		schema.register( `${this.modelElementName}Input`, {
			isLimit: true,
			allowIn: `${this.modelElementName}Box`,
			allowContentOf: '$text',
			allowAttributes: [ ...this.allowAttributes]
		} );
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( `${this.modelElementName}Input` ) && childDefinition.name == `${this.modelElementName}Box` ) {
					return false;
			}
		});
	}

	/**
	 * @private
	 * Define converter for model to view, view to model
	 */
	_defineConverters(){
		const conversion = this.editor.conversion;

    	// Box  converters
		conversion.for( 'upcast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: 'label'
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: 'label'
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: `${this.modelElementName}Box`,
			view: ( modelElement, { writer: viewWriter } ) => {
				const section = viewWriter.createContainerElement( 'label' );
				return toWidget( section, viewWriter, );
			}
		});

		//  Input converters
		conversion.for( 'upcast' ).elementToElement( {
			view: this.viewElementName,
			model: ( viewElement, { writer } ) => {
				let attrs= {};
				viewElement._attrs.forEach((value,key)=> attrs[key] = value);
				const styles = viewElement.getStyle();
				if(styles){
					attrs.style = viewElement.getStyleNames().map(key =>{
						if(key === 'margin'){
							return `margin-top:${key.top};margin-bottom:${key.bottom};margin-left:${key.left};margin-right:${key.right};`
						}
						return `${key}: ${styles[key]}`
					}).join(';');
				}
				return writer.createElement( `${this.modelElementName}Input`,attrs );
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: `${this.modelElementName}Input`,
			view: ( modelElement, { writer: viewWriter } ) => {
				let attrs= {...this.defaultAttributes} || {};
				modelElement._attrs.forEach((value,key)=> {
					if(key === 'class'){
						attrs[key] = modelElement._attrs.get(key) 
						? `ck-field__imagebutton ${modelElement._attrs.get(key)}`
						: 'ck-field__imagebutton';
					}
					else if(modelElement._attrs.get(key)){
						attrs[key] = value
					}
						
				});
				return viewWriter.createContainerElement( this.viewElementName, attrs );
			},
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: `${this.modelElementName}Input`,
			view: ( modelElement, { writer: viewWriter } ) => {
            let attrs= {...this.defaultAttributes} || {};          					
				modelElement._attrs.forEach((value,key)=> {
					if(modelElement._attrs.get(key))
						attrs[key] = value
				});
				const section = viewWriter.createContainerElement( 'img', attrs );
				return toWidget( section, viewWriter, );
			}
		});
	}
}