// A working player, recording what the service asks of it.
const log = { created: 0, plays: 0, pauses: 0, removes: 0, seeks: 0, loop: null, volume: null };
class Player {
  constructor() { log.created += 1; this._loop = false; this._volume = 1; }
  set loop(v) { this._loop = v; log.loop = v; }
  get loop() { return this._loop; }
  set volume(v) { this._volume = v; log.volume = v; }
  get volume() { return this._volume; }
  play() { log.plays += 1; }
  pause() { log.pauses += 1; }
  remove() { log.removes += 1; }
  seekTo() { log.seeks += 1; return Promise.resolve(); }
}
module.exports = { __log: log, createAudioPlayer: () => new Player() };
