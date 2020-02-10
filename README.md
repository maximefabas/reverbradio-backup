# Reverbradio backup

A simple tool for backing up the playlists of the legendary [Reverberation Radio](https://reverberationradio.com).

## Installation & Usage

All you need is an up-to-date [Nodejs](https://nodejs.org/en/) version.

Then :
```
> cd ~/wherever/you/want
> git clone https://github.com/maximefabas/reverbradio-backup.git
> cd reverbradio-git
> npm i
> npm start
```

If you want to interrupt the download and start again some time later, you can just specify the playlist number you want to start on by passing it as a parameter:
```
npm start 250
```
This will start downloading files for the playlist at position 250.

## License
MIT License

Copyright (c) 2020 - Maxime Fabas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Author
[Maxime Fabas](https://github.com/maximefabas)
