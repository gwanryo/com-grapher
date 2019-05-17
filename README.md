# Serial to Graph Visualizer

Simple graph viewer communicates with serial(COM port).

## Getting Started

You can easily start with Download this project ZIP

### Prerequisites

* [Node.js](https://nodejs.org/) (10.15.3 or 12.2.0)
* [MS Build Tools 2015](https://www.microsoft.com/en-US/download/details.aspx?id=48159) (node-gyp)

### Build
1. It requires [Node.js](https://nodejs.org/) and [MS Build Tools 2015](https://www.microsoft.com/en-US/download/details.aspx?id=48159)
Any version will be okay, but not sure

2. For node-gyp, [MS Build Tools 2015](https://www.microsoft.com/en-US/download/details.aspx?id=48159) should installed
(If you have **VS 2015** or **VS 2017**, you can skip this step)
**Don't use VS 2019! (Compatibility issue with node-gyp)**

3. If all are installed, write this command
```bash
npm install
```

4. Rebuild for version compatibility
```bash
npm rebuild
```

5. Rebuild Electron for version compatibility
```bash
./node_modules/.bin/electron-rebuild.cmd
```

6. For executable, run this command
```bash
npm run build
```

7. You can use asar for package and delete resource app folder
```bash
npm run package
rm -rf {package resource}/app
```

## Authors

* **Ryo** - *Whole work*

## License

None.

## Acknowledgments

* Just lab work :)