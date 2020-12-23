
 const URL = "http://dhbwvs.dyndns.info/we//workspace/B_NguyenThieu/adventskalender/"
import AlertManager, { Loading } from './alerts.js'
import { SessionManager } from './Session.js'


const TEXT = {
    AK : {
        DOOR_LOCKED: "Dieses Türchen ist noch versperrt!"
    }
}

const SM = new SessionManager();

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export class AdventsKalender{
    doors = []
    container = document.getElementsByClassName("ave")[0]
    currentDay = (new Date()).getDate();
    contextMenu = null;
  
    constructor(days = 24){
        this.createContextMenu = this.createContextMenu.bind(this);
        this.init = this.init.bind(this);
        this.setDay = this.setDay.bind(this);
        this.createRow = this.createRow.bind(this);
        this.createDoor = this.createDoor.bind(this);
        this.selectDoor = this.selectDoor.bind(this);
        
        this.init(days);
    }

    init(days){
        let di = SM.getArray("doors.shuffle");
        if(di == null){
            di = [];
            for (let i = 0; i < days; i++) {
                di.push(i);
            }
            shuffle(di);
            SM.set("doors.shuffle", JSON.stringify(di));
        }

        di.forEach((di, i) => {
            this.createDoor(di, this.container);
        });

        let in_currentDay = document.getElementById("current_date");
        in_currentDay.value = this.currentDay;
        in_currentDay.onchange = ({target: {value}}) => {
            if(value > (days + 1) || value < 1 ){
                in_currentDay.value = this.currentDay;
            }else{
                this.currentDay = value;
            }
        }

        document.body.onmousedown = (ev) => {
            if (this.contextMenu !== null){
                let top = this.contextMenu.offsetTop - 10;
                let left = this.contextMenu.offsetLeft - 10;
                let bottom = top + this.contextMenu.offsetHeight + 10;
                let right = left + this.contextMenu.offsetWidth + 10;
                if (ev.pageY > top && ev.pageY < bottom 
                    && ev.pageX > left && ev.pageX < right){
                        return true;
                    }
                this.contextMenu.remove();
                this.contextMenu = null;
            }
        }
    }

    reset(){
        Array.from(this.doors).forEach((door, i) => {
            SM.set(`door.${door.dataset.id}.active`, false)
            door.classList.toggle("opened", false);
        });
    }

    setDay(day){
        let in_currentDay = document.getElementById("current_date");
        this.currentDay = day;
        in_currentDay.value = this.currentDay
    }

    createRow(){
        let row = document.createElement("row");
        row.className = "row";
        this.container.append(row);
        return row;
    }

    createDoor(id, parent){
        let door = document.createElement('div');
        door.id = "door-" + id;
        door.dataset.id = id;
        door.className = "col ave-item";

        let inner = document.createElement("div");
        inner.className = "inner";
        door.append(inner);

        let front = document.createElement("div");
        let back = document.createElement("div");

        front.innerHTML = id + 1;
        front.className = "front";

        let img = document.createElement("img");
        img.id = `door-${id}-img`;
        img.src = URL + "api.php/door/get?id=" + id;
        img.alt = "Türchen " + (id + 1);
        img.onload = ({currentTarget}) => { // TODO: Resize verbessern
            let r = 240 / currentTarget.naturalWidth;
            let h = currentTarget.naturalHeight * r;
            door.style.height = h
            door.style.maxHeight =  h;
            inner.style.lineHeight = h;
        } 
        img.onerror = ({currentTarget}) => {
            door.style.height = currentTarget.height;
            door.style.maxHeight = currentTarget.height;
        }

        let config = document.createElement('button');
        config.innerHTML = '<i class="fas fa-cogs"></i>';
        config.className = "ave-config";

        back.append(img);
        back.className = "back";

        inner.append(front);
        inner.append(back);
        door.append(config);

        let a = SM.getBoolean(`door.${id}.active`)
        door.classList.toggle("opened", a);

        let openContext = (pageX, pageY) => {
            if(this.contextMenu != null){
                this.contextMenu.style.left = pageX;
                this.contextMenu.style.top = pageY;
                return false;   
            }
            this.contextMenu?.remove();
            this.contextMenu = null;
            this.contextMenu = this.createContextMenu(pageX, pageY, id);
            document.body.append(this.contextMenu);
            return false;
        }

        openContext = openContext.bind(this);

        let mc = new MouseController( 
            (pageX, pageY) => openContext(pageX, pageY), 
            (ev) => this.selectDoor(id));
        inner.onmousedown = mc.down;
        inner.onmouseup = mc.up;
        config.onclick = ({pageX, pageY}) => openContext(pageX, pageY);

        let f = (ev) => {
            ev.preventDefault();
            let {pageX, pageY} = ev;
            openContext(pageX, pageY);
        };

        f = f.bind(this);
        inner.oncontextmenu = f;

        parent.append(door);
        this.doors.push(door);
        return door;
    }

    createContextMenu(x, y, id){
        console.log(id);
        const context = document.createElement("div");
        context.className = "menu";
        context.style.top = y;
        if (x + 220 < window.innerWidth){
            context.style.left = x;
        } else{
            context.style.right = window.innerWidth - 20 - x;
        }

        const title = document.createElement("span");
        title.className = "title"
        title.innerText = "Türchen " + (id + 1); 

        const change = document.createElement("button");
        change.innerText = "Bearbeiten";
        change.onclick = () => {
            window.modal.toggleModal(id)
            this.contextMenu.remove();
        };

        const open = document.createElement("button");
        const d = this.getDoor(id);
        if (d){
            open.innerText = d.classList.contains("opened") ? "Schließen" : "Öffnen";;
            open.onclick = () => {
                this.selectDoor(id);
                this.contextMenu.remove();
            };
        }
        context.append(title);
        context.append(change);
        context.append(open);

        return context;
    }

    getDoor(id){
        let result = null;
        Array.from(this.doors).forEach((door, ind) => {
            if( door.dataset.id == id){
                result = door;
                return;
            }
        });
        return result;
    }

    selectDoor(id){
        let day = id + 1;
        let self = this.getDoor(id);
        if(this.currentDay < day){
            AlertManager.addAlert("warning", "Türchen", TEXT.AK.DOOR_LOCKED);
        }else{
            let a = SM.getBoolean(`door.${id}.active`)
            SM.set(`door.${id}.active`, !a)
            self.classList.toggle("opened", !a);
        }
    }
} 

