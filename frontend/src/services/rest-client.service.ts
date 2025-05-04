import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestClientService {

  private readonly _url: string = 'http://3.239.75.151:3000';

  constructor(private readonly _httpClient: HttpClient) { }

  public post<T>(endpoint: string, body: {}): Observable<T> {
    return this._httpClient.post<T>(`${this._url}/${endpoint}`, body);
  }
}
