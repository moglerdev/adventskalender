
/**
 * TODO:
 *  - Schneeflocken
 *  - Hochgeladene Bilder löschen oder für Türchen auswählen
 */

 const URL = "http://localhost/"

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
        let row = this.createRow();
        for (let i = 0; i < 24; i++) {
            if (i % 4 == 0 ){
                row = this.createRow();
            }
            this.createDoor(i, row);

        }

        let in_currentDay = document.getElementById("current_date");
        in_currentDay.value = this.currentDay;
        in_currentDay.onchange = ({target: {value}}) => {
            if(value > 24 || value < 1 ){
                in_currentDay.value = this.currentDay;
            }else{
                this.currentDay = value;
            }
        }

        document.body.onclick = (ev) => {
            // this.contextMenu.remove(); TODO
        }
    }

    createRow(){
        let row = document.createElement("row");
        row.className = "row";
        this.container.append(row);
        return row;
    }

    createDoor(id, row){
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
        img.src = "http://localhost/api.php/door/get?id=" + id;

        back.append(img);
        back.className = "back";

        inner.append(front);
        inner.append(back);

        door.onclick = () => this.selectDoor(id, door);

        door.oncontextmenu = (ev) => {
            ev.preventDefault();
            console.log(ev);
            let {pageX, pageY } = ev;
            this.contextMenu?.remove();
            this.contextMenu = this.createContextMenu(pageX, pageY, id);
            document.body.append(this.contextMenu);
            return false;
        };

        row.append(door);
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
        open.innerText = "Öffnen";
        open.onclick = () => {
            this.selectDoor(id, this.doors[id]);
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
            self.classList.add("opened");
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

        this.toggleModal(1);
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
        .catch(ex => console.log(ex));
    }
}