class App {
    //form inputs
    #songSelect;
    #verseSelect;
    #fontColorSelect;
    #backgroundTypeSelect;
    #colorBackgroundArea;
    #imageBackgroundArea;
    //form buttons
    #addSongBtn;
    #clearSongBtn;
    #previewSongBtn;
    //current songs
    #currentSongs;
    #currentVerses;
    #currentLines;
    #currentChorus;

    constructor() {
        this.#initAll();
    }

    #initAll() {
        this.#currentSongs = [];
        this.#currentVerses = [];
        this.#currentLines = [];
        this.#currentChorus = "";
        this.#initAppButtons();
        this.#initSongForm();
    }

    #initAppButtons() {
        $("#dark-mode-btn").on("click",(evt) => {
            console.log("dark mode on");
            evt.currentTarget.parentElement.parentElement.classList.add("dark-mode");
        });

        $("#add-image-window-btn").on("click",(evt) => {
            $(".add-image-window").attr("style","display: flex;");
        });

        $("#close-window-btn").on("click",(evt) => {
            $(".add-image-window").attr("style","display: none;");
        });

        this.#initAllAddSongWidgets();

        $("#create-ppt-btn").on("click",(evt) => {
            this.#createPowerPoint();
        });
    }

    #initAllAddSongWidgets() {
        $("#add-song-window-btn").on("click",(evt) => {
            $(".add-song-window").css("display","flex");
        });

        $(".add-song-window #close-window-btn").on("click",(evt) => {
            $(".add-song-window").css("display","none");
        });

        $("#add-verse-btn").on("click",(evt) => {
            $(".add-verse-window").css("display","flex");
        });

        $(".add-verse-window #add-verse-btn").on("click",(evt) => {
            //check if the verse has lines
            if($(".add-verse-window .verse-lines > div").children().length <= 0) {
                //alert the user to add a line before they can add a verse
                alert("No lines added to this verse yet. Please add a line to add this verse");
            } else {
                //create a verse for the song
                this.#createSongVerse();
            }
        });

        $(".add-verse-window .close-window").on("click",(evt) => {
            $(".add-verse-window").css("display","none");
        });

        $(".add-verse-window #add-line-btn").on("click",(evt) => {
            $(".add-line-window").css("display","flex");
        });

        $(".add-line-window .close-window").on("click",(evt) => {
            if($("#line-text-input").val().length > 0) {
                if(confirm("The field has text entered. Are you sure you want to discard it?")) {
                    $(".add-line-window").css("display","none");
                }
            } else {
                $(".add-line-window").css("display","none");
            }
            $("#line-text-input").val("");
        });

        $(".add-line-window #add-line-btn").on("click",(evt) => {
            //check if line-text-input has text
            let lineText = $("#line-text-input").val();
            if(lineText.length > 0) {
                //if there is text, add line to verse, close and reset text input
                this.#addLineToVerse(lineText);
            } else {
                //alert the user to add text to create a line
                alert("To add a new line there must be text. Please add text to the line");
            }
        });
    }

    #addLineToVerse(lineText) {
        this.#currentLines.push(lineText);
        this.#refreshVerseLines();
        $(".add-line-window #line-text-input").val("");
        $(".add-line-window").css("display","none");
    }

    #createSongVerse() {
        let verseString = "";
        let lineLength = this.#currentLines.length;
        for(let i in this.#currentLines) {
            verseString += `${this.#currentLines[i]}${lineLength-1 == i ? "" : "\n"}`;
        }
        console.log(verseString);
        //add verse to song verses, close add verse window
        this.#currentVerses.push(verseString);
        this.#refreshSongVerses();
        $(".add-verse-window").css("display","none");
        //reset current lines for a new verse
        this.#currentLines = [];
        this.#refreshVerseLines();
    }

    #refreshVerseLines() {
        $(".add-verse-window .verse-lines > div").empty();
        for(let i in this.#currentLines) {
            $(".add-verse-window .verse-lines > div").append(`<div class='line-display'>${this.#currentLines[i]}</div>`);
        }
    }

    #refreshSongVerses() {
        $(".add-song-window .current-verses > div").empty();
        for(let i in this.#currentVerses) {
            $(".add-song-window .current-verses > div").append(`<div class="verse-display">${this.#currentVerses[i]}</div>`);
        }
    }

    #initSongForm() {
        this.#initFormInputs();
        this.#initFormButtons();
    }

    #initFormInputs() {
        this.#songSelect = $("#song-select");
        this.#verseSelect = $("#song-verses");
        this.#fontColorSelect = $("#font-color-input");
        this.#backgroundTypeSelect = $("#background-type");
        this.#colorBackgroundArea = $(".background-color");
        this.#imageBackgroundArea = $(".background-image");

        this.#getAllSongs();
        this.#initFormOnChanges();
        this.#initBackgroundImageSelect();
    }

    async #getAllSongs() {
        const request = await fetch(`/getallsongs`);
        const response = await request.json();

        for(let song in response) {
            this.#songSelect.append(`<option value="${response[song].id}">${response[song].name}</option>"`);
        }
    }

    #initFormOnChanges() {
        this.#songSelect.change(async (evt) => {
            this.#verseSelect.empty();
            if(evt.currentTarget.value) {
                const request = await fetch(`/getsongversecount/${evt.currentTarget.value}`);
                const response = await request.text();

                for(let verse in response) {
                    this.#verseSelect.append(`<option value="${response[verse]}">Verse ${response[verse]}</option>`);
                }
            }
        });
        this.#backgroundTypeSelect.change((evt) => {
            if(evt.currentTarget.value == "1") {
                this.#imageBackgroundArea.children().css("display","none");
                this.#imageBackgroundArea.animate({height: "0"},1000);
                this.#colorBackgroundArea.animate({height: "75px"},1000,() => {
                    this.#colorBackgroundArea.children().css("display","flex");
                });
            } else if(evt.currentTarget.value == "2") {
                this.#colorBackgroundArea.children().css("display","none");
                this.#colorBackgroundArea.animate({height: "0"},1000);
                this.#imageBackgroundArea.animate({height: "75px"},1000,() => {
                    this.#imageBackgroundArea.children().css("display","flex");
                });
            } else {
                this.#imageBackgroundArea.children().children(".active").removeClass("active");
                this.#colorBackgroundArea.children().css("display","none");
                this.#colorBackgroundArea.animate({height: "0"},1000);
                this.#imageBackgroundArea.children().css("display","none");
                this.#imageBackgroundArea.animate({height: "0"},1000);
            }
        });
    }

    async #initBackgroundImageSelect() {
        const request = await fetch(`/getbackgroundimages`);
        const response = await request.json();

        for(let image in response) {
            let filepath = `'http://localhost:5000/images/backgrounds/${response[image]}'`;
            this.#imageBackgroundArea.children().append(`<div id="${response[image]}" class="bckgrd-image" style="background-image: url(${filepath})"></div>`);
        }

        this.#imageBackgroundArea.children().children().on("click",(evt) => {
            this.#imageBackgroundArea.children().children(".active").removeClass("active");
            evt.currentTarget.classList.add("active");
        });
    }

    #initFormButtons() {
        this.#addSongBtn = $("#add-song-btn");
        this.#clearSongBtn = $("#clear-song-btn");
        this.#previewSongBtn = $("#preview-song-btn");
        this.#initFormButtonsOnClicks();
    }

    #initFormButtonsOnClicks() {
        this.#addSongBtn.on("click",(evt) => {
            this.#addSongToList();
        });
        this.#clearSongBtn.on("click",(evt) => {
            this.#clearAllFormFields();
        });
        this.#previewSongBtn.on("click",(evt) => {  });
    }

    #addSongToList() {
        let song = {
            "id": 0,
            "name": "",
            "verseString":"",
            "fontColor": "",
            "backgroundType": "",
            "backgroundColor": "",
            "backgroundImage": ""
        };
        //check if each form input has a value, if so get the value
        if(this.#songSelect.val()) {
            song.id = this.#songSelect.val();
            song.name = this.#songSelect.find('option:selected').text();
        } else {
            alert("A song must be selected! Please Try Again")
            return;
        }

        if(this.#verseSelect.val().length > 0) {
            let verseString = "";
            for(let i in this.#verseSelect.val()) {
                verseString += this.#verseSelect.val()[i];
            }
            song.verseString = verseString;
        } else {
            alert("Verses must be chosen! Please Try Again");
            return;
        }

        song.fontColor = this.#fontColorSelect.val().substring(1);
        song.backgroundType = this.#backgroundTypeSelect.val();

        if(song.backgroundType == 1) {
            song.backgroundColor = $("#color-input").val().substring(1);
            song.backgroundImage = 0;
        } else if(song.backgroundType == 2) {
            if($(".bckgrd-image.active")[0]) {
                song.backgroundImage = $(".bckgrd-image.active").attr("id");
                song.backgroundColor = 0;
            } else {
                alert("A background image must be chosen! Please Try Again");
                return;
            }
        } else {
            song.backgroundColor = "FFFFFF";
            song.backgroundImage = 0;
        }
        
        let length = this.#currentSongs.length;
        this.#currentSongs[length + 1] = song;
        this.#createSongDiv(song);
        this.#clearAllFormFields();
    }

    #createSongDiv(song) {
        $(".current-songs").append(`
            <div id="song-${song.id}">
                <div>
                    <label for="song-name">Song</label>
                    <p id="song-name">${song.name}</p>
                </div>
                <div>
                    <label for="verses">Verses</label>
                    <p id="verses">${song.verseString}</p>
                </div>
                <div>
                    <label for="background-type">Background Type</label>
                    <p id="background-type">${this.#backgroundTypeSelect.val() <= 1 ? "Color" : "Image" }</p>
                </div>
                <div>
                    <button id="remove-song-btn"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `);
    }

    async #createPowerPoint() {
        let request = await fetch(`/createpowerpoint/${this.#currentSongs.length}`);
        let response = await request.text();
        console.log(response);

        for(let song in this.#currentSongs) {
            let s = this.#currentSongs[song];
            console.log(s);
            let songurl = `/addsongslides/${s.id}/${s.verseString}/${s.fontColor}/${s.backgroundType}/${s.backgroundColor}/${s.backgroundImage}`;
            const request = await fetch(songurl);
            const response = await request.text();
            console.log(response);
        }

        request = await fetch(`/savepowerpoint`);
        response = await request.text();
        $(".current-songs").empty();
        this.#currentSongs = [];
        console.log(response);
    }

    #clearAllFormFields() {
        this.#songSelect.prop("selectedIndex",0);
        this.#verseSelect.empty();
        this.#backgroundTypeSelect.prop("selectedIndex",0);
        this.#backgroundTypeSelect.trigger("change");
    }
}

var app = new App();
