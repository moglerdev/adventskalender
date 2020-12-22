
/**
 * TODO:
 *  - Schneeflocken
 *  - Hochgeladene Bilder löschen oder für Türchen auswählen
 *  - Hochladen bestätigung 
 */

 const URL = "http://dhbwvs.dyndns.info/we//workspace/B_NguyenThieu/adventskalender/"

const TEXT = {
    AK : {
        DOOR_LOCKED: "Dieses Türchen ist noch versperrt!"
    }
}

class AdventsKalender{
    /**
     * TODO: 
     *  - Türchen Random
     *  - Türchen Größe nach Bildern anpassen
     *  - Türchen speichern die geöffnet wurden
     */
    doors = []
    container = document.getElementsByClassName("ave")[0]
    currentDay = (new Date()).getDate();
    contextMenu = null;
  
    constructor(){
        for (let i = 0; i < 24; i++) {
            this.createDoor(i, this.container);
        }

        let in_currentDay = document.getElementById("current_date");
        in_currentDay.value = this.currentDay;
        in_currentDay.onchange = ({target: {value}}) => {
            if(value > 25 || value < 1 ){
                in_currentDay.value = this.currentDay;
            }else{
                this.currentDay = value;
            }
        }

        document.body.onclick = (ev) => {
            if (this.contextMenu !== null){
                let top = this.contextMenu.offsetTop;
                let left = this.contextMenu.offsetLeft;
                let bottom = top + this.contextMenu.offsetHeight;
                let right = left + this.contextMenu.offsetWidth;
                if (ev.pageY > top && ev.pageY < bottom 
                    && ev.pageX > left && ev.pageX < right){
                        return true;
                    }
                this.contextMenu.remove();
                this.contextMenu = null;
            }
        }
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
        door.dataset.day = id + 1;
        door.className = "col ave-item";

        let inner = document.createElement("div");
        inner.className = "inner";
        door.append(inner);

        let front = document.createElement("div");
        let back = document.createElement("div");

        front.innerHTML = door.dataset.day;
        front.className = "front";

        let img = document.createElement("img");
        img.id = `door-${id}-img`;
        img.src = URL + "api.php/door/get?id=" + id;
        img.alt = "Türchen " + (id + 1);
        img.onload = ({currentTarget}) => {
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

        back.append(img);
        back.className = "back";

        inner.append(front);
        inner.append(back);

        door.onclick = () => this.selectDoor(id, door);

        door.oncontextmenu = (ev) => {
            ev.preventDefault();
            let {pageX, pageY } = ev;
            this.contextMenu?.remove();
            this.contextMenu = this.createContextMenu(pageX, pageY, id);
            document.body.append(this.contextMenu);
            return false;
        };

        parent.append(door);
        this.doors.push(door);
        return door;
    }

    createContextMenu(x, y, id){
        let context = document.createElement("div");
        context.className = "menu";
        context.style.top = y;
        if (x + 220 < window.innerWidth){
            context.style.left = x;
        } else{
            context.style.right = window.innerWidth - 20 - x;
        }

        let title = document.createElement("span");
        title.className = "title"
        title.innerText = "Türchen " + (id + 1); 

        let change = document.createElement("button");
        change.innerText = "Bearbeiten";
        change.onclick = () => {
            window.modal.toggleModal(id)
            this.contextMenu.remove();
        };

        let open = document.createElement("button");
        let d = this.doors[id];
        open.innerText = d.classList.contains("opened") ? "Schließen" : "Öffnen";;
        open.onclick = () => {
            this.selectDoor(id, d);
            this.contextMenu.remove();
        };

        context.append(title);
        context.append(change);
        context.append(open);

        return context;
    }

    selectDoor(id, self){
        let day = id + 1;
        if(this.currentDay < day){
            alert(TEXT.AK.DOOR_LOCKED);
        }else{
            self.classList.toggle("opened");
        }
    }
} 

class Modal{
    currentModal = null;
    close = null
    active = false;

    currentId = -1;

    constructor(modal){
        window.modal = this;
        if(typeof modal === "string")
            this.currentModal = document.getElementById(modal);
        else 
            this.currentModal = modal;

        this.close = this.currentModal.getElementsByClassName("close")[0];
        this.close.onclick = () => this.toggleModal();

        let upload = this.currentModal.getElementsByClassName("file-upload-btn")[0];
        upload.onclick = (ev) => this.uploadFile(ev);

        this.buildGalery();
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
        img.src = URL + "api.php/door/get?id=" + id;
    }

    uploadFile(ev){
        let upload = this.currentModal.getElementsByClassName("file-upload")[0];
        let file = upload.files[0];

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
                    alert("Upload ist erfolgreich!");
                } catch (error) {
                    alert("uploadFile: Unbekannter Fehler entstanden!\r\nError: "+error);
                }
            }else{
                alert("Upload war nicht erfolgreich!");
            }

            this.buildGalery();
        })
        .catch(ex => {
            console.log(ex);
            alert("Upload war nicht erfolgreich!\r\nFehler: " + ex);
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
        let id = this.currentId;
        fetch(`${URL}api.php/door/upload?id=${id}&filename=${filename}`).then(res => res.json())
        .then(res => {
            if(res.success){
                try {
                    this.reloadImg(id)
                    alert("Bild erfolgreich geändert!");
                } catch (error) {
                    alert("selectFile: Unbekannter Fehler entstanden!\r\nError: "+error);
                }
            }else{
                alert("Bild konnte nicht geändert werden!");
            }
        })
        .catch(ex => {
            console.log(ex);
            alert("Bild konnte nicht geändert werden!\r\nFehler: " + ex);
        });
    }

    buildGalery(){
        fetch(URL + "api.php/images/all").then(res => res.json())
        .then(res => {
            if(res.success){
                let gal = document.getElementById("gallery");
                gal.innerHTML = "";

                let files = res.files;

                Array.from(files).forEach(file => {
                    let div = document.createElement("div");
                    let img = document.createElement("img");
                    img.src = URL + "api.php/images/get?filename=" + file;

                    div.append(img);
                    div.className = "gallery-item"

                    img.onclick = (ev) => {
                        this.selectFile(file);
                    };

                    gal.append(div);
                });

            }
            else{
                console.log(res);
            }
        })
        .catch(ex => {
            console.log(ex);
            alert("Gallery konnte nicht aufgebaut werden!\r\nFehler: " + ex);
        });
    }
}