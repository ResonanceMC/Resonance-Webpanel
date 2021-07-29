class SoundMeterProcessor extends AudioWorkletProcessor {
  slow = 0.0;

  process(inputs) {
    const input = inputs[0];
    let instant = 0;
    input.forEach(channel => {
      let i;
      let sum = 0.0;
      for (i = 0; i < channel.length; ++i) {
        sum += channel[i] * channel[i];
      }
      instant += Math.sqrt(sum / channel.length);
    });
    instant /= 2;
    this.slow = 0.98 * this.slow + 0.02 * instant;
    this.port.postMessage(this.slow);
    return true;
  }
}

registerProcessor("sound-meter-processor", SoundMeterProcessor);
