require('bootstrap');
const fs = require('fs');
const dialog = require('electron').remote.dialog;

// Load serialport module
const serialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js');
window.Chart = require('./js/Chart');
window.chartColor = ['#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8', '#6c757d', '#007bff', '#17a2b8', '#343a40'];

var ANGLE_INDEX = 24;
var MAX_DATASET_LENGTH = 30;
const G = 9.80665;
const PI = 3.1415926535;
var gArr = [], canvasObj = [];

$(function () {
    $('button#toggle-logging').click(function () {
        if ($('button#toggle-logging').text() === "Stop Log")
            $('button#toggle-logging').text('Start Log');
        else
            $('button#toggle-logging').text('Stop Log');
    });

    $('button#clear-logging').click(function () {
        $('textarea#log').val('');
    });

    $('button#toggle-record').click(function () {
        if (typeof sp === "undefined" ||
            typeof parser === "undefined" ||
            sp === null ||
            parser === null) {
            $('#errorModal').modal('show');
            return;
        }

        if ($('button#toggle-record').text() === "Record")
            $('button#toggle-record').text('Stop');
        else
            $('button#toggle-record').text('Record');
    });

    $('button#draw-graph').click(function () {
        var selectArr = $('select#select-data').val();
        if (selectArr.length <= 0) return;

        gArr.push(selectArr);

        var graphObj = $(`<div class="col-sm-12">
        <canvas id="graph-${gArr.length - 1}" style="width:100%;height:140px"></canvas>
        </div>`);

        $('div.serial-graph').append(graphObj.clone());
        var chartObj = new Chart($(`canvas#graph-${gArr.length - 1}`), {
            type: 'line',
            data: [],
            options: {
                animation: {
                    duration: 0
                },
                responsive: true,
                title: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        display: false,
                        scaleLabel: {
                            display: false,
                        }
                    }]
                },
                elements: {
                    line: {
                        tension: 0
                    }
                },
                hover: {
                    animationDuration: 0
                },
                responsiveAnimationDuration: 0
            }
        });

        canvasObj.push(chartObj);
        // console.log(gArr, canvasObj);
    });

    $('button#clear-graph-last').click(function () {
        gArr.pop();
        canvasObj.pop();
        $('div.serial-graph').children().last().remove();
        // console.log(gArr, canvasObj);
    });

    $('button#clear-graph').click(function () {
        gArr = [];
        canvasObj = [];
        $('div.serial-graph').children().remove();
        $('select#select-data').children().remove();
        // console.log(gArr, canvasObj);
    });

    $('button#apply-value').click(function () {
        if ($('div#serial-graph').text() === "") {
            MAX_DATASET_LENGTH = $('input#maxdataset').val();
            ANGLE_INDEX = $('input#angleindex').val();
        }
    });
});