class MouseController{
    downTimes = [];

    openContext = null;
    toggleDoor = null;

    timer = null;

    touching = false;

    constructor(openContext, toggleDoor){
        this.openContext = openContext;
        this.toggleDoor = toggleDoor;

        this.down = this.down.bind(this);
        this.up = this.up.bind(this);
    }

    down(ev){
        this.touching = true;
        this.downTimes[ev.button] = new Date();
        const { pageX, pageY, button } = ev;
        ev.preventDefault();
        this.timer = setTimeout((ev) => {
            if(this.touching){
                this.openContext(pageX,pageY);
                this.touching = false;
            }
            this.downTimes[button] = null;
        }, 500);
    }
    up(ev){
        clearTimeout(this.timer);
        if(ev.button !== 0 || this.touching == false) {
            this.downTimes[ev.button] = null;
            return;
        }
        let d = this.downTimes[ev.button];
        if(d != null){
            let upD = new Date();
            let diff = upD.getTime() - d.getTime();

            this.toggleDoor(ev);
        }
    }
}

export class Modal{
    currentModal = null;
    close = null
    active = false;

    currentId = -1;

    upload_input = null;
    upload_btn = null;

    constructor(modal, input, btn){
        this.upload_input = input;
        this.upload_btn = btn;
        window.modal = this;
        if(typeof modal === "string")
            this.currentModal = document.getElementById(modal);
        else 
            this.currentModal = modal;

        this.close = this.currentModal.getElementsByClassName("close")[0];
        this.close.onclick = () => this.toggleModal();

        this.upload_btn.onclick = (ev) => this.uploadFile(ev);

    }

    toggleModal(id){
        this.currentId = id;
        this.active = !this.active;
        if(this.active)
            this.currentModal.classList.add("active");
        else
            this.currentModal.classList.remove("active");

        let t = this.currentModal.getElementsByClassName("door-id");
        Array.from(t).forEach(element => {
            element.innerText = this.currentId + 1
        });

        let img = document.getElementById("modal_pic");
        img.src = URL + "api.php/door/get?id=" + id + `&t=${(new Date().getTime())}`;;
        this.buildGalery();
    }

