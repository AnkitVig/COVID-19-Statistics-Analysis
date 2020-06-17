import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  DoCheck,
  Output,
  EventEmitter
} from '@angular/core';
import COUNTRY_CODES from "../../common/countrydata/countries"
import { combineLatest } from 'rxjs';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

import {
  GetdataService
} from "./../../dataService/services/getdata.service";
import * as Fuse from 'fuse.js'
import {
  PerfectScrollbarComponent
} from 'ngx-perfect-scrollbar';
import {
  isUndefined
} from 'util';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { trigger, transition, animate, style, state } from '@angular/animations'
import { TranslateService } from '@ngx-translate/core';
//am4core.useTheme(am4themes_dataviz);
am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-mainPage',
  templateUrl: './mainPage.component.html',
  styleUrls: ['./mainPage.component.scss'],
  animations: [
    trigger('fadeInOutAnimation', [
      state('in', style({opacity: 1})),
      transition(':enter', [
        style({opacity: 0}),
        animate(600 )
      ])
    ])
  ]
})
export class MainPageComponent implements OnInit, OnDestroy, DoCheck {
  @ViewChild(PerfectScrollbarComponent) public directiveScroll: PerfectScrollbarComponent;
  @ViewChild('autoShownModal', { static: false }) autoShownModal: ModalDirective;
  isModalShown = false;
  public modalStep = 1;
  public translations: any = {};
  public fuse: any;
  public fuseResults: any[];
public edited :any;
  public timeLine: any;

  public caseData = [];
  public recoveriesData = [];
  public deathData = [];

  private pieChart: am4charts.PieChart;
  private mapChart: am4maps.MapChart;
  private lineChart: am4charts.XYChart;
  private radarChart: am4charts.RadarChart;
  public isLoading: boolean = true;
  public isLoadingMap: boolean = true;
  public isLoadingCountries: boolean = true;
public myVal : any;
  public totalCases;
  public totalDeaths;
  public totalRecoveries;
  public totalCritical;
  public todayCases;
  public todayDeaths;
  public activeCases;
  public casesPer1M;
  public finishedCases;
  public title1;
  public title2;
  public title3;
  public title4;
  public img1;
  public img2;
  public img3;
  public img4;
  public url1;
  public url2;
  public url3;
  public url4;
  public sortType = "todayCases";
  
  public countryCodes = COUNTRY_CODES;
  
  public countries: any = [];
  constructor(private zone: NgZone, private _getDataService: GetdataService, public translate: TranslateService) {
  }
  async ngDoCheck() {
   
  }
  @Output() messageEvent: EventEmitter<any> = new EventEmitter();
  
  myClick(ev:any)
  {this.edited = ev;
     
      this._getDataService.updateCountryName(ev);
  
  }
  calculateSum(index, array = this.countries) {
    var total = 0
    for (var i = 0, _len = array.length; i < _len; i++) {
      total += array[i][index]
    }
    return total
  }


  sortData(data, sortBy) {
    try {
      const sortProp = sortBy;
      data.sort((a, b) => {
        if (a[sortProp] < b[sortProp]) {
          return -1;
        } else if (a[sortProp] > b[sortProp]) {
          return 1;
        }
        return 0;
      })
    } catch (e) {
      console.error("ERROR while sorting", e);
      return data;
    }
    return data
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.pieChart) {
        this.pieChart.dispose();
      }
      if (this.mapChart) {
        this.mapChart.dispose();
      }
      if (this.lineChart) {
        this.lineChart.dispose();
      }
      if(this.radarChart){
        this.radarChart.dispose();
      }
    });
  }

  
  async ngOnInit() {
    await this.ngDoCheck();
    if(!localStorage.getItem("dontShow")){
      this.showModal();
    }
    this.zone.runOutsideAngular(async () => {
      combineLatest(
        this._getDataService.getAll(this.sortType),
        this._getDataService.getTimelineGlobal()
     )
     .subscribe(([getAllData, getTimelineData]) => {
       this.isLoading = false;
      this.isLoadingCountries = false;
      this.isLoadingMap = false;
      this.countries = getAllData;
      this.totalCases = this.calculateSum("cases");
      this.totalDeaths = this.calculateSum("deaths");
      this.totalRecoveries = this.calculateSum("recovered");
      this.totalCritical = this.calculateSum("critical");
      this.todayCases = this.calculateSum("todayCases");
      this.todayDeaths = this.calculateSum("todayDeaths");
      this.activeCases = this.calculateSum("active");
      this.casesPer1M = this.calculateSum("casesPerOneMillion");
      this.finishedCases = this.totalDeaths + this.totalRecoveries;
      this.fuse = new Fuse(this.countries, {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        minMatchCharLength: 1,
        keys: [
          "country"
        ]
      });
      this.timeLine = getTimelineData;
      this.loadLineChart(false);
    this.getNews();
      
     });
    });
  }

  searchCountries(key) {
    if (key) {
      this.countries = this.fuse.search(key);
      if (isUndefined(this.directiveScroll)) return;
      this.directiveScroll.directiveRef.scrollToTop()
      return
    }
    this.countries = this.fuse.list;
  }
  
  sortCountries(key, skey) {
    this.isLoadingCountries = true;
    this.sortType = key;
    this.loadSorted();
  }
  
  loadSorted(){
    this._getDataService.getAll(this.sortType).subscribe((data: {}) => {
      this.countries = data;
      this.isLoadingCountries = false;
    });
  }

