let url = document.URL;
if (url.includes('//')) {
    url = url.split('//')[1];
}
if (url[url.length - 1] === '/') {
    url = url.slice(0, -1);
}
const client = new WebSocket(`ws://${url}:3000`, 'echo-protocol');
client.onerror = function () {
    console.log('Connection Error');
};
client.onopen = function () {
    console.log('WebSocket Client Connected');
};
client.onclose = function () {
    console.log('WebSocket Client Closed');
};
client.onmessage = function (e) {
    console.log(`Message: ${e.data}`);
    const data = JSON.parse(e.data);
    switch (data.type) {
        case MESSAGES.PLAY:
            video.play();
        case MESSAGES.SEEK:
            video.currentTime = data.position;
            break;
        case MESSAGES.PAUSE:
            video.pause();
            break;
    }
};
