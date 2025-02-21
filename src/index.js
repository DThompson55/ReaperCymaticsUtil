"use strict";
const fs = require('fs');
const readline = require('readline');
/**
//Cymatics files are located here:
cd ~/Documents/Audio\ Files/Cymatics

// Media Explorer Databases are here:
cd ~/Library/Application\ Support/REAPER/MediaDB

// find and delete dupes in dangerous mode
fdupes -rdN .
fdupes -r .
// fdupes -rdN .
// -r: Recursively search for duplicate files.
// -d: Prompt the user for which files to preserve and delete duplicates.
// -N: Preserve the first file in each set of duplicates and delete the others.
//

// remove the Cymatics name from the files
find . -type d -exec rename 's/Cymatics - //' {} +
find . -type f -exec rename 's/Cymatics - //' {} +

**/

const reaperResourcePath = "/Users/danielthompson/Library/Application Support/REAPER/MediaDB/"
const masterMediaExplorerDatabase =  '03';
const line1 = 'PATH "/Volumes/Seagate Portabl/Cymatics"';
//const line1 = 'PATH "/Users/danielthompson/Documents/Audio Files/Cymatics"';
const suffix=".ReaperFileList";

const bag = new Set();

console.log("Before Running this, rename the Cymatics Samples\n"+
  "Got to the Cymatics folder and run these commands\n"+
  " find . -type d -exec rename 's/Cymatics - //' {} +\n"+
  " find . -type f -exec rename 's/Cymatics - //' {} +\n"+
  "\n"+
  "Then go into Reaper. Start the Media Explorer. \n"+
  "If you don't have a Cymatics db, create one. \n"+
  "Choose the Cymatics.db. Scan for new files. \n"+
  "Then run this app using npm start. \n"+
  "This will only reorganize what's already in that database.")

