import logo from './logo.svg';
import './App.css';
import React from 'react';
import FileSaver, { saveAs } from 'file-saver';
import JSZip from 'jszip';

function App() {

  const [raw, setRaw] = React.useState([])

  const handleInput = (e) => {

    let temp = []

    const files = e.target.files;
    Object.keys(files).forEach(i => {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        temp.push([file.name,reader.result])
      }
      reader.readAsText(file);
    })

    setRaw(temp)
  }

  function spliceSplit(str, index, count, add) {
    var ar = str.split('');
    ar.splice(index, count, add);
    return ar.join('');
  }

  const getFull = (key, str) => {

    let full = str.substring(str.indexOf(key), str.indexOf(' ' || '/', str.indexOf(key)))


    return (full)

  }

  const getValue = (key, str) => {
    let words = getFull(key, str)

    let value = words.substring(words.indexOf(`"`) + 1, words.lastIndexOf(`"`))

    return (Number(value))
  }

  const getValIndex = (key, str) => {
    let keyIndex = str.indexOf(key)
    let words = getFull(key, str)
    let tempValIndex = words.indexOf(`"`)

    return (keyIndex + tempValIndex + 1)
  }


  const getCalibrationInfo = () => {


    const stpx = 0
    const stpz = 0.286
    const stpy = 0.0587

    console.log(raw)

    let pxw = "positionreferencex="
    let pyw = "positionreferencey="
    let pzw = "positionreferencez="
    let sxw = 'XFromDoubleWheelM='
    let syw = 'YAboveTrackAxisM='
    let szw = 'ZInPushingDirectionM='

    let zip = new JSZip();
    let edited = zip.folder("edited")

    for (let i in raw) {
      let currString = raw[i][1]
      let filename = raw[i][0]

      console.log(currString)


      let px = getValue(pxw, currString)
      let py = getValue(pyw, currString)
      let pz = getValue(pzw, currString)
      let sx = getValue(sxw, currString)
      let sy = getValue(syw, currString)
      let sz = getValue(szw, currString)

      console.log('Prism X : ', px, ' Prism Y : ', py, 'Prism Z : ', pz)
      console.log('Scanner X : ', sx, ' Scanner Y : ', sy, ' Scanner Z : ', sz)

      let newPx = (sx + stpx).toFixed(4)
      let newPy = (sy + stpy).toFixed(4)
      let newPz = (sz + stpz).toFixed(4)

      console.log(getValue(szw, currString))
      console.log(getValIndex(szw, currString), String(getValue(szw, currString)).length, currString.substring(getValIndex(szw, currString), getValIndex(szw, currString) + String(getValue(szw, currString)).length))
      
      let newFileX = spliceSplit(currString, getValIndex(pxw, currString), String(newPx).length, String(newPx))
      let newFileY = spliceSplit(newFileX, getValIndex(pyw, newFileX), String(newPy).length, String(newPy))
      let newFileZ = spliceSplit(newFileY, getValIndex(pzw, newFileY), String(newPz).length, String(newPz))

      let blob = new Blob([newFileZ], { type: "text/plain;charset=utf-8" })
      edited.file(filename, blob)

    }



    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "editedFiles.zip")
    })

  }

  return (

    <div>
      <div>Selected files to be changed : </div>
      <input type='file' multiple onChange={handleInput} />
      <div>{raw.length}</div>
      <div onClick={getCalibrationInfo}>Get Calibration info</div>
    </div>
  );
}

export default App;
