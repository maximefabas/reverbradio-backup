const fcts = require('./functions');

const fs = require('fs')
const path = require('path')
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const templateDirPath = path.join(__dirname, 'template')
const outDirPath = path.join(__dirname, 'output')
const outDirData = path.join(outDirPath, 'data')
const outDirExists = fs.existsSync(outDirPath)

const dataDirPath = path.join(__dirname, 'data')
const dataFilePath = path.join(dataDirPath, 'data.json')
const dataDirExists = fs.existsSync(dataDirPath)
const dataFileExists = fs.existsSync(dataFilePath)



doTheJob();
// Main script
async function doTheJob () {

  await fcts.createOutputDir(outDirExists,templateDirPath,outDirPath,false,false,outDirData)

  // If no data file exists, load all pages and save data
  let jsonData
  if (!dataFileExists) {
    // Load all pages and gather data
    jsonData = await fcts.recursePages(0,0,[],true)

    // Save data file
    if (!dataDirExists) fs.mkdirSync(dataDirPath)
    const dataFileDest = path.join(dataDirPath, 'data.json')
    fs.writeFileSync(dataFileDest, JSON.stringify(jsonData))

  // If data file exists, load it
  } else {
    console.log('Loading data from ./data/data.json...')
    const dataFile = fs.readFileSync(dataFilePath, 'utf-8')
    jsonData = JSON.parse(dataFile)
  }

  // Log all artists + Songs
  const jsonDataWithLocalFiles = await fcts.listFiles(jsonData,{entities:entities})
  fcts.writeJson(jsonDataWithLocalFiles,{path:path,outDirPath:outDirData,fs:fs})
  
  console.log('Done. Your full log of songs is available in the ./output directory.')
  console.log('Time to go listen to reverb #35 (Including Tonetta - Drugs Drugs Drugs) ❤️')
}