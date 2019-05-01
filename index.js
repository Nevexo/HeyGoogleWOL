// HeyGoogleWoL by Nevexo.
// Wake a Wake-on-LAN capable device via Google Assistant.

const version = "1.0"

// Configuration file
const config = require("./config.json")
// Logging module
const winston = require("winston")
// API Module
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
app.use(bodyParser.json())
// Wake-on-LAN module
const wol = require("wol")

class Devices {
    constructor() {
        this.devices = config.devices
    }

    checkDeviceExists(device) {
        if (this.devices[device] == undefined) {
            return false
        }else {
            return true
        }
    }

    bootDevice(device) {
        return new Promise((resolve, reject) => {
            wol.wake(this.devices[device]["mac_address"], 
            
            {
                "address": config.network["broadcast_ip"],
                "port": config.network["wol_port"]
            },

            (err, res) => {
                if (err) {
                    logger.error(err)
                    reject();
                }else {
                    if (res == true) {
                        logger.info(`[WoL] Successfully sent boot request to ${device}`)
                        resolve();
                    }else {
                        logger.debug(res)
                        logger.info("[WoL] Failed to send boot request. Enable debugging for more information.")
                    }
                }
            })
        })
    }
}

devices = new Devices()

// Set up logging
const logger = winston.createLogger({
    "level": config.logging_level,
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console()
    ]
})

logger.info(`Welcome to HeyGoogleWoL, V ${version}. Please wait a moment.`)

app.post(`${config["advanced"]["api_prefix"]}/boot`, (req, res) => {
    // Handler for boot POST requests
    // Check if the valid body has been sent
    if (req.body["device"] == undefined) {
        // Missing device from body.
        res.sendStatus(400)
        return;
    }

    if (!config["advanced"]["return_state"]) {
        // Return state is disabled (probably for IFTTT), return 204 instantly.
        res.sendStatus(204) // OK, no content.
    }
    
    // Check if the device exists:
    if (devices.checkDeviceExists(req.body["device"])) {
        // Device exists, wake it
        logger.info(`[API] Request to wake ${req.body["device"]}`)

        // Wake up device
        devices.bootDevice(req.body["device"]).then(() => {
            if (config["advanced"]["return_state"]) {
                res.sendStatus(204) // Okay, no content.
            }
        }).catch(() => {
            if (config["advanced"]["return_state"]) {
                res.sendStatus(500) // Server error.
            }
        })

    }else {
        logger.debug(`[API] Request to wake ${req.body["device"]} but that device doesn't exist.`)
        // Device doesn't exist.
        if (config["advanced"]["return_state"]) {
            res.sendStatus(400)
        }
    }
})

app.listen(config.server.bind_port, config.server.bind_address, (error) => {
    if (error == undefined) {
        logger.info(`[API] Started listening on ${config.server.bind_address}:${config.server.bind_port}`)
    }else {
        logger.error(error)
    }
})