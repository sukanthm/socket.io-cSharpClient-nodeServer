# socket.io-cSharp-client

socket.io (HTTPS based, secure bidirectional connection)<br />
client initiates connection to server (no need to allow new protocols/ports in firewalls)<br />
client tries forever to (re)connect to server in case of connection error<br />
server authenticates client with a key<br />
server adds every client to a different room to ensure seperate communication channels<br />
client watches a directory for a new/existing files and uploads to server as it is created<br />
server can send notifications to client<br />
server can send powershell script + regex to client which then executes the script and sends regex(output) to server<br />
All of the above happen asynchronously<br /><br /><br />

Dependencies:<br />
client: C#: .NET 4.5, SocketIoClientDotNet (NuGet)<br />
server: Node.js: tail (npm), express (npm), socket.io (npm), log-timestamp (npm)
