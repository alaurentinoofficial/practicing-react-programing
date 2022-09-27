const { fromEvent, Error: BaconError, combineAsArray, fromPromise, once, mergeAll } = Bacon;
const URL = "";

/* lógica principal */
const buildBussinessLogicStream = (expInput, valInput) => {
  //fromEvent(expInput, "change")
}

const buildEnterExitStreams = (cell, expInput, valInput) => {
  mergeAll(
    fromEvent(cell, "click").map(_ => 1),
    fromEvent(expInput, "blur").map(_ => 2)
  ).onValue(opt => {
    if (opt === 1) {
      [valInput.hidden, expInput.hidden] = [true, false];
      expInput.focus();
    } else {
      [valInput.hidden, expInput.hidden] = [false, true];
    }
  })

  fromEvent(expInput, "keydown")
    .filter(evt => evt.key == "Enter" || evt.keyCode === 13)
    .map(evt => evt.target.value)
    .diff("", (prevVal, currVal) => prevVal != currVal) //todas as células começam com string vazias
    .onValue(isDifferent => {
      if (isDifferent) { //apenas emite se de fato houve mudança
        expInput.dispatchEvent(new Event("change"));
      }
      expInput.blur();
    });
}