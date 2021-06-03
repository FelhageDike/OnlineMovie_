var player;

        function onYouTubePlayerAPIReady() {
            player = new YT.Player('ytplayer', {
                height: '360',
                width: '640',
                videoId: 'M7lc1UVf-VE',
                events: {
                    onReady: prepareSocket,
                }
            });
        }

        document.getElementById("startBtn").addEventListener("click", function () {
            socket.send(JSON.stringify({
                message: "start"
            }));
        });
        document.getElementById("stopBtn").addEventListener("click", function () {
            socket.send(JSON.stringify({
               message: "stop"
            }));
        });
        console.log(location.host);
        const url = 'ws://localhost:8000';
        // location.host == 'localhost' ?
        //   'ws://localhost:8000' : location.host == 'javascript.local' ?
        //   `ws://javascript.local/article/websocket/chat/ws` : // интеграция для разработки с локальным сайтом
        //   `wss://javascript.info/article/websocket/chat/ws`; // боевая интеграция с javascript.info

        let socket;

        function prepareSocket() {
            function openSokcet() {
                socket = new WebSocket(url);
            }
            openSokcet();

            socket.onopen = function () {
                console.log("open socket");
            };
            socket.onmessage = function (event) {
                let incomingMessage = JSON.parse(event.data);
                switch (incomingMessage.message) {
                    case 'start':
                        player.playVideo();
                        break;
                    case 'stop':
                        player.stopVideo();
                        break;
                }
            };
        }