const rules = [
//{dbName:'Drum Loops',include:['loop'],exclude:['mid']},
{dbName:'_Ignore',include:['suds'],orInclude:['suds'],exclude:['suds']},
{dbName:'808s',orInclude:['808','808s'],exclude:['mid','bpm']},
{dbName:'Bass',orInclude:['bass','basses'],exclude:['mid','bpm']},
{dbName:'Bass Loops',include:['bpm'],orInclude:['bass','basses'],exclude:['mid']},
{dbName:'Breaks',include:['drum breaks'],exclude:['mid']},
{dbName:'Claps',include:['clap'],exclude:['mid']},
{dbName:'Cymbals',orInclude:['cymbal','ride','crash'],exclude:['mid']},
//{dbName:'FXP',include:['fxp"'],exclude:['mid']},
{dbName:'Drum Fills', include:['drum','fill'],exclude:['mid','stems']},
{dbName:'Drum Loops', orInclude:['loop','loops'],include:['drum'],exclude:['mid','stems']},
{dbName:'Drum Loops', orInclude:['loop','loops'],include:['drums'],exclude:['mid','stems']},
{dbName:'Drum Loops', orInclude:['loop','loops'],include:['hihat','hi hat'],exclude:['mid','stems']},
{dbName:'Drum Loops', orInclude:['loop','loops'],include:['percussion'],exclude:['mid','stems']},
{dbName:'Drum Stems', orInclude:['stem','stems'],include:['drum'],exclude:['mid']},
{dbName:'Drum Stems', orInclude:['stem','stems'],include:['hihat'],exclude:['mid']},
{dbName:'Drum Stems', orInclude:['stem','stems'],include:['percussion'],exclude:['mid']},
{dbName:'FX-Ambience',orInclude:['ambient','ambience','fx','foley','life recording'],exclude:['mid']},
{dbName:'Guitar Loops',orInclude:['guitar','guitars'],include:['bpm'],exclude:['mid','stems']},
{dbName:'Guitar Stems', orInclude:['stem','stems'],include:['guitar'],exclude:['mid','loop','loops']},
{dbName:'Guitar',include:['guitar'],exclude:['mid','loop','loops','bpm','foley']},
{dbName:'HiHats',orInclude:['hihat','open hat'],exclude:['mid','bpm']},
{dbName:'HiHat Loops',orInclude:['hihat','open hat'],exclude:['mid'],include:['bpm']},
{dbName:'Kicks',include:['kick'],exclude:['mid','bpm']},
{dbName:'Kick Loops',include:['kick','bpm'],exclude:['mid']},
{dbName:'Loops Stems',orInclude:['loop stems','stems'],exclude:['mid','drum loop']},
{dbName:'Melodies', include:['bpm'],orInclude:['melodies','melody','melodics'],exclude:['mid']},
{dbName:'Melodies', include:['stems'],orInclude:['melodies','melody','melodics'],exclude:['mid']},
{dbName:'Melodies',orInclude:['melodies','melody','melodics'],exclude:['mid']},
{dbName:'Midi',include:['mid']},
{dbName:'Percussion', include:['drum'],exclude:['mid','stems','loop','bpm']},
{dbName:'Percussion',orInclude:['perc','percussion'],exclude:['mid','bpm']},
{dbName:'Percussion Loops',orInclude:['perc','percussion'],include:['bpm'],exclude:['mid']},
{dbName:'Piano',include:['piano'],exclude:['mid']},
{dbName:'Rimshots',orInclude:['rim','rimshot'],exclude:['mid','bpm']},
{dbName:'Rimshot Loops',orInclude:['rim','rimshot'],exclude:['mid'],include:['bpm']},
{dbName:'Shakers',orInclude:['shaker','shakers'],exclude:['mid']},
{dbName:'Shots',orInclude:['shot','shots','oneshots'],exclude:['mid']},
{dbName:'Snaps',include:['snap'],exclude:['mid']},
{dbName:'Snares',include:['snare'],exclude:['mid','bpm']},
{dbName:'Snare Loops',include:['snare','bpm'],exclude:['mid']},
{dbName:'Texture',include:['textures'],exclude:['mid']},
{dbName:'Toms',include:['tom'],exclude:['mid','bpm']},
{dbName:'Tom Loops',include:['tom','bpm'],exclude:['mid']},
{dbName:'Toys',include:['toy shop'],exclude:['mid']},
{dbName:'Vocals',orInclude:['vox','vocal','vocals','acapella'],exclude:['mid']},
{dbName:'Unclassified',include:['suds'],orInclude:['suds'],exclude:['suds']},

]

function containsBPMNumber(str) {
  if (str.toLowerCase().includes("bpm")) return false;
  var retval = false;
  const numbers = str.match(/\d+ /g); // Match all sequences of digits followed by space
  if (numbers) {
    numbers.forEach((number)=>{
    const bpmValue = parseInt(number, 10); // Extract and convert the number
    retval ||= ((bpmValue >= 125) && (bpmValue <= 200));
    //if (retval) console.log(str);
  })
  }
  return retval;
}

// var str ="/Users/danielthompson/Documents/Audio Files/Cymatics/Alien - 111 BPM G Min Percussion"
// // "Phoenix/Rebirth/6 Live Session Vocals/Uptown Acapella - Dry Full - 105 BPM C# Min"
// console.log("Debug -",str)
// console.log(categorize(str, true))
// process.exit(0);


