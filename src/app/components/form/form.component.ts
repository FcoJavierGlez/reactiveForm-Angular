import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  form!: FormGroup;

  constructor( private formBuilder: FormBuilder ) { }

  ngOnInit(): void {
    this.createForm();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.checkForm( this.form );
    if ( !this.form.valid ) return;
    console.log(this.form.value);
    this.resetForm();
  }

  private translateFieldName(fieldName: string) : string {
    switch (fieldName) {
      case 'name': return 'nombre';
      case 'email': return 'correo';
      case 'street': return 'calle';
      case (fieldName.match(/(zip|code)/i))?.input: return 'código postal';
      case 'city': return 'ciudad';
      case 'province': return 'provincia';
      case 'country': return 'país';
      default: return fieldName;
    }
  }

  getErrorMessage(field: string = ''): string {
    const error = this.form.get(field)?.errors;
    const fieldName = field.match(/(\w+)$/)?.[1] ||'';
    
    if (!error) return '';

    const errorName = Object.keys(error)[0];
    const ERROR_MESSAGE: any = {
      required: `El campo ${this.translateFieldName(fieldName)} es requerido`,
      email: `El correo no es válido`,
      minlength: `El campo ${this.translateFieldName(fieldName)} debe tener mínimo ${error?.minlength?.requiredLength} caracteres`,
      maxlength: `El campo ${this.translateFieldName(fieldName)} debe tener máximo ${error?.maxlength?.requiredLength} caracteres`,
      min: `El campo ${this.translateFieldName(fieldName)} debe valer como mínimo ${error?.min?.min}`,
      max: `El campo ${this.translateFieldName(fieldName)} debe valer como máximo ${error?.max?.max}`,
      pattern: `El campo ${this.translateFieldName(fieldName)} es incorrecto`,
      dni: `El campo ${this.translateFieldName(fieldName)} es incorrecto`
    }
    return ERROR_MESSAGE[errorName]
  }

  private isFieldValid(field: string): boolean | undefined {
    return this.form.get(field)?.valid;
  }
  private isFieldTouched(field: string): boolean | undefined {
    return this.form.get(field)?.touched;
  }

  displayFieldCss(field: string): any {
    return {
      'has-error': this.isFieldTouched(field) && !this.isFieldValid(field),
      'has-feedback': this.isFieldTouched(field) && this.isFieldValid(field)
    };
  }

  private checkForm(form: FormGroup): void {
    const controls = Object.keys(form.controls);

    controls.forEach( field => {
      const element = form.get(field);
      if ( element instanceof FormControl ) element.markAsTouched( { onlySelf: true } );
      else if ( element instanceof FormGroup ) this.checkForm( element );
    });
  }

  private validateDNI( control: AbstractControl ): { [key: string]: boolean } | null {
    const LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

    if (control.value == '') return null;

    try {
      let {numbers,letter} = control.value.match(/^(?<numbers>\d{8})(-|\s)?(?<letter>[A-Z])$/i)?.groups;
      return letter.toUpperCase() == LETTERS[ numbers % 23 ] ? null : { 'dni': true };
    } catch (error) {
      return { 'dni': true };
    }
    
  }

  resetForm(): void {
    this.form.reset();
  }

  private createForm(): void {
    this.form = this.formBuilder.group(
      {
        name: [ '', [Validators.required, Validators.minLength(5), Validators.maxLength(10)] ],
        email: [ '', [Validators.required, Validators.email] ],/* /^[^\W\_]\w+(\.[a-z]+)\@\w+\.\w{2,}$/ */
        dni: [ '', [Validators.required, this.validateDNI] ],
        address: this.formBuilder.group(
          {
            street: ['',[Validators.required]],
            street2: [''],
            zipCode: ['', [Validators.required]],
            city: ['', [Validators.required]],
            province: ['', [Validators.required]],
            country: ['', [Validators.required]],
          }
        )
      }
    );
  }

}
