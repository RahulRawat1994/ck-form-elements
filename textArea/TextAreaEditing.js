
import FormElementEditing from '../FormElementEditing';
import formElements from '../form_elements.json';
import fieldIcon from '../theme/icons/textarea.svg';
import TextAreaCommand from './TextAreaCommand.js';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export default class TextAreaEditing extends FormElementEditing {

	constructor(editor) {
		super(editor)

		this.command = 'insertTextArea';

		// names
		this.viewElementName = 'textarea';
		this.modelElementName = 'textArea';
		this.label = 'Text Area';
		this.fieldIcon = fieldIcon;
		// fields
		this.fields = formElements.textArea;

		//  attributes
		this.allowAttributes = ['name', 'rows', 'cols', 'class']
		this.defaultAttributes = {
			class: 'ck-field__textarea',
		};
	}

    init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			this.command,
			new TextAreaCommand(this.editor, this.fields, this.modelElementName, this.modelLabel)
		);
	}

	/**
	 * @private
	 * Define converter for model to view, view to model
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		//   converters
		conversion.for('upcast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: 'span'
		});
		conversion.for('dataDowncast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: 'span'
		});
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: (modelElement, { writer: viewWriter }) => {
				const section = viewWriter.createContainerElement('label');
				return toWidget(section, viewWriter,);
			}
		});

		//  Input converters
		conversion.for('upcast').elementToElement({
			view: this.viewElementName,
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
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => {
					if (key !== 'value')
						attrs[key] = value
				});
				return viewWriter.createContainerElement(this.viewElementName, attrs);
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}Input`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => {
					if (key !== 'value')
						attrs[key] = value
				});
                return viewWriter.createContainerElement(this.viewElementName, attrs);
			},
		});

	}
}