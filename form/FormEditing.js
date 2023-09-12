import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import FormCommand from './FormCommand';
import formElements from '../form_elements.json';

export default class FormEditing extends Plugin {

	constructor(editor) {
		super(editor)

		this.command = 'insertForm';
		// names
		this.viewElementName = 'form';
		this.modelElementName = 'Form';
		this.label = 'Form';

		//Form Fields
		this.fields = formElements.form;
	}

    init() {
        this._defineSchema();
        this._defineConverters();
        this.editor.commands.add(
            this.command, 
            new FormCommand( this.editor, this.fields,this.modelElementName ) 
        );
    }

    _defineSchema(){
        const schema = this.editor.model.schema;

        schema.register( `${this.modelElementName}Box`, {
            // Behaves like a self-contained object (e.g. an image).
            isObject: true,

            // Allow in places where other blocks are allowed (e.g. directly in the root).
            allowWhere: '$block',
            allowAttributes: ['action', 'name', 'id', 'class', 'encoding','target','method']
        } );


        schema.register( `${this.modelElementName}Area`, {
            // Cannot be split or left by the caret.
            isLimit: true,

            allowIn: `${this.modelElementName}Box`,

            // Allow content which is allowed in the root (e.g. paragraphs).
            allowContentOf: '$root'
        } );

        schema.addChildCheck( ( context, childDefinition ) => {
            if ( context.endsWith( `${this.modelElementName}Area` ) 
                && childDefinition.name == `${this.modelElementName}Box` ) {
                return false;
            }
        } );
    }

    _defineConverters(){
        const conversion = this.editor.conversion;

        // converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'form',
                classes: 'ck-form-layout'
            },
            model: (viewElement, { writer }) => {
				let attrs = {};
				viewElement._attrs.forEach((value, key) => attrs[key] = value);
				return writer.createElement(`${this.modelElementName}Box`, attrs);
			}
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model:`${this.modelElementName}Box`,
            view: (modelElement, { writer: viewWriter }) => {
				let attrs = { class : 'ck-form-layout'};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				
				return viewWriter.createContainerElement('form', attrs);
                
			},
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model:`${this.modelElementName}Box`,
            view: (modelElement, { writer: viewWriter }) => {
				let attrs = { class : 'ck-form-layout'};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
    
				const section = viewWriter.createContainerElement('section', attrs);
				return toWidget(section, viewWriter,);
			},
        } );
        // element
        conversion.for( 'upcast' ).elementToElement( {
            model: `${this.modelElementName}Area`,
            view: {
                name: 'div',
                classes: 'ck-form-elememts'
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: `${this.modelElementName}Area`,
            
            view: ( modelElement, { writer: viewWriter } ) => {
                const div = viewWriter.createEditableElement( 'div', { class: 'ck-form-elements' } );
                return toWidgetEditable( div, viewWriter );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: `${this.modelElementName}Area`,
            view: ( modelElement, { writer: viewWriter } ) => {
                const div = viewWriter.createEditableElement( 'div', { class: 'ck-form-elements' } );
                return toWidgetEditable( div, viewWriter );
            }
        } );
    }

}
