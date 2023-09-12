
import FormElementEditing from '../FormElementEditing';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import formElements from '../form_elements.json';
import CheckboxCommand from './CheckboxCommand';
import checkedIcon from '../theme/icons/checkbox.svg';
import uncheckedIcon from '../theme/icons/checkbox-unchecked.svg';
export default class CheckboxEditing extends FormElementEditing {

	constructor(editor) {
		super(editor)

		this.command = 'insertCheckbox';

		// names
		this.viewElementName = 'input';
		this.modelElementName = 'checkbox';
		this.label = 'Checkbox';

		//Form Fields
		this.fields = formElements.checkbox;

		//  Attributes
		this.allowAttributes = ['type', 'name', 'value', 'class', 'checked']
		this.defaultAttributes = {
			type: 'checkbox',
			class: 'ck-field__checkbox',
			'data-checkbox': "true"
		};
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add(
			this.command,
			new CheckboxCommand(this.editor, this.fields, this.modelElementName)
		);
	}

	/**
	   * @private
	   * Defaine checkbox schema 
	   */
	_defineSchema() {
		const schema = this.editor.model.schema;
		// Configure the schema.
		schema.register(`${this.modelElementName}`, {
			isObject: true,
			isInline: true,
			allowAttributesOf: '$text',
			allowWhere: '$text',
			allowAttributes: [...this.allowAttributes]
		});
	}

	/**
	 * @private
	 * Define converter for model to view, view to model
	 */
	_defineConverters() {
		const conversion = this.editor.conversion;

		// upcast (view to model)
		conversion.for('upcast').elementToElement({
			view: {
				name: this.viewElementName,
				attributes: ['data-checkbox']
			},
			model: (viewElement, { writer }) => {
				let attrs = {};
				viewElement._attrs.forEach((value, key) => attrs[key] = value);
				if (attrs.checked == '') {
					attrs.checked = true;
				} else if (attrs.checked == undefined) {
					attrs.checked = false;
				}
				return writer.createElement(this.modelElementName, attrs);
			}
		});

		// dataDowncast (model to view)
		conversion.for('dataDowncast').elementToElement({
			model: this.modelElementName,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				if (!attrs.checked) {
					delete attrs.checked;
				}
				delete attrs['src'];
				return viewWriter.createContainerElement(this.viewElementName, attrs);
			},
		});

		// Editing Downcast (modal to view)
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				if (!attrs.checked) {
					delete attrs.checked;
					attrs['src'] = uncheckedIcon;
				} else {
					attrs['src'] = checkedIcon;
				}
				const section = viewWriter.createContainerElement('img', attrs);
				return toWidget(section, viewWriter,);
			},
		});

	}
}
