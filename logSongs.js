const {recursePages,listFiles,writeJson} = require('./functions');

const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')

const templateDirPath = path.join(__dirname, 'template')
const outDirPath = path.join(__dirname, 'output')
const outDirDataPath = path.join(outDirPath, 'data')
const outDirExists = fs.existsSync(outDirPath)

const dataDirPath = path.join(__dirname, 'data')
const dataFilePath = path.join(dataDirPath, 'data.json')
const dataDirExists = fs.existsSync(dataDirPath)
const dataFileExists = fs.existsSync(dataFilePath)



doTheJob();
// Main script
async function doTheJob () {

  console.log('Start creating a backup of https://reverberationradio.com.\n')

  // Create output directory if needed
  if (!outDirExists) {
    console.log('Creating output directory...')
    try { await fsExtra.copy(templateDirPath, outDirPath) } catch (e) {
      console.log(`Error: ${e.message}\n`)
      process.exit(1)
    }
    if(outDirCoversPath){fs.mkdirSync(outDirCoversPath)}
    if(outDirAudiosPath){fs.mkdirSync(outDirAudiosPath)}
    
    console.log('Done.\n')
  }
  
  if(outDirDataPath && !fs.existsSync(outDirDataPath)){fs.mkdirSync(outDirDataPath)}

  // If no data file exists, load all pages and save data
  let jsonData
  if (!dataFileExists) {
    // Load all pages and gather data
    jsonData = await recursePages(0,0,[],true)

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
  const jsonDataWithLocalFiles = await listFiles(jsonData)
  writeJson(jsonDataWithLocalFiles,outDirDataPath)
  
  console.log('Done. Your full log of songs is available in the ./output directory.')
  console.log('Time to go listen to reverb #35 (Including Tonetta - Drugs Drugs Drugs) ❤️')
}