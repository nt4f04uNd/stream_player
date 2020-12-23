const MESSAGES = {
   PLAY: 'PLAY',
   PAUSE: 'PAUSE',
   SEEK: 'SEEK'
}

if (typeof global !== 'undefined')
   global.MESSAGES = MESSAGES;