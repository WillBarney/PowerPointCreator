const express = require('express');
var fs = require('fs');
var pptxgen = require('pptxgenjs');
const router = express.Router();
const app = express();
const PORT = 5000;

const dbPath = __dirname + '/database.json';
var database;

var powerpoint;
var songs = [];

var nsPattern = /\[ns\]/;
var ncPattern = /\[nc\]/;

router.get('/createpowerpoint/:slidecount',(req,res) => {
    powerpoint = new pptxgen();
    addLogoSlide();
    res.status(200).send("PowerPoint Successfully Created");
});

router.get('/addsongslides/:songId/:verseString/:fontColor/:backgroundType/:color/:image',(req,res) => {
    try {
        //get song
        const song = database.songs.filter((s) => {
            return s.songId == req.params.songId;
        })[0];
        //get selected background image if apply
        let background;
        if(req.params.image != 0) {
            background = `./public/images/backgrounds/${req.params.image}`;
        }
        //set background image for all song slides
        let bckgrdOption;
        switch(req.params.backgroundType) {
            case "0":
            case "1":
                bckgrdOption = { color: req.params.color };
                break;
            case "2":
                bckgrdOption = { path: background };
                break;
        }
        //create slide for song title
        createNameSlide(song.songName,req.params.fontColor,bckgrdOption);
        //go through each verse and add a slide, add chorus slides if apply
        for(let i in req.params.verseString) {
            //get verse
            let verse = song.verses[parseInt(req.params.verseString[i])-1];
            //check if verse has a [ns] delimiter
            let nsCheck = nsPattern.exec(verse);
            //check if verse has a [nc] delimiter
            let ncCheck = ncPattern.exec(verse);
            //declare variables to store first and second half of verse/chorus
            let firstHalf = "";
            let secondHalf = "";

            if(nsCheck) {
                //add first half of verse to sArray
                firstHalf = (verse.substring(0,nsCheck.index));
                //get second half of verse
                if(ncCheck) {
                    secondHalf = verse.substring(nsCheck.index+4,ncCheck.index);
                } else {
                    secondHalf = verse.substring(nsCheck.index+4);
                }
            } else {
                firstHalf = verse;
                secondHalf = null;
            }

            if(!secondHalf) {
                if(ncCheck) {
                    firstHalf = firstHalf.substring(0,ncCheck.index);
                }
                //create slide for verse
                createTextSlide(firstHalf,req.params.fontColor,bckgrdOption);
            } else {
                if(ncCheck) {
                    secondHalf = secondHalf.substring(0,secondHalf.length-4);
                }
                //create slide for first half of verse
                createTextSlide(firstHalf,req.params.fontColor,bckgrdOption);
                //create slide for second half of verse
                createTextSlide(secondHalf,req.params.fontColor,bckgrdOption);
            }

            if(!ncCheck) {
                if(song.chorus) {
                    nsCheck = nsPattern.exec(song.chorus);

                    if(nsCheck) {
                        firstHalf = song.chorus.substring(0,nsCheck.index);
                        secondHalf = song.chorus.substring(nsCheck.index+4);
                    } else {
                        firstHalf = song.chorus;
                        secondHalf = null;
                    }

                    if(!secondHalf) {
                        //create slide for chorus
                        createTextSlide(firstHalf,req.params.fontColor,bckgrdOption);
                    } else {
                        //create slide for first half of chorus
                        createTextSlide(firstHalf,req.params.fontColor,bckgrdOption);
                        //create slide for second half of chorus
                        createTextSlide(secondHalf,req.params.fontColor,bckgrdOption);
                    }
                }
            }
        }

        addCurrentSong(song.songName,req.params.verseString);

        addLogoSlide();

        res.status(200).send(`${song.songName} added to the powerpoint`);
    } catch(err) {
        console.log(err);
    }
});

router.get('/savepowerpoint',(req,res) => {
    try {
        let filename = `./powerpoints/`;
        for(let i in songs) {
            if(i <= 0) {
                filename += `${songs[i].name}VRS${songs[i].verseString}`;
            } else {
                filename += `_${songs[i].name}VRS${songs[i].verseString}`;
            }
        }
        powerpoint.writeFile({ fileName: filename });
        powerpoint = null;
        songs = [];
        res.status(200).send(`Powerpoint ${filename} successfully created!`);
    } catch(err) {
        console.log(err);
    }
});

router.get('/getallsongs',(req,res) => {
    let allsongs = [];
    database.songs.filter((s) => {
        allsongs.push({"id": s.songId,"name": s.songName,"verses": s.verses});
    });
    res.status(200).send(allsongs);
});

router.get('/getsongversecount/:songId',(req,res) => {
    let verses = "";
    database.songs.filter((s) => {
        if(s.songId == req.params.songId) {
            for(let i = 1;i <= s.verses.length;i++) {
                verses += `${i}`;
            }
        }
    });
    res.status(200).send(verses);
});

router.get('/getbackgroundimages',(req,res) => {
    let files = fs.readdirSync('./public/images/backgrounds');
    res.status(200).send(files);
});

app.use(router);
app.use(express.static('public'));

app.listen(PORT,() => {
    console.log(`Server connected at: ${PORT}`);
    fs.readFile(dbPath,(err,data) => {
        database = JSON.parse(data);
    });
});

function addCurrentSong(name,verseString) {
    let songName = name.replace(/[^\w]/g,"").toLowerCase();
    songs.push({"name":songName,"verseString":verseString});
}

function addLogoSlide() {
    let slide = powerpoint.addSlide();
    slide.background = {path: "./public/images/logos/logowoodwall.png"};
}

function formatText(vOrC) {

}

function createNameSlide(name,fontColor,bckgrdOption) {
    let nameslide = powerpoint.addSlide();
    nameslide.addText(name,{
        fontSize: 72,
        y: "50%",
        w: "100%",
        align: "center",
        valign: "middle",
        color: fontColor
    });
    nameslide.background = bckgrdOption;
}

function createTextSlide(text,fontColor,bckgrdOptions) {
    let slide = powerpoint.addSlide();
    slide.addText(text,{
        y: "50%",
        w: "100%",
        fontSize: 56,
        align: "center",
        valign: "middle",
        color: fontColor
    });
    slide.background = bckgrdOptions;
}