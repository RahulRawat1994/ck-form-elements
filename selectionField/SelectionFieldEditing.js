import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import SelectionCommand from './SelectionCommand';
import formElements from '../form_elements.json';
export default class SelectionFieldEditing extends Plugin {

	constructor(editor) {
		super(editor)

		this.command = 'insertSelectionField';
		// names
		
		this.modelElementName = 'selection';
		this.label = 'Selection Field';
		// fields
		this.fields = formElements.selectionField;
		//  attributes
		this.allowAttributes = ['name', 'class', 'size','multiple']
		this.defaultAttributes = {
			class: 'ck-field__selection',
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
			new SelectionCommand(
				this.editor,
				this.fields,
				this.modelElementName,
				this.modelLabel
			)
		);
	}

	/**
	 * @private
	 * Defaine schema 
	 */
	_defineSchema() {
		const schema = this.editor.model.schema;
		// Configure the schema.
		schema.register( `${this.modelElementName}Box`, {
			isObject: true,
			isInline: true,
			allowWhere: '$text',
			allowAttributes:[ ...this.allowAttributes]
		});
		schema.register( `${this.modelElementName}Input`, {
			isLimit: true,
			allowIn: `${this.modelElementName}Box`,
			allowContentOf: '$text',
			allowAttributes: [ 'value', 'selected']
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
	_defineConverters() {
		const conversion = this.editor.conversion;

		//  box converters
		conversion.for('upcast').elementToElement({
			view: 'select',
			model: (viewElement, { writer }) => {
				let attrs = {};
				viewElement._attrs.forEach((value, key) => attrs[key] = value);
				if (attrs.multiple == '') {
					attrs.multiple = true;
				} else if (attrs.multiple == undefined) {
					attrs.multiple = false;
				}
				return writer.createElement(`${this.modelElementName}Box`, attrs);
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: (modelElement, { writer: viewWriter }) => {
				
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				
				if (!attrs.multiple) {
					delete attrs.multiple;
				}
				return viewWriter.createContainerElement('select', attrs);
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				if (!attrs.multiple) {
					delete attrs.multiple;
				}
				let section;
				if(!attrs.size){
					delete attrs.size;
				}
				if(attrs.size && attrs.size > 1){
					section = viewWriter.createContainerElement('select', attrs);
				} else {
					section = viewWriter.createContainerElement('select1', attrs);
				}
				
				return toWidget(section, viewWriter,);
			}
		});


		// Input  converters
		conversion.for('upcast').elementToElement({
			view: 'option',
			model: (viewElement, { writer }) => {
				let attrs = {};
				viewElement._attrs.forEach((value, key) => attrs[key] = value);
                
				const text = viewElement.getChild(0) ? viewElement.getChild(0).data : '';
				const textNode = writer.createText(text.trim());
                attrs['value'] = text;
				const element = writer.createElement(`${this.modelElementName}Input`, attrs);
				writer.append(textNode, element)
				return element;
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: `${this.modelElementName}Input`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				return viewWriter.createContainerElement('option', attrs);
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}Input`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = { };

				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				let section;
				const size = modelElement.parent.getAttribute('size');
				
				
				if(size && size > 1){
					section = viewWriter.createContainerElement('option', attrs);
				} else {
					const children = Array.from(modelElement.parent.getChildren())
					let params = { ...attrs};
					if( children && children.length){

						const checkSelected = children.find(c => c.getAttribute('selected'))
						const showValue = checkSelected ? checkSelected.getAttribute('value') : children[0].getAttribute('value')
						params = attrs['value'] == showValue ? { ...attrs} : {...attrs, class:'d-none'};
					}
					section = viewWriter.createContainerElement('span', params);
				}
				return section
			},
		});
	}
}

