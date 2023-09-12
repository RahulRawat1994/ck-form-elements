
import FormElementEditing from '../FormElementEditing';
import formElements from '../form_elements.json';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import fieldIcon from '../theme/icons/hiddenfield.svg';
import hiddenEditorIcon from '../theme/icons/hiddenFieldUI.svg';

export default class HiddenFieldEditing extends FormElementEditing {

	constructor(editor) {
		super(editor)

		this.command = 'insertHiddenField';
		this.viewElementName = 'input';
		this.modelElementName = 'hiddenField';
		this.label = 'Hidden Field';
		this.fieldIcon = fieldIcon;
		this.fields = formElements.hiddenField;
		this.allowAttributes = ['type', 'name', 'value', 'class']
		this.defaultAttributes = {
			type: 'hidden',
			class: 'ck-field__hidden',
		};
	}
	
	_defineConverters() {
		const conversion = this.editor.conversion;

		// HiddenFieldBox  converters
		conversion.for('upcast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: {
				name: 'label',
				attributes: ['data-hidden']
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: (modelElement, { writer: viewWriter }) => {
				return viewWriter.createContainerElement('label', {'data-hidden':'true'});
			}
		});
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}Box`,
			view: (modelElement, { writer: viewWriter }) => {
				const section = viewWriter.createContainerElement('label', {'data-hidden':'true'});
				return toWidget(section, viewWriter,);
			}
		});

		// HiddenField Input converters
		conversion.for('upcast').elementToElement({
			view: this.viewElementName,
			model: (viewElement, { writer }) => {
				let attrs = {};
				viewElement._attrs.forEach((value, key) => attrs[key] = value);
				return writer.createElement(`${this.modelElementName}Input`, attrs);
			}
		});
		conversion.for('dataDowncast').elementToElement({
			model: `${this.modelElementName}Input`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				delete attrs['src']
				delete attrs['width']
				delete attrs['height']
				return viewWriter.createContainerElement(this.viewElementName, attrs);
			},
		});
		conversion.for('editingDowncast').elementToElement({
			model: `${this.modelElementName}Input`,
			view: (modelElement, { writer: viewWriter }) => {
				let attrs = this.defaultAttributes || {};
				modelElement._attrs.forEach((value, key) => attrs[key] = value);
				attrs['src'] = hiddenEditorIcon
				attrs['width'] = '25px'
				attrs['height'] = '25px'
				const section = viewWriter.createContainerElement('img', attrs);
				return toWidget(section, viewWriter,);
			}
		});
	}
}

