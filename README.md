# socket.io-cSharp-client

socket.io (HTTP based, bidirectional connection)
client initiates connection to server (no need to open new ports in firewalls)
client tries forever to (re)connect to server in case of connection error
server authenticates client with a key
server adds every client to a different room to ensure seperate communication channels
client watches a directory for a new/existing files and uploads to server as it is created
server can send notifications to client
server can send powershell script + regex to client which then executes the script and sends regex(output) to server
All of the above happen asynchronously
Dependencies:
client: c#
    .NET 4.5
    SocketIoClientDotNet (NuGet)
    
server: node.js
    tail (npm)
    express (npm)
    socket.io (npm)
    log-timestamp (npm)
