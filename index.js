const fcts = require('./functions');

const fs = require('fs')
const path = require('path')

const templateDirPath = path.join(__dirname, 'template')
const outDirPath = path.join(__dirname, 'output')
const outDirCoversPath = path.join(outDirPath, 'covers')
const outDirAudiosPath = path.join(outDirPath, 'audio')
const outDirExists = fs.existsSync(outDirPath)

const dataDirPath = path.join(__dirname, 'data')
const dataFilePath = path.join(dataDirPath, 'data.json')
const dataDirExists = fs.existsSync(dataDirPath)
const dataFileExists = fs.existsSync(dataFilePath)

const startSavingAt = Number(process.argv[2])

doTheJob();

// Main script
async function doTheJob () {

  await fcts.createOutputDir(outDirExists,templateDirPath,outDirPath,outDirCoversPath,outDirAudiosPath)

  // If no data file exists, load all pages and save data
  let jsonData
  if (!dataFileExists) {
    // Load all pages and gather data
    console.log('Start loading pages:\n')
    jsonData = await fcts.recursePages(0,0,[],false)
    console.log(`Gathered data about ${jsonData.length} playlists.\n`)

    // Save data file
    if (!dataDirExists) fs.mkdirSync(dataDirPath)
    const dataFileDest = path.join(dataDirPath, 'data.json')
    fs.writeFileSync(dataFileDest, JSON.stringify(jsonData))

  // If data file exists, load it
  } else {
    console.log('Loading data from ./data/data.json...')
    const dataFile = fs.readFileSync(dataFilePath, 'utf-8')
    jsonData = JSON.parse(dataFile)
    console.log('Done.\n')
  }

  // Save audio files and covers
  console.log(`Gonna download cover images and audio files for ${jsonData.length} playlists.\n`)
  const jsonDataWithLocalFiles = await fcts.saveFiles(jsonData,{outDirCoversPath:outDirCoversPath,outDirAudiosPath:outDirAudiosPath,startSavingAt:startSavingAt});
  console.log('Done.\n')

  // Fill HTML template
  console.log('Filling output template...\n')
  await fcts.fillTemplate(jsonDataWithLocalFiles,{outDirPath:outDirPath})
  console.log('Done. Your backup is located in the ./output directory.')
  console.log('Time to go listen to reverb #11 ❤️')
  console.log('Buh bye James.\n')
}
