import Command from '@ckeditor/ckeditor5-core/src/command';

export default class CheckboxCommand extends Command{

  constructor(editor, fields, modelElementName){
    super(editor)
    this.fields = fields;
    this.modelElementName = modelElementName;
  }

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), `${this.modelElementName}` );
		this.isEnabled = allowedIn !== null;
		
		const element = selection.getSelectedElement();
		// set value
		let values = {};
		if(element && element.name.includes(this.modelElementName)){
			this.fields && Object.keys(this.fields)
			.map(key =>{
				values[key] =element? element.getAttribute(key) : '';
			})
		}
		this.value = values;
	} 

	execute( formdata ) {
		this.editor.model.change( writer => {
			const divElement = writer.createElement( `${this.modelElementName}`, {...formdata});
			// Insert the content in the current selection location.
			this.editor.model.insertContent( divElement, this.editor.model.document.selection );
		});
	}
}