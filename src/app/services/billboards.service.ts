import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { billboardsData } from '../models/billboards.model';
import { waysData } from '../models/ways-location.model';

@Injectable({
  providedIn: 'root'
})
export class BillboardsService {

  private url = "http://localhost:3000"

  constructor(private http: HttpClient) { }

  getAirportBillboard() {
    return this.http.get<billboardsData[]>(this.url + "/airport")
  }

  getBlocksBillboards() {
    return this.http.get<billboardsData[]>(this.url + "/blocksAirport") 
  }

  getMilitaryBillboards() {
    return this.http.get<billboardsData[]>(this.url + "/militarybase")
  }

  getCivilianBillboards() {
    return this.http.get<billboardsData[]>(this.url + "/civilhome" )
  }

  getEnemiesBillboards() {
    return this.http.get<billboardsData[]>(this.url + "/deniedArea")
  }

  getWaysBillboards() {
    return this.http.get<waysData[]>(this.url + "/ways")
  }
}
