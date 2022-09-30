// import Bacon from "baconjs";

const { fromEvent, Error: BaconError, combineAsArray, fromPromise, once, mergeAll } = Bacon;
const URL = "";

const OPERATORS = {
  "ADD": items => items.reduce((x,y) => y+x, 0),
  "SUB": items => items.reduce((x,y) => y-x, 0),
  "MUL": items => items.reduce((x,y) => y*x),
  "DIV": items => items.reduce((x,y) => x/y),
}

var operatorsMatch = /^(ADD|SUB|MUL|DIV)\(((\s*[A-Z]\d\s*,)*(\s*[A-Z]\d\s*){1})\)$/g

/* lógica principal */
const buildBussinessLogicStream = (expInput, valInput) => {
  fromEvent(expInput, "change")
  .forEach(e => {
    let isOperationMatch = operatorsMatch.exec(e.target.value)

    if(isOperationMatch) {
      const [operator, items] = isOperationMatch.slice(1, 3)

      let targetExpInput = document.querySelectorAll(
        items
        .toLocaleUpperCase()
        .replaceAll(" ", "")
        .split(",")
        .map(v => `#${v}`))
      
      var streams =
        Array.from(targetExpInput)
        .map(input => {
          return fromEvent(input, 'change')
            .map((e) => e.target.value)
            .startWith(input.value)
        })
      
      combineAsArray(...streams).onValue((results) => {
        fetch(`/api/${operator}/${results.join(",")}`)
          .then((response) => response.json())
          .then(a => {
            valInput.value = a.result;
            valInput.dispatchEvent(new Event("change"))
          })
          .catch(e => {
            valInput.value = 'ERROR TO FETCH';
            valInput.dispatchEvent(new Event("change"))
          })
      });

      return
    }

    if(Number(expInput.value)) valInput.value = expInput.value
    else valInput.value = "ERROR"

    valInput.dispatchEvent(new Event("change"))
  })
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