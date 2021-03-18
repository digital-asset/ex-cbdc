# **WARNING!**

The documentation below is deprecated. It is out of date and not maintained.

<hr>

**NOTE:** Read the first three sections to understand what is going on...

## Basic info

If you connect to a host, look at `~/docker/data/shared` and the name of the jwt file there to know which party is hosted here.

See this for **port layout** (Navigator, etc.) and further command info:
https://github.com/DACH-NY/canton/tree/master/community/app/src/pack/deployment/docker#docker-compose-connect-setup

## Deployment suggestions

Use `screen` ("detachable terminal"):
- `screen -S someName` to start a new detachable terminal
- Ctrl + a, Ctrl + d to detach a terminal
- `screen -r someName` to attach/continue the terminal with name someName
- `screen -list` to show available screen terminals (detached/attached)

## Commands for deployment

All these need to be executed.

(Note `restart.sh` to quickly restart participants and remove their database.)

Starting the runner (init + market setup, handling resets):
```
# if you use it remotely, modify get*.sh to use internal IPs:
# HOSTS="10...."
./cantonRunner.sh ~/.ssh/google_compute_engine
```

Starting the Autosettle Trigger:
```
# ~/docker/data
./utils/trigger_upload_dar.sh dars/testing-1.0.0.dar
./utils/trigger_start.sh dars/testing-1.0.0.dar "BankB" Testing.Triggers.AutoSettle:autoSettleTrigger
```

## Useful commands

Copy dar (needs restart):
```
scp -i ~/.ssh/google_compute_engine testing/.daml/dist/testing-1.0.0.dar canton@$HOST:docker/data/dars/
```

SSH into hosts:
```
ssh -i ~/.ssh/google_compute_engine canton@$HOST
```

Upload dar manually:
```
sudo ../docker/bin/node-console.sh
remoteParticipant1.dars.upload("data/dars/testing-1.0.0.dar")
```
or you can use
```
daml ledger upload-dar
```

Reset:
```
docker-compose down -v
docker-compose up -d
```

Putting together the "runner kit" locally in the repo (scripts needed to run the init/market-setup/reset loop):
```
tar -cvf runScriptsRemotely.tar getIPsFromCantonDeployment.sh getPartiesFromCantonDeployment.sh transformParties.py generateParticipantConfig.py cantonRunner.sh testing/.daml/dist/testing-1.0.0.dar
```
Copy the "runner kit" with the following:
```
scp -i ~/.ssh/google_compute_engine runScriptsRemotely.tar  canton@$HOST:docker/
```
Use the following to extract the "runner kit":
```
tar -xf runScriptsRemotely.tar
```

See which triggers are running:
```
curl -X GET localhost:4002/v1/list     -H "Content-type: application/json" -H "Accept: application/json" -d '{"party": "DemoAdmin::018be7e822f4d73f27f18738b4385aba8f63b7399838f82d522e83431e1e4e0f48"}'
```

Stop a trigger:
```
curl -X DELETE http://... -H "Content-type: application/json" -H "Accept: application/json"
```