getNews(){
    this._getDataService.getAllNews().subscribe((data: any) => {
      this.title1 = data.articles[0].title;
     this.title2 = data.articles[1].title;
     this.title3 = data.articles[2].title;
     this.title4 = data.articles[3].title;
     this.img1 = data.articles[0].image;
     this.img2 = data.articles[1].image;
     this.img3 = data.articles[2].image;
     this.img4 = data.articles[3].image;
     this.url1 = data.articles[0].url;
     this.url2 = data.articles[1].url;
     this.url3 = data.articles[2].url;
     this.url4 = data.articles[3].url;
    });
  }

  
  loadLineChart(chartType) {
    this.caseData = [];
    if (this.lineChart) {
      this.lineChart.dispose();
    }
    Object.keys(this.timeLine).forEach(key => {
      this.caseData.push({
        date: new Date(key),
        cases: this.timeLine[key].cases,
        recoveries: this.timeLine[key].recovered,
        deaths: this.timeLine[key].deaths
      });
    });
    this.caseData.push({
      date: new Date().getTime(),
      cases: this.totalCases,
      recoveries: this.totalRecoveries,
      deaths: this.totalDeaths
    });

    let chart = am4core.create("lineChart", am4charts.XYChart);
    chart.numberFormatter.numberFormat = "#a";
    chart.numberFormatter.bigNumberPrefixes = [
      { "number": 1e+3, "suffix": "K" },
      { "number": 1e+6, "suffix": "M" },
      { "number": 1e+9, "suffix": "B" }
    ];
    // Create axes
    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 50;
    
    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.logarithmic = chartType;
    valueAxis.renderer.labels.template.fill = am4core.color("#474747");
    dateAxis.renderer.labels.template.fill = am4core.color("#474747");

    chart = this.createSeriesLine(chart, "#ffdd00", "cases");
    chart = this.createSeriesLine(chart, "#4cc913", "recoveries");
    chart = this.createSeriesLine(chart, "#ff5b5b", "deaths");

    chart.data = this.caseData;

    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.fill = am4core.color("#474747");

    chart.cursor = new am4charts.XYCursor();
    this.lineChart = chart;
  }
  
 
  createSeriesLine(chart, color, type) {
    let name = type.charAt(0).toUpperCase() + type.slice(1);
    if(type=="cases"){
      name = this.translations.cases;
    } else if(type=="recoveries"){
      name = this.translations.recovered;
    } else if(type=="deaths"){
      name = this.translations.deaths;
    }
    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = type;
    series.fill = am4core.color(color);
    series.dataFields.dateX = "date";
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = "{valueY} " + name;
    series.tooltip.pointerOrientation = "vertical";

    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;

    series.stroke = am4core.color(color);
    series.legendSettings.labelText = name;
    series.tooltip.autoTextColor = false;
    series.tooltip.label.fill = am4core.color("#282e38");
    return chart
  }
      showModal(): void {
        this.modalStep = 1;
        this.isModalShown = true;
      }
     
      hideModal(): void {
        this.autoShownModal.hide();
      }
     
      onHidden(): void {
        this.isModalShown = false;
      }
      nextStep(){
        this.modalStep+=1;
      }
      close(dontShow){
        if(dontShow){
          localStorage.setItem("dontShow","true");
        }
        this.hideModal();
      }
  

 
}