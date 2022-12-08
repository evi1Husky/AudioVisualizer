
class SoundGenerator {
  static #audioContext = null;
  static #source = null;
  static #sound = null;
  static #gainNode = null;
  static analyserNode = null;
  static #destination = null;

  static init() {
    this.#audioContext = 
      new (window.AudioContext || window.webkitAudioContext)();
    this.#source = new Audio('mixkit-chill-choir-glitchy-suspense-687.wav')
    this.#sound = this.#audioContext.createMediaElementSource(this.#source)
    this.#gainNode = this.#audioContext.createGain();
    this.analyserNode = this.#audioContext.createAnalyser();
    this.#destination = this.#audioContext.destination;
  
    this.#gainNode.gain.value = 1;
    this.analyserNode.fftSize = 2048;
  
    this.#sound.connect(this.#gainNode);
    this.#gainNode.connect(this.#destination);
    this.#gainNode.connect(this.analyserNode);
  }

  static start() {
    this.init();
    this.#source.play();
  };

  static stop() {
    this.analyserNode = null;
    this.#audioContext.close();
  }
}

function oscilloscope() {
  const canvas = document.getElementById("oscilloscope");
  const canvasContext = canvas.getContext("2d");
  canvas.height = '230';
  canvas.width = '500';
  canvasContext.fillStyle = "#001300";
  canvasContext.strokeStyle = "#00ff04";
  canvasContext.lineWidth = 1.5;

  function drawLine() {
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.beginPath();
    canvasContext.moveTo(0, canvas.height / 2);
    canvasContext.lineTo(canvas.width, canvas.height / 2);
    canvasContext.stroke();
  }

  if(!SoundGenerator.analyserNode) {
    drawLine();
    return;
  }

  const bufferLength = SoundGenerator.analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if(!SoundGenerator.analyserNode) {
      drawLine();
      window.cancelAnimationFrame(draw);
      return;
    }

  requestAnimationFrame(draw);

  SoundGenerator.analyserNode.getByteTimeDomainData(dataArray);
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  canvasContext.beginPath();

  const sliceWidth = (canvas.width * 1.0) / bufferLength;
  let x = 0;
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;
    if (i === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }
    x += sliceWidth;
  }
  canvasContext.lineTo(canvas.width, canvas.height / 2);
  canvasContext.stroke();
  }

  draw();
}

const playButton = document.querySelector('.play-button');
const stopButton = document.querySelector('.stop-button');

playButton.addEventListener('click', () => {
  SoundGenerator.start();
  oscilloscope();
  playButton.style.display = 'none';
  stopButton.style.display = 'block';

});

stopButton.addEventListener("click", () => {
  SoundGenerator.stop();
  stopButton.style.display = 'none';
  playButton.style.display = 'block';
});

oscilloscope()