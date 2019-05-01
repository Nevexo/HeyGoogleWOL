> Note: This project isn't modular at all and probably won't meet any standards, it's just a fun experiment.
# HeyGoogleWOL
A personal project to Wake-on-LAN devices on my network via Google Assistant.

The main idea of this script is to wake up desktop or (wired) laptop computers with a simple

`hey google, wake up <device>`

## Setup

This script is fairly easy to setup, but it's a bit hacky.
First, you'll need a server running 24/7 that is on your primary network & is able to send WoL packets to your computer. It can run
any OS that supports Node.JS.

The following instructions show setting up on a common Linux machine (Ubuntu 18)

### Clone the repo

`git clone https://github.com/nevexo/heygooglewol`

This will download a copy of this repo to your server.

### Install the dependencies

`npm install`

This will download the Winston logging tool and wol, a wake-on-lan wrapper.
if this fails, you'll need to install nodeJS. Search for `nodejs download <OS>`

### Write the configuration file

`cp config.json.example config.json`

Now edit that config file and set `broadcast_ip` to the broadcast IP of your network, 
for ease of use I've configured this to the most common RFC1918 IP, 192.168.255.255. 

If you're not sure what this is, just leave it alone.

Next set your devices, simply set the name in place of `desktop` and set the MAC address of
the NIC in your computer. 

> NOTE: Your must enable Wake-on-LAN in both your BIOS/UEFI and operating system.

> NOTE: This only works on wired connections. 

> NOTE: Google Assistant will return capital letters for 'PC', so account for that in your config.

If you're unsure why something isn't working, set logging mode to 'debug' and check the config.
There's a chance your requests are coming through with capital letters, or your network is configured incorrectly.

### Setup Forever/PM2

Node scripts can run standalone, but you'll watch a daemon to keep an eye on it & start it up automatically.
For this, I suggest using forever.

`npm install -g forever`

Then open your crontab `crontab -e`, and enter 

`@reboot /usr/bin/forever start <Location of heygooglewol>/index.js`

This will make HeyGoogleWol start at system boot.

### Configure port forwarding & DDNS.

This program runs as an API inside of your network, thus it must be port-forwarded so that IFTTT
can communicate with it.

As literally everyone has a different router/firewall, you'll have to find out how to do this yourself.

With IPv4 being the mess that it is, you probably have a dynamic IP (i.e it changes from time-to-time)
this will mean the program will stop working. I suggest using a service such as duckdns or No-IP to create a dynamically
updating domain name for your house. You'll have to do some research into this yourself.

### Configure IFTTT

IFTTT is an easy-to-use smart home automation harness. It features Google Assistant integration and webhooks.

First, make an IFTTT account and connect it with your Google Assistant. Follow an IFTTT guide on doing this.

Now create a new applet with Google Assistant, select 'Say a phrase with a text ingredient'

In 'What do you say?' enter something alone the lines of 'Wake up $', I've used:

- 'wake up $'
- 'power up $'
- 'start $'

Enter whatever you want in the response box, I've entered 'Sent boot up request to $'

Now select 'Create trigger' and set the 'then that' to make a web request (webhook).

In here enter `http://<your IP / DDNS domain>:8080/wol/boot` set the method to `POST`,
content-type to `application/json` and body to:

`{"device": "textField"}`

[Here's an image example.](https://imgur.com/a/2LaL3K8 )

### Test it!

Start up your server & ask Google to wake up a device.

## Docker?

Maybe, but this tool requires low-level access to your network (broadcasts are usually kept on Docker networking)
so it may not work, I'll see.