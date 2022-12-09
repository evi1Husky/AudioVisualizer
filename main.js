
class SoundGenerator {
  constructor() {
    this.audioContext = 
      new (window.AudioContext || window.webkitAudioContext)();
    this.source = new Audio('mixkit-glitchy-sci-fi-bass-suspense-686.wav')
    this.sound = this.audioContext.createMediaElementSource(this.source) 
    this.gainNode = this.audioContext.createGain();
    this.analyserNode = this.audioContext.createAnalyser();
    this.destination = this.audioContext.destination;
    this.gainNode.gain.value = 1;
    this.analyserNode.fftSize = 2048;
    this.sound.connect(this.gainNode);
    this.gainNode.connect(this.destination);
    this.gainNode.connect(this.analyserNode);
  }

  start() {
    this.source.play();
  }

  stop() {
    this.source.pause();
    this.source.currentTime = 0;
  }
}

const sound = new SoundGenerator();

class Oscilloscope {
  constructor(analyserNode) {
    this.analyserNode = analyserNode;
    this.canvas = document.getElementById("oscilloscope");
    this.canvasContext = this.canvas.getContext("2d");
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.canvasContext.fillStyle = "#001300";
    this.canvasContext.strokeStyle = "#00ff04";
    this.canvasContext.lineWidth = 1.9;
    this.numberOfValues = this.analyserNode.frequencyBinCount;
    this.waveformData = new Uint8Array(this.numberOfValues);
    this.suspended = true;
  }

  idle() {
    this.suspended = true;
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(0, this.canvas.height / 2);
    this.canvasContext.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasContext.stroke();
  }

  start() {
    this.suspended = false;
    this.draw()
  }

  draw() {
    if (this.suspended) {
      window.cancelAnimationFrame(this.draw.bind(this));
      return;
    }
    window.requestAnimationFrame(this.draw.bind(this));
    this.analyserNode.getByteTimeDomainData(this.waveformData);
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);  
    this.canvasContext.beginPath();
    let x = 0;
    for (let i = 0; i < this.numberOfValues; i++) {
      const y = ((this.waveformData[i] / 128.0) * this.canvas.height) / 2;
      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += (this.canvas.width * 1.0) / this.numberOfValues;
    }
    this.canvasContext.lineTo(this.canvas.width, this.canvas.height / 2);
    this.canvasContext.stroke();
  }
}

const oscilloscope = new Oscilloscope(sound.analyserNode);

const playButton = document.querySelector('.play-button');
const stopButton = document.querySelector('.stop-button');

playButton.addEventListener('click', () => {
  sound.audioContext.resume()
  sound.start();
  oscilloscope.start()
  playButton.style.display = 'none';
  stopButton.style.display = 'block';
});

stopButton.addEventListener("click", () => {
  sound.stop();
  oscilloscope.idle()
  stopButton.style.display = 'none';
  playButton.style.display = 'block';
});

oscilloscope.idle();
