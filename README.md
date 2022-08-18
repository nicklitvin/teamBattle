# TeamBattle

A team game where each team controls a ship that can sink others. Last
ship to stay afloat wins.

# Project State

Complete: Game fundamentals, server functionality

Currently designing and testing game visuals.

# Setup

install all packages (Typescript, Jest, Socket.io, Express, and more)

``` 
npm install 
```

# More Info

TS files are located in /src 

TS files are compiled to JS and stored in /srcJS

Client files are located in /srcJS/client (not compiled from TS)

Test files are located in /tests

All tests are run with the following command:
```
npm test
```

## CommonJS vs ECMAScript conflict

Due to the reliance on CommonJS for server-side imports (express and
socket.io), typescript is compiled to CommonJS as specified in the
tsconfig.json file. 

Files that are required by the client in the browser cannot use 
"require" a commonJS term but rather "import" a ECMASript term.

For now, files that need to be used by the server and client are 
manually translated to ECMAScript from ./src/clientModules to
./srcJS/client/modules until an automated solution can be found.