// Function to categorize files
function categorize(line, debug=false) {
  //process.exit(0);

  var dbName = ((line.substring(59)).split('"')[0]).toLowerCase();
  var bpmStr = ((line.substring(59)).split('"')[0]).toLowerCase();


const categories = rules
  .filter(rule => {

    if (debug) process.stdout.write(rule.dbName+" include="+rule.include+" ")
    const includes = rule.include 
      ? rule.include.every(kw => {
        if (debug) process.stdout.write(" has"+kw+"?")
          if (kw.toLowerCase() === 'bpm') {
            if (dbName.toLowerCase().includes('bpm')){
              if (debug) process.stdout.write(" contains bpm=true")
              return true;
            } else {
              if (debug) process.stdout.write( " contains number="+containsBPMNumber(dbName))
              return containsBPMNumber(dbName);
            } 
          } else {
            var ret = new RegExp(`\\b${kw}\\b`).test(dbName); // Check for word boundary
            if (debug) process.stdout.write(" ret="+ret)
            return ret;
          }
        }) 
      : true;
      if (debug) console.log(" includes="+includes)

    if (debug) process.stdout.write(rule.dbName+" orInclude="+rule.orInclude+" ")
    const orIncludes = rule.orInclude 
      ? rule.orInclude.some(kw => {
          if (debug) process.stdout.write(" has"+kw+"?")
          if (kw.toLowerCase() === 'bpm') {
            if (dbName.toLowerCase().includes('bpm')){
              if (debug) process.stdout.write(" contains bpm=true")
              return true;
              } else {
                if (debug) process.stdout.write( " contains number="+containsBPMNumber(dbName))
                return containsBPMNumber(dbName);
              } 
            } else {
              var ret = new RegExp(`\\b${kw}\\b`).test(dbName); // Check for word boundary
              if (debug) process.stdout.write(" ret="+ret)
              return ret;
            } 
            return new RegExp(`\\b${kw}\\b`).test(dbName);
        }) 
      : true;
      if (debug) console.log(" orIncludes="+orIncludes)

    if (debug) process.stdout.write(rule.dbName+" exclude="+rule.exclude+" ")
    const excludes = rule.exclude 
      ? rule.exclude.every(kw => !new RegExp(`\\b${kw}\\b`).test(dbName)) 
      : true;

      if (debug) console.log(" excludes="+excludes)

    if (debug) console.log(rule.dbName+" Final Tally="+(includes && orIncludes && excludes))

    return (includes && orIncludes && excludes);
  })
  .map(rule => rule.dbName);
    var unique = [...new Set(categories)];
    if (unique.length == 0){
      unique = ["Unclassified"];
    }
  
  return { dbName, unique};
}


function createBagFromNames(list) {
  return list.reduce((bag, obj) => {
//    console.log("---",obj, obj.dbName);
    const dbName = obj.dbName;
    bag[dbName] = (bag[dbName] || 0) + 1;
    return bag;
});
}

async function processLineByLine() {
// deletes each database file
// so I need to make a bag of all of the filenames

var fileBag = createBagFromNames(rules);

var i = 0;
Object.entries(fileBag).forEach(([file, count]) => {
  i++;
  if (i<5)return; // something funky about how the reduce function works that I don't understand
  try {fs.unlinkSync(reaperResourcePath+file+suffix);} catch(err){console.log(err)}
  fs.appendFileSync(reaperResourcePath+file+suffix, line1+"\n");
  console.log("Created db",file);
})
console.log("Build Bag from:",reaperResourcePath+masterMediaExplorerDatabase+suffix);
//-----

const fileStream1 = fs.createReadStream(reaperResourcePath+masterMediaExplorerDatabase+suffix);

const rl1 = readline.createInterface({
  input: fileStream1,
  crlfDelay: Infinity
});
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input as a single line break.


var s = {};
s.unique = ["Default"]; // this should never actually get used
  var i = 0;
  
  // find the key of the sample, if any
  const key_regex = /\b([A-G](#|b)?\s(min|maj))\b/i;
  var key = "";

  for await (const line of rl1) {
    // Each line in input will be successively available here as `line`.
    //      
    if (line.startsWith("FILE")) {
      s =categorize(line)

      const keys = line.match(key_regex);
      key = null;
      if (keys){
        key = keys[0]; // find the key of the sample, if any
//        console.log(key); // Output: [ 'C maj', 'D# Min', 'G MIN', 'Ab mIn', 'F# MAJ' ]
      } 
      if (( i %10000 )== 0)
      console.log('.'); // Prints a period every thousand inputs so we know it's working
      i++
    }

    s.unique.forEach((fileName)=>{
     fs.appendFileSync(reaperResourcePath+fileName+suffix, line+"\n")
     if (key){
      fs.appendFileSync(reaperResourcePath+fileName+suffix, 'DATA "K:'+key+'"\n')
     }
     key = null;
    })
  }
  console.log(i,"samples processed");
}


processLineByLine();
