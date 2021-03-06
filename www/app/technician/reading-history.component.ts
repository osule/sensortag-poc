import {Component, OnInit} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {Router} from 'angular2/router';

import {NavService} from '../nav.service';
import {ReadingService} from './reading.service';
import {SensorService} from '../sensor.service';
import {Reading} from './reading'
import {ChartComponent} from '../chart.component';

@Component({
    templateUrl: 'app/technician/reading-history.component.html',
    directives: [ChartComponent]
})
export class ReadingHistoryComponent implements OnInit {
    readings: Reading[];
    lastTenReadings: any = [];
    type: string;
    title: string;

    constructor(
        private _router: Router,
        private _routeParams: RouteParams,
        private _readingService: ReadingService,
        private _navService: NavService,
        private _sensorService: SensorService
    ) { }

    ngOnInit() {
        var policyNumber = this._routeParams.get('policyNumber');
        this.type = this._routeParams.get('type');

        this._navService.setBack(() => {
            this._router.navigate(['JobDetails', { policyNumber: policyNumber }]);
        });

        this.readings = this._readingService.getReadingsForPolicy(policyNumber);

        var readingsBySensor = {};

        if (this.type === "humidity") {
            this.title = "Humidity";
        } else if (this.type === "targetTemperature") {
            this.title = "Target Temperature"
        } else if (this.type === "ambientTemperature") {
            this.title = "Ambient Temperature"
        }

        for (let reading of this.readings) {
            for (let sensorData of reading.sensorData) {
                if (!readingsBySensor[sensorData.systemId]) {
                    readingsBySensor[sensorData.systemId] = {
                        label: this._sensorService.getSensor(sensorData.systemId).name,
                        data: []
                    };
                }
                let dataPoint = 0;
                if (this.type === "humidity") {
                    dataPoint = sensorData.data.humidityData.relativeHumidity;
                } else if (this.type === "targetTemperature") {
                    dataPoint = sensorData.data.temperatureData.targetTemperature;
                } else if (this.type === "ambientTemperature") {
                    dataPoint = sensorData.data.temperatureData.ambientTemperature;
                }

                readingsBySensor[sensorData.systemId].data.push({
                    x: new Date(reading.date),
                    y: dataPoint,
                    r: reading.isClient ? 2 : 1
                });
            }
        }

        var readingKeys = Object.keys(readingsBySensor);
        for (let key of readingKeys) {
            this.lastTenReadings.push(readingsBySensor[key]);
        }

    }

}