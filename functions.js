const fs = require('fs')
const path = require('path')
const request = require('request-promise')
const progress = require('request-progress')
const cheerio = require('cheerio')
const queryString = require('query-string')
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const recursePages = async (page = 0, attempt = 0, data = []) => {
  console.log(`Page ${page}, attempt ${attempt + 1}...`)

  // Load page
  const pageUrl = `https://reverberationradio.com/page/${page + 1}`
  let pageHtml
  try { pageHtml = await request(pageUrl) } catch (e) {
    // If load fails, try again until the 10th try
    if (attempt < 9) {
      console.error(`Failure: ${e.message}.`)
      console.log('Trying again.\n')
      return recursePages(page, attempt + 1, [...data])

    // If load fails for the 10th time, exit
    } else {
      console.error(`Failure on last attempt: ${e.message}.`)
      console.log('Exiting now.\n')
      return process.exit(1)
    }
  }

  // Extract html data
  const $ = cheerio.load(pageHtml)
  const $posts = $('.post .audio')

  // If no posts in page, consider the job done
  if (!$posts.length) {
    console.log('No posts on this page. Considering the end reached.\n')
    return data
  }

  // Gather data from each post
  $posts.each((i, post) => {
    const coverFileUrl = $(post).find('.album_art img').attr('src')
    const rawAudioFileUrl = $(post).find('.audio_player iframe').attr('src')
    const text = $(post).find('p').html()
    const title = $(post).find('.timestamp a').attr('href').split('/').slice(-2).join('-')
    const rawAudioFileUrlQuery = queryString.parse(rawAudioFileUrl)
    const audioFileUrl = Object.keys(rawAudioFileUrlQuery).map(key => {
      return key.match(/^https:\/\/reverberationradio.com/)
        ? rawAudioFileUrlQuery[key]
        : false
    }).filter(e => e)[0]
    data.push({
      coverFileUrl,
      rawAudioFileUrl,
      audioFileUrl,
      text,
      title
    })
  })
  console.log(`Found ${$posts.length} playlists.\n`)
  // Load next page
  return recursePages(page + 1, 0, [...data])
}

const saveFiles = async (data,outDirCoversPath,outDirAudiosPath,startSavingAt) => {
  const dataWithLocalFiles = data.map(playlist => {
    if (playlist.audioFileUrl === 'http://goo.gl/zt1ce') playlist.audioFileUrl = 'https://s3.amazonaws.com/ReverberationRadio/Reverberation43.mp3'
    else if (playlist.audioFileUrl === 'http://goo.gl/CGiav') playlist.audioFileUrl = 'https://s3.amazonaws.com/ReverberationRadio/Reverberation%E2%9D%84%E2%98%83.mp3'
    const coverExt = playlist.coverFileUrl.split('.').slice(-1)[0]
    const audioExt = playlist.audioFileUrl.split('.').slice(-1)[0]
    const coverDest = path.join(outDirCoversPath, `${playlist.title}.${coverExt}`)
    const audioDest = path.join(outDirAudiosPath, `${playlist.title}.${audioExt}`)
    return {
      ...playlist,
      coverDest,
      audioDest
    }
  })

  let playlistsCnt = 0
  if (startSavingAt > 1) {
    console.log(`You said you wanted to skip the ${startSavingAt - 1} first playlists.`)
    console.log(`Thus, start saving on playlist ${startSavingAt}.\n`)
    playlistsCnt = startSavingAt - 1
  }

  for (const playlist of dataWithLocalFiles.slice(playlistsCnt)) {
    playlistsCnt++
    console.log(`Downloading files for playlist ${playlistsCnt} of ${data.length}...`)
    await recurseDwnFile(playlist.coverFileUrl, playlist.coverDest,0)
    await recurseDwnFile(playlist.audioFileUrl, playlist.audioDest,0)
  }

  return dataWithLocalFiles
}

