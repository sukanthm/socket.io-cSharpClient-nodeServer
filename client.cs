using System;
using Quobject.SocketIoClientDotNet.Client;
using System.IO;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            string ip = "35.237.10.239";
            string watchPath = @"C:\Users\sukanthk\Downloads\outbox\";
            System.IO.Directory.CreateDirectory(watchPath);

            if (File.Exists(watchPath + @"client.cs.txt"))
                File.Delete(watchPath + @"client.cs.txt");
            File.Copy(@"C:\Users\sukanthk\source\repos\ConsoleApp1\ConsoleApp1\Program.cs", watchPath + @"client.cs.txt"); //latest client code to server

            int counter = 0;
            string authKey = "a1s2d3f4";

            Console.WriteLine("socket connecting...");

            IO.Options options = new IO.Options
            {
                AutoConnect = true,
                Reconnection = true,
                ReconnectionDelay = 1000,
                ReconnectionDelayMax = 5000,
                ReconnectionAttempts = int.MaxValue,
            };
            var socket = IO.Socket("http://"+ip+":3000", options);

            socket.On(Socket.EVENT_CONNECT, () =>
            {

            if (counter == 0) { Console.WriteLine("socket connected"); counter += 1; }
            else { Console.WriteLine("socket reconnected"); }

            socket.Emit("join", "{\"hostName\": \"" + System.Net.Dns.GetHostName() + "\", \"authKey\": \"" + authKey + "\"}");

            FileSystemWatcher watcher = new FileSystemWatcher
            {
                Path = watchPath,
                NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.CreationTime,
                Filter = "*"
            };
                watcher.Created += new FileSystemEventHandler(OnChanged);               

                void pushExistingFiles()
                {
                    string[] files = Directory.GetFiles(watchPath);
                    foreach (string file in files)
                    {
                        string fileName = file.Replace(watchPath, "");
                        Console.WriteLine("File : " + fileName + " found");
                        var byteArray = new byte[] { };
                        try
                        {
                            byteArray = File.ReadAllBytes(file);
                            //Console.WriteLine("sending "+ fileName + " to master...");
                            socket.Emit("fromClient", fileName, byteArray);
                            Console.WriteLine("sent " + fileName + " to master");
                        }
                        catch (Exception e)
                        {
                            //Console.WriteLine(e);
                            Console.WriteLine(fileName + " unreadable.. will try later");
                        }
                    }
                }

                watcher.EnableRaisingEvents = true;
                Task.Run(() => pushExistingFiles());

                void OnChanged(object source, FileSystemEventArgs e)
                {
                    Console.WriteLine("File : " + e.Name + " " + e.ChangeType);
                    var byteArray = new byte[] { };
                    try
                    {
                        byteArray = File.ReadAllBytes(e.FullPath);
                        //Console.WriteLine("sending " + e.Name + " to master...");
                        socket.Emit("fromClient", e.Name, byteArray);
                        Console.WriteLine("sent " + e.Name + " to master");
                    }
                    catch (Exception e2)
                    {
                        //Console.WriteLine(e2);
                        Console.WriteLine(e.Name + " unreadable.. trying again soon");
                    }
                    System.Threading.Thread.Sleep(5*1000);
                    pushExistingFiles();
                }
            });

            socket.On("fromServerAck", (data) =>
            {
                Console.WriteLine("From server file acknowledgement : " + data);
                string fileName = data.ToString().Replace(" received", "");
                File.Delete(watchPath+fileName);
                Console.WriteLine(fileName+" deleted");
            });

            socket.On("fromServer", (data) =>
            {
                Console.WriteLine("From server : " + data);
            });

            socket.On("fromServerPowershell", (data) =>
            {
                Console.WriteLine("Running script : " + data);

                Process cmd = new Process();
                cmd.StartInfo.FileName = "powershell.exe";
                cmd.StartInfo.RedirectStandardInput = true;
                cmd.StartInfo.RedirectStandardOutput = true;
                cmd.StartInfo.CreateNoWindow = false;
                cmd.StartInfo.UseShellExecute = false;
                cmd.Start();

                cmd.StandardInput.WriteLine(data);
                cmd.StandardInput.Flush();
                cmd.StandardInput.Close();
                //cmd.WaitForExit();

                socket.Emit("powershellOutput", cmd.StandardOutput.ReadToEnd());
                Console.WriteLine("script output sent to server");
            });


            socket.On(Socket.EVENT_DISCONNECT, () =>
            {
                Console.WriteLine("socket error, trying to reconnect...");
            });
            Console.ReadLine();
        }
    }
}
