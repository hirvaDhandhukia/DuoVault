import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { TranslateModeComponent } from '../components/translate-mode/translate-mode.component';
import { TranslatePanelComponent } from '../components/translate-panel/translate-panel.component';
import { LanguageSelectorComponent } from '../components/language-selector/language-selector.component';
import { TextAreaComponent } from '../components/text-area/text-area.component';
import { HistoryComponent } from '../components/history/history.component';
import { SavedComponent } from '../components/saved/saved.component';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // For [(ngModel)]
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    TranslateModeComponent,
    TranslatePanelComponent,
    LanguageSelectorComponent,
    TextAreaComponent,
    HistoryComponent,
    SavedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    CommonModule,
    FormsModule, // IMPORTANT for [(ngModel)]
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent],
  exports: [
    NavbarComponent,
    TranslatePanelComponent,
  ]
})
export class AppModule { }
