import {Component, OnInit, Inject, ElementRef} from 'angular2/core';

import {SensorService} from '../sensor.service';
import {JobService} from '../technician/job.service';
import {ReadingService} from '../technician/reading.service';
import {NavService} from '../nav.service';

import {Reading} from '../technician/reading'
import {Sensor} from '../sensor';
import {SensorFactory} from '../sensor.factory';
import {Job} from '../technician/job';
import {SensorComponent} from '../sensor.component';
import {ScanComponent} from '../scan.component';

@Component({
    templateUrl: 'app/client/account-details.component.html',
    directives: [SensorComponent, ScanComponent]
})
export class AccountDetailsComponent implements OnInit {
    connectedAddresses: any[];
    sensors: Sensor[];
    private readings: Reading[];
    job: Job;
    status: string;
    private modalElement: any;
    private allSensorsConnected: boolean;

    constructor(
        private _sensorService: SensorService,
        private _jobService: JobService,
        private _navService: NavService,
        private _readingService: ReadingService,
        private _elementRef: ElementRef,
        private _sensorFactory: SensorFactory
        @Inject('jQuery') private _jquery,
        @Inject('Foundation') private _foundation
    ) { }

    ngOnInit() {
        this.modalElement = this._jquery(this._elementRef.nativeElement.children[0]);
        new this._foundation.Reveal(this.modalElement, { closeOnClick: false });
        this.connectedAddresses = [];
        this.sensors = [];
        this.readings = [];
        this._navService.setTitle("My Sensors");

        // If client sensors have not been loaded, ask the user for their policy
        // number so you can load the sensors.
        if (this._sensorService.clientSensors.length === 0) {
            this.modalElement.foundation('open');
        } else {
            this.sensors = this._sensorService.getClientSensors();
            var job = this._jobService.getJob(this.sensors[0].policyNumber);

            if (job === undefined) {
                this.status = "ERROR";
            } else {
                this.job = job;
                for (let sensor of this.sensors) {
                    this.connectedAddresses.push(sensor.systemId);
                }
                this.loadReadings();
            }
        }

    }

    loadReadings() {
        this.readings = this._readingService.getReadingsForPolicy(this.job.policyNumber);
    }

    findAccount(policyNumber: string) {
        var job = this._jobService.getJob(policyNumber);

        if (job === undefined) {
            this.status = "ERROR";
        } else {
            this.job = job;
            this.loadSensors();
            this.loadReadings();
        }
    }

    loadSensors() {
        var self = this;
        let savedSensors = this._sensorService.getSensorsForPolicy(this.job.policyNumber);
        for (let savedSensor of savedSensors) {
            var sensor = this._sensorFactory.sensor(this.job.policyNumber);
            sensor.setName(savedSensor.name);

            sensor.setSystemId(savedSensor.systemId);
            this.sensors.push(sensor);
        }
        this.modalElement.foundation('close');

        if (this.sensors.length === 0) {
            this.status = "No Sensors on Account";
        }
    }


    connectionCompleteHandler($event) {
        this.allSensorsConnected = $event.allSensorsConnected;
        if (this.allSensorsConnected) {
            this._sensorService.setClientSensors(this.sensors);
        }
    }


    cancel() {
        this.modalElement.foundation('close');
        window.history.back();
    }

}