$(function () {
    $('button#serial-connect').click(function () {
        // If there is exist connection, close that connection.
        if ($('button#serial-connect').text() === "Disconnect") {
            logOnScreen('log', 'Disconnection request accepted.');

            if (typeof sp === "undefined" ||
                typeof parser === "undefined") {
                $('#errorModal').modal('show');
                return;
            }

            try {
                parser.destroy();
                sp.pause();
                sp.close();
            } catch(e) {}

            parser = null; sp = null;

            $('input#serialport').removeAttr("disabled");
            $('input#baudrate').removeAttr("disabled");
            $('select#databits').removeAttr("disabled");
            $('select#parity').removeAttr("disabled");
            $('select#stopbits').removeAttr("disabled");
            $('input#delimiter').removeAttr("disabled");
            $('button#serial-connect').text("Connect");

            return;
        }

        // Verify COM port, and baudrate, parity, stopbits.
        // There is no support for flow control. :)
        // 
        // @typedef {object} openoptions
        // @property {boolean} [autoopen=true] automatically opens the port on `nexttick`.
        // @property {number=} [baudrate=9600] the baud rate of the port to be opened. this should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. custom rates are supported best effort per platform. the device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
        // @property {number} [databits=8] must be one of these: 8, 7, 6, or 5.
        // @property {number} [stopbits=1] must be one of these: 1 or 2.
        // @property {string} [parity=none] must be one of these: 'none', 'even', 'mark', 'odd', 'space'.

        var comPort = $('input#serialport').val();
        var baudRate = Number($('input#baudrate').val());
        var dataBits = Number($('select#databits').val());
        var parity = $('select#parity').val();
        var stopBits = Number($('select#stopbits').val());
        var delimiter = $('input#delimiter').val();

        // console.log(typeof comPort, typeof baudRate, typeof dataBits, typeof parity, typeof stopBits);

        if (typeof comPort !== "string" ||
            typeof baudRate !== "number" ||
            typeof dataBits !== "number" ||
            typeof parity !== "string" ||
            typeof stopBits !== "number" ||
            typeof delimiter !== "string") {
            $('#errorModal').modal('show');
            return;
        }

        // Initialize serialport with preset baudrate.
        sp = new serialPort(comPort, {
            autoopen: true,
            baudRate: baudRate,
            databits: dataBits,
            parity: parity,
            stopbits: stopBits
        });

        delimiter = delimiter.split('\\r').join('\r').split('\\n').join('\n');

        // Parse incoming data line-by-line from serial port.
        parser = sp.pipe(new Readline({
            'delimiter': delimiter,
        }));
        parser.on('data', functionQueue);

        $('input#serialport').attr("disabled", "disabled");
        $('input#baudrate').attr("disabled", "disabled");
        $('select#databits').attr("disabled", "disabled");
        $('select#parity').attr("disabled", "disabled");
        $('select#stopbits').attr("disabled", "disabled");
        $('input#delimiter').attr("disabled", "disabled");
        $('button#serial-connect').text("Disconnect");

        function functionQueue(rawText) {
            logOnScreen('debug', rawText);
            updateDataSelection(rawText);
            drawGraph(rawText);
            recordFile(rawText);
        }
    });

    // Log in Textarea
    function logOnScreen(type, obj) {
        var uptime = process.uptime().toFixed(3);
        var uType = type.toUpperCase();

        if ($('button#toggle-logging').text() === "Stop Log") {
            $('textarea#log').val($('textarea#log').val() + "\r\n" + `[${uptime}:${uType}] ${JSON.parse(JSON.stringify(obj))}`);
            document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight;
        }

        if (type === "error")
            console.error(`[${uptime}:${uType}] ${JSON.parse(JSON.stringify(obj))}`);
        else if (type === "warn")
            console.warn(`[${uptime}:${uTtype}] ${JSON.parse(JSON.stringify(obj))}`);
        else if (type === "info")
            console.info(`[${uptime}:${uType}] ${JSON.parse(JSON.stringify(obj))}`);
        // else if (type==="debug")
        //   console.debug(`[${uptime}:${uType}] ${JSON.parse(JSON.stringify(obj))}`);
        // else
        //   console.log(`[${uptime}:${uType}] ${JSON.parse(JSON.stringify(obj))}`);

    }

    // Transform hex string to integer, or decimal to integer
    // This function supports following types of data
    // [0.1 0.2 0.3 0.4] or [0.1, 0.2, 0.3, 0.4] or 00 1A 2B 3C 2D (in hex)
    function transformStrToInt(rawText) {
        var arrData, tfData = [];

        if (rawText.indexOf(',') === -1) {
            arrData = rawText.replace('[', '').replace(']', '').split(' ');
        } else {
            arrData = rawText.replace('[', '').replace(']', '').split(',');
        }

        $.each(arrData, function(idx, val) {
            // '1A' is not a number
            if (isNaN(Number(val))) {
                // so, we parse it to hexadecimal
                if (isNaN(parseInt(val, 16))) {
                    for(i = 0; i < rawText.length; i++) {
                        if (rawText.charCodeAt(i) > 65500) {
                            tfData.push(0);
                        } else {
                            tfData.push(rawText.charCodeAt(i));
                        }
                    }
                } else {
                    tfData.push(parseInt(val, 16));
                }
            } else {
                // otherwise, we parse it to decimal float
                tfData.push(Number(val));
            }
        });

        return tfData;
    }

    // Display value changes on multiselect.
    function updateDataSelection(rawText) {
        var arrData = transformStrToInt(rawText);
        // var selectData = $('select#select-data');
        var optionData = $('select#select-data > option');
        var optionObj = $('<option></option>');
        var reOptionData;
        var length = (arrData.length > optionData.length) ? arrData.length : arrData.length;

        for (i = 0; i < length; i++) {
            if (typeof arrData[i] === "undefined") {
                logOnScreen("warn", "Number of serial data decreased.");
                $(optionData[i]).remove();
            } else if (typeof optionData[i] === "undefined") {
                if (i === ANGLE_INDEX)
                    $('select#select-data').append(optionObj.clone().attr('value', i).text(`${i+1} - ${arrData[i]} (Angle)`));
                else
                    $('select#select-data').append(optionObj.clone().attr('value', i).text(`${i+1} - ${arrData[i]}`));
            } else {
                if (i === ANGLE_INDEX)
                    $(optionData[i]).attr('value', i).text(`${i+1} - ${arrData[i]} (Angle)`);
                else
                    $(optionData[i]).attr('value', i).text(`${i+1} - ${arrData[i]}`);
            }
        }
    }

    // Draw graph on screen by setting.
    function drawGraph(rawText) {
        var rawArr = transformStrToInt(rawText);
        $.each(gArr, function (idx, val) {
            var chart = canvasObj[idx];
            // console.log(chart);

            $.each(val, function (i, v) {
                if (Number(v) === ANGLE_INDEX) {
                    var radian = (Number(rawArr[v]) - Number($('input#encoderdegree').val())) * PI / 180;
                    var torque = Number($('input#armlength').val()) * Number($('input#dumbbellweight').val()) * G * Math.sin(radian);

                    if (typeof chart.data.datasets[i] === "undefined") {
                        chart.data.datasets.push({
                            label: `Data-${Number(v)+1}`,
                            data: [torque],
                            fill: false,
                            backgroundColor: window.chartColor[Number(v) % window.chartColor.length],
                            borderColor: window.chartColor[Number(v) % window.chartColor.length]
                        });
                        chart.data.labels = [1];
                    } else {
                        if (chart.data.datasets[i].data.length > MAX_DATASET_LENGTH)
                            chart.data.datasets[i].data.shift();

                        chart.data.datasets[i].data.push(torque);
                    }
                } else {
                    if (typeof chart.data.datasets[i] === "undefined") {
                        chart.data.datasets.push({
                            label: `Dataset-${Number(v)+1}`,
                            data: [rawArr[v]],
                            fill: false,
                            backgroundColor: window.chartColor[Number(v) % window.chartColor.length],
                            borderColor: window.chartColor[Number(v) % window.chartColor.length]
                        });
                        chart.data.labels = [1];
                    } else {
                        if (chart.data.datasets[i].data.length > MAX_DATASET_LENGTH)
                            chart.data.datasets[i].data.shift();

                        chart.data.datasets[i].data.push(rawArr[v]);
                    }
                }

            });

            if (chart.data.labels.length <= MAX_DATASET_LENGTH)
                chart.data.labels.push(chart.data.labels.length + 1);

            chart.update();

            //console.log(chart.data.labels, chart.data.datasets);
        });
    }


    var record = [],
        startTime,
        dialogPromise;
    // If record option is On, save it to file.
    function recordFile(rawText) {
        if ($('button#toggle-record').text() === "Stop") {
            if (typeof savePath === 'undefined' || savePath === null) {
                savePath = "";
                dialog.showSaveDialog(null, {}, name => {
                    savePath = name;
                    if (typeof savePath === "undefined" ||
                        savePath === null ||
                        savePath === "") {
                        $('#errorModal').modal('show');
                        $('button#toggle-record').text('Record');
                        startTime = undefined;
                        savePath = null;
                        return;
                    }

                    wstream = fs.createWriteStream(savePath);
                    wstream.on('error', function (e) {
                        logOnScreen('error', e);
                        $('#errorModal').modal('show');
                        $('button#toggle-record').text('Record');
                        startTime = undefined;
                        savePath = null;
                        return;
                    });     
                });
            } else {
                if (fs.existsSync(savePath)) {
                    uptime = process.uptime().toFixed(3);
                    if (startTime === undefined) startTime = uptime;
                    uptime = (uptime - startTime) * 1000;

                    // [, ] appeared just one time.
                    saveText = rawText.replace('[', '').replace(']', '');
                    saveArr = transformStrToInt(rawText);

                    // Calculate Angle to Torque value.
                    var radian = (Number(saveArr[ANGLE_INDEX]) - Number($('input#encoderdegree').val())) * PI / 180;
                    var torque = Number($('input#armlength').val()) * Number($('input#dumbbellweight').val()) * G * Math.sin(radian);

                    if (ANGLE_INDEX + 1 < saveArr.length) {
                        saveArr[saveArr.length] = torque;
                    } else {
                        saveArr[ANGLE_INDEX + 1] = torque;
                    }
                    saveText = saveArr.join(', ');

                    wstream.write(`${uptime}, ${saveText}\r\n`);
                }
            }
        } else {
            try {
                startTime = undefined;
                savePath = null;
                wstream.end();
                wstream.destroy();
            } catch (e) {}
        }
    }

    // Reserved for future
    // function writeonSer(data){
    //     //Write the data to serial port.
    //     sp.write(data, function(err) {
    //         if (err) {
    //             return console.log('Error on write: ', err.message);
    //         }
    //         console.log('message written');
    //     });
    // }; 
});