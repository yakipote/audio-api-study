// プレフィックスが必要な場合を考慮して、getUserMediaはブラウザのバージョンごとに分ける

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

// 他の変数を定義する
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gain
const gainCheckBox = document.getElementById("gain");

function onChangeGain(e) {
  console.log("check");
  if(gainCheckBox.checked){
    gain.gain.value = 10;
    console.log("on");
  }else{
    gain.gain.value = 0;
    console.log("off");
  }
}


function LoadSample(actx, url) {
  return new Promise((resolv)=>{
    fetch(url).then((response)=>{
      return response.arrayBuffer();
    }).then((arraybuf)=>{
      return actx.decodeAudioData(arraybuf);
    }).then((buf)=>{
      resolv(buf);
    })
  });
}



if (navigator.getUserMedia) {
  console.log('getUserMedia supported.');
  navigator.getUserMedia (
    // 制約: このアプリで音声と映像を有効にする
    {
      audio: true,
      video: false
    }, function(stream) {
      // 成功時のcallback
      var video = document.querySelector('video');
      video.srcObject =  stream;
      video.onloadedmetadata = function(e) {
        video.play();
        video.muted = 'true';
        LoadSample(audioCtx, "./ir.wav").then(function (buf) {
          let source = audioCtx.createMediaStreamSource(stream);
          let convolver = audioCtx.createConvolver();
          convolver.buffer = buf;
          gain = audioCtx.createGain();
          gain.gain.value = 0;
          source.connect(convolver);
          convolver.connect(gain);
          // source.connect(convolver);
          // convolver.connect(gain)
          gain.connect(audioCtx.destination);
          source.connect(audioCtx.destination)
        })
      };
    },
    // エラー時のフィードバック
    function(err) {
      console.log('The following gUM error occured: ' + err);
    }
  );
} else {
  console.log('getUserMedia not supported on your browser!');
}
