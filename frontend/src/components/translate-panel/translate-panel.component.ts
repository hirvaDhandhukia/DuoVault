import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilKeyChanged, filter, map, retry, switchMap, tap, throwError } from 'rxjs';
import { RestClientService } from '../../services/rest-client.service';

@Component({
  selector: 'app-translate-panel',
  standalone: false,
  templateUrl: './translate-panel.component.html',
  styleUrl: './translate-panel.component.scss'
})
export class TranslatePanelComponent implements OnInit {
  form: UntypedFormGroup = new UntypedFormGroup({ 'input': new UntypedFormControl(), 'output': new UntypedFormControl() });

  constructor(private readonly _restClient: RestClientService){}
  ngOnInit() {
    this.form.valueChanges.pipe(
      debounceTime(1000),
      filter(val_=> !!val_.input),
      distinctUntilKeyChanged('input'),
      tap(console.log),
      switchMap((value_) => {
        return this._translate(value_['input']);
      })
    ).subscribe({
      next: (val_)=>{
        this.form.get('output')?.setValue(val_.translatedText)
      },
      error: console.log
    })
  }

  private _translate(text_:string) {
    return this._restClient.post<{ id: string } | { existingData: { id: string} }>(
      'process',
      {
        "text": text_
      }
    ).pipe(
      map(val_=>{
        if((<any>val_).existingData){
          return {id: (<any>val_).existingData.id as string}
        }
        return val_ as {id: string};
      }),
      switchMap(({ id }) => {
        return this._restClient.post(
          'get-translation',
          {
            id
          }
        ).pipe(
          retry({
            count: 3,
            delay: 1000,
            resetOnSuccess: true
          }),
          tap(console.log)
        );
      })
    );
  }
}