const listFiles = async (data) => {
  let playlist = [];
  for(let i = 0; i< data.length; i++){
    if(data[i].text){
      let text = data[i].text+"<end>"
      text = entities.decode(text);
      text = text.replace(/<a(.+?)a>|<strong(.+?)strong>|<span(.+?)span>|<b(.+?)b>|<\/a>|<\/strong>|<\/span>|<\/b>|<br>/g,'');
      text = text.replace(/[^1.]*/,'<start>');
      text = text.replace(/([1-9][0-9]?\.)/g,'<end><start>');
      text = text.replace(/<start><end>/g,'');
      text = text.match(/(<start>).*?(<end>)/g)

      if(text){
        for(let j = 0; j<text.length; j++){
          
          text[j] = text[j].replace(/(\s-\s)|(\s–\s)/g,'<endartist><song>');
          let artist = text[j].match(/(<start>).*?(<endartist>)/g);
          let song = text[j].match(/(<song>).*?(<end>)/g);

          if(artist && song){
            artist = artist[0].replace(/<start>|<endartist>/g,'');
            artist = artist.replace(/^[ \t]+|[ \t]+$/g, '');
            song = song[0].replace(/<song>|<end>/g,'');
            song = song.replace(/^[ \t]+|[ \t]+$/g, '');
            playlist.push({artist:artist,song:song})
          }
          // else{
          //   console.log(text[j]);
          // }

        }
      }
    }
  }

  return playlist
}

const recurseDwnFile = async (fileUrl = '', destination, attempt = 0) => {
  console.log(`  Start downloading file at ${fileUrl}, attempt ${attempt + 1}...`)
  let file
  try {
    const writeStream = fs.createWriteStream(destination)
    file = await new Promise((resolve, reject) => {
      process.stdout.write('  ')
      const req = request(fileUrl)
      const writeProgress = progress(req)
      req.on('error', reject)
      req.on('response', res => {
        res.pipe(writeStream)
          .on('error', e => reject(e))
          .on('finish', () => {
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            console.log('  Done.\n')
            resolve(destination)
          })
      })
      writeProgress.on('error', err => reject(err))
      writeProgress.on('progress', state => {
        process.stdout.clearLine()
        process.stdout.cursorTo(0)
        const progress = `${Math.floor(state.percent * 1000) / 10}%`
        const speed = `${Math.floor(state.speed / 800) / 10}kbps`
        const remaining = `${Math.floor(state.time.remaining)}s remaining`
        process.stdout.write(`  ${progress} - ${speed} - ${remaining}`)
      })
    })
  } catch (e) {
    if (attempt < 9) {
      console.error(`  Failure: ${e.message}.`)
      console.log('  Trying again.\n')
      return recurseDwnFile(fileUrl, attempt + 1,0)
    } else {
      console.error(`  Failure on last attempt: ${e.message}.`)
      console.log('Exiting now.\n')
      return process.exit(1)
    }
  }
  return file
}

const fillTemplate = async (data,outDirPath) =>{
  const outFileLocation = path.join(outDirPath, 'index.html')
  const outputFile = fs.readFileSync(outFileLocation, 'utf-8')

  const $ = cheerio.load(outputFile)
  data.forEach(playlist => {
    const $playlists = $('.playlists')
    const relativeCoverDest = path.relative(outDirPath, playlist.coverDest)
    const relativeAudioDest = path.relative(outDirPath, playlist.audioDest)
    $playlists.append(`
      <div class="playlist">
        <div class="playlist__cover">
          <img loading="lazy" src="./${relativeCoverDest}" />
        </div>
        <div class="playlist__audio">
          <audio controls preload="none">
            <source src="./${relativeAudioDest}" />
            Your browser doesn't support the audio element.
          </audio>
        </div>
        <div class="playlist__text">
          ${playlist.text}
        </div>
      </div>
    `)
  })

  return fs.writeFileSync(outFileLocation, $.html())
}

const writeJson = (data,outDirPath) => {
  const outFileLocation = path.join(outDirPath, 'data.json')
  const jsonData = JSON.stringify(data);
  fs.writeFileSync(outFileLocation, jsonData);
}

module.exports = {
  recursePages,
  saveFiles,
  listFiles,
  writeJson,
  recurseDwnFile,
  fillTemplate
};