    uploadFile(ev){
        Loading.start();
        this.upload_btn.disabled = true;
        let file = this.upload_input.files[0];
        
        if(file == null){
            AlertManager.addAlert("warning", "Upload", "Sie müssen erst eine Datei auswählen!");
            this.upload_btn.disabled = false;
            Loading.stop();
            return;
        }

        let data = new FormData();
        data.append("image", file);

        fetch(`${URL}api.php/door/upload?id=${this.currentId}`, {  
            body: data,
            method: 'POST'
        }).then(res => res.json())
        .then(res => {
            if(res.success){
                try {
                    let id = res.id;
                    this.reloadImg(id)
                    AlertManager.addAlert("success", "Upload", "Upload ist erfolgreich!");
                    this.buildGalery();
                } catch (error) {
                    AlertManager.addAlert("error", "Upload", "uploadFile: Unbekannter Fehler entstanden!\r\nError: "+error);
                }
            }else{
                AlertManager.addAlert("error", "Upload", "Upload war nicht erfolgreich!");
            }

            this.upload_input.value = null;
            this.upload_btn.disabled = false;
            Loading.stop();
        })
        .catch(ex => {
            this.upload_input.value = null;
            this.upload_btn.disabled = false;
            Loading.stop();
            console.log(ex);
            AlertManager.addAlert("error", "Upload", "Upload war nicht erfolgreich!\r\nFehler: " + ex);
        });
    }

    reloadImg(id){
        let url = URL + `api.php/door/get?id=${id}&t=${(new Date().getTime())}`;
        let img = document.getElementById(`door-${id}-img`) 
        if ( img != null ) img.src = url;
        
        img != null ? img = document.getElementById("modal_pic") : null;
        if ( img != null ) img.src = url;
    }

    selectFile(filename){
        Loading.start();
        let id = this.currentId;
        let b64_filename = this.encode(filename);
        fetch(`${URL}api.php/door/upload?id=${id}&filename=${b64_filename}`).then(res => res.json())
        .then(res => {
            if(res.success){
                try {
                    this.reloadImg(id)
                    AlertManager.addAlert("success", "Türchen", "Bild erfolgreich geändert!");
                } catch (error) {
                    AlertManager.addAlert("error", "Türchen", "selectFile: Unbekannter Fehler entstanden!\r\nError: "+error);
                }
            }else{
                AlertManager.addAlert("error", "Türchen", "Bild konnte nicht geändert werden!");
            }
            Loading.stop();
        })
        .catch(ex => {
            Loading.stop();
            console.log(ex);
            AlertManager.addAlert("error", "Türchen", "Bild konnte nicht geändert werden!\r\nFehler: " + ex);
        });
    }

    encode(filename){ // Vom String zum Base64
        return btoa(filename);
    }
    decode(filename){ // Von Base64 zum String
        return atob(filename);
    }

    buildGalery(){
        Loading.start();
        fetch(URL + "api.php/images/all").then(res => res.json())
        .then(res => {
            if(res.success){
                let gal = document.getElementById("gallery");
                gal.innerHTML = "";

                let files = res.files;

                Array.from(files).forEach(file => {
                    let div = document.createElement("div");
                    let img = document.createElement("img");
                    img.src = URL + "api.php/images/get?filename=" + this.encode(file);

                    div.append(img);
                    div.className = "gallery-item"

                    img.onclick = (ev) => {
                        this.selectFile(file);
                    };

                    let del = document.createElement("button");
                    del.className = "gallery-delete";
                    del.innerHTML = "<i class='fas fa-trash'></i>";
                    del.onclick = () => this.deleteImage(file, div);
                    div.append(del)

                    gal.append(div);
                });

            }
            else{
                console.log(res);
            }
            Loading.stop();
        })
        .catch(ex => {
            Loading.stop();
            console.log(ex);
            AlertManager.addAlert("error", "Gallery", "Gallery konnte nicht aufgebaut werden!\r\nFehler: " + ex);
        });
    }

    deleteImage(filename, galleryElement){
        Loading.start();
        let b64_filename = this.encode(filename);
        fetch(`${URL}api.php/images/delete?filename=${b64_filename}`).then(res => res.json())
        .then(res => {
            if(res.success){
                try {
                    galleryElement.remove();
                    if(res.code === 204){
                        AlertManager.addAlert("info", "Gallery", "Bild wurde breits gelöscht!<br/>!");
                    }else{
                        AlertManager.addAlert("info", "Gallery", "Bild wurde gelöscht!<br/>Türen werden dadurch nicht beinflusst!");
                    }
                } catch (error) {
                    AlertManager.addAlert("error", "Gallery", "deleteImage: Unbekannter Fehler ist entstanden!\r\nError: "+error);
                }
            }else{
                AlertManager.addAlert("error", "Gallery Löschen", "Bild konnte nicht gelöscht werden!");
            }
            Loading.stop();
        })
        .catch(ex => {
            Loading.stop();
            console.log(ex);
            AlertManager.addAlert("error", "Gallery Löschen", "Bild konnte nicht gelöscht werden!\r\nFehler: " + ex);
        });
    }
}