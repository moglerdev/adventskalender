
class AlertHandler {
    alerts = [];
    element = null;

    timer = null;

    constructor(){
    }

    init(element){
        this.element = element;
        /* DEBUG;
        this.addAlert("info", "hello world", "Ne alter, echt jetzt?");
        this.addAlert("warning", "hello world", "Ne alter, echt jetzt?");
        this.addAlert("error", "hello world", "Ne alter, echt jetzt?");
        this.addAlert("success", "hello world", "Ne alter, echt jetzt?");
        this.addAlert("info", "hello world", "Ne alter, echt jetzt?");
        */
        this.timer = setInterval(this.update.bind(this), 200);
    }

    addAlert(status, title, message){
        let a = new Alert(status, title, message);
        this.alerts.push(a);

        this.update();
    }

    removeAlert(alert){
        if(alert != null){
            let index = null;
            Array.from(this.alerts).forEach((al, i) => {
                if(al === alert){
                    index = i;
                    return;
                }
            });
            if(index != null){
                alert.element.remove();
                this.alerts.splice(index, 1);
            }
        }
    }

    update(){
        Array.from(this.alerts).forEach((al, index)=> {
            if(al.element == null){
                al.createElement(this.element, (ev) => this.removeAlert(al));
            }else{
                let diff = new Date().getTime() - al.created.getTime();
                if (diff > 2500){ // wenn länder als 2,5 Sekunden, dann löschen.
                    this.removeAlert(al);
                }
            }
        });
    }
}

export class Alert {
    status = "warning";
    title = null;
    message = "...";
    created = new Date();

    element = null;

    constructor(status, title, message){
        this.status = status;
        this.title = title;
        this.message = message;
    }

    createElement(parent, closeEvent){
        let ele = document.createElement("div");
        ele.className = "alert " + this.status;
        ele.onclick = closeEvent;
        
        let head = document.createElement("div");
        ele.append(head);
        head.className = "alert-head";

        let title = document.createElement("h1");
        head.append(title);
        title.className = "alert-title";
        title.innerText = this.title;

        let close = document.createElement("div"); // TODO Villeicht beim drücker der kompletten Meldung
        head.append(close);
        close.className = "alert-close";
        close.innerHTML = "&times;";
        close.onclick = closeEvent;

        let message = document.createElement("p");
        ele.append(message);
        message.className = "alert-message";
        message.innerHTML = this.message;

        this.element = ele;
        parent.append(ele);
    }
}

class _Loading{
    element = null;
    active = false;
    init(ele){
        this.element = ele;
    }
    start(){
        this.element.classList.toggle("active", true);
    }
    stop(){
        this.element.classList.toggle("active", false);
    }
}

export const Loading = new _Loading();

const AlertManager = new AlertHandler();
export default AlertManager;