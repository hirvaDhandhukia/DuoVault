import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  standalone: false,
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss'
})
export class TextAreaComponent {
  @Input() placeholder = '';
  @Input() side: 'input' | 'output' = 'input';
  @Input() form!: UntypedFormGroup;
  text = '';

  constructor(){}



}
