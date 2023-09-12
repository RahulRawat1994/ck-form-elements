import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import ElementCommand from './ElementCommand.js';

export default class FormElementEditing extends Plugin{
  
	/**
	 * @inheritDoc
	 */
	init() {

		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 
      this.command, 
      new ElementCommand( this.editor, this.fields, this.modelElementName, this.modelLabel ) 
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
				allowAttributes: [ ...this.allowAttributes, 'class' ]
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
					return writer.createElement( `${this.modelElementName}Input`,attrs );
				}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: `${this.modelElementName}Input`,
			view: ( modelElement, { writer: viewWriter } ) => {
					let attrs= this.defaultAttributes || {};
					modelElement._attrs.forEach((value,key)=> attrs[key] = value);
					const section = viewWriter.createContainerElement( this.viewElementName, attrs );
					return toWidget( section, viewWriter, );
			},
		});
		conversion.for( 'editingDowncast' ).elementToElement( {
				model: `${this.modelElementName}Input`,
				view: ( modelElement, { writer: viewWriter } ) => {
            let attrs= this.defaultAttributes || {};          					
						modelElement._attrs.forEach((value,key)=> attrs[key] = value);
						const section = viewWriter.createContainerElement( 'block', attrs );
						return toWidget( section, viewWriter, );
				}
		});
	}
}

