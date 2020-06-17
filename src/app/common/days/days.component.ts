import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-days',
  templateUrl: './days.component.html',
  styleUrls: ['./days.component.scss']
})
export class DaysComponent implements OnInit {

  constructor() { }

  public timer: any;
  public oldDate = new Date(("2019-12-31"));

  ngOnInit(): void {
    setInterval(() => {
      this.timer = this.dhms(Math.floor((new Date().getTime() - this.oldDate.getTime())));
    }, 1000)
  }


  dhms(difference) {
    var days, hours, mins, secs;
    days = Math.floor(difference / (60 * 60 * 1000 * 24) * 1);
    hours = Math.floor((difference % (60 * 60 * 1000 * 24)) / (60 * 60 * 1000) * 1);
    mins = Math.floor(((difference % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) / (60 * 1000) * 1);
    secs = Math.floor((((difference % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) % (60 * 1000)) / 1000 * 1);

    return {
      days: days,
      hours: hours,
      minutes: mins,
      seconds: secs
    };
  }

}
