# Serial to Graph Visualizer
![Serial to Graph Visualizer](https://user-images.githubusercontent.com/9062624/57948142-d2400680-791b-11e9-8df4-8e82e2c6bfda.png)
Simple graph viewer communicates with serial(COM port).

## Getting Started

You can easily start with Download this project ZIP

### Prerequisites

* [Node.js](https://nodejs.org/) 10.15.3 or 12.2.0 *(Any version will be okay, but not sure)*
* [MS Build Tools 2015](https://www.microsoft.com/en-US/download/details.aspx?id=48159) (node-gyp)

### Build
1. It requires [Node.js](https://nodejs.org/) and [MS Build Tools 2015](https://www.microsoft.com/en-US/download/details.aspx?id=48159)
   * *Any version of Node.js will be okay, but not sure*
   
2. [MS Build Tools 2015](https://www.microsoft.com/en-US/download/details.aspx?id=48159) is required for [node-gyp](https://github.com/nodejs/node-gyp)
   * *If you have **VS 2015** or **VS 2017**, you can skip this step*
   * **Don't use VS 2019! (Compatibility issue with node-gyp)**

3. Install required npm package for build
```bash
npm install
```

4. Rebuild packages, additionally rebuild serialport with *--update-binary* option.
```bash
npm rebuild
npm rebuild serialport --update-binary
```
   or, you can just run command below
```bash
npm run rebuild
```

5. Rebuild electron
```bash
./node_modules/.bin/electron-rebuild
```

6. *Windows only* To build executable, run this command. This will create **dist** folder with installer and portable.
```bash
npm run build:win
```

## Authors

* **Ryo** - *Whole work*

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

* Just lab work :)
