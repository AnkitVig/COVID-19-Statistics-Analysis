import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { Country } from '../models/country';
import { Observable, throwError, BehaviorSubject } from 'rxjs';

HttpClient
@Injectable({
  providedIn: 'root'
})
export class GetdataService {

  constructor(private _http: HttpClient) { }
  private host = "https://api.coronastatistics.live";
    private news_host = "https://gnews.io/api/v3/search?q=Corona&token=6cdf506be857c09d619844c665f70ac5&max=4";
private messageEvent = new BehaviorSubject<any>({});
getCountryName = this.messageEvent.asObservable();

updateCountryName(value :any)
{
  this.messageEvent.next(value);
}



  getAll(type): Observable<Country>{
    return this._http.get<Country>(`${this.host}/countries?sort=${type}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getCountry(name): Observable<Country>{
    return this._http.get<Country>(`${this.host}/countries/${name}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getTimeline(){
    return this._http.get(`${this.host}/timeline`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
    getAllNews(){
    return this._http.get(`${this.news_host}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getTimelineCountry(country){
    return this._http.get(`${this.host}/timeline/${country}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }
  getTimelineGlobal(){
    return this._http.get(`${this.host}/timeline/global`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  handleError(error) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert("Please check your internet connection!.");
    return throwError(errorMessage);
 }
}
