

class SessionManager {
    constructor(){
        this.init();
    }
    init(){
        if(this.getBoolean("init"))
            return;
        this.set("init", true);
        this.set("snow.active", true);
        this.set("soundboard.active", true);
    }
    clear(){
        sessionStorage.clear();
    }
    get(key){
        return sessionStorage.getItem(key);
    }
    set(key, value){
        sessionStorage.setItem(key, String(value));
    }
    getBoolean(key){
        let r = this.get(key);
        return r == null ? false : r == "true" ? true : false;
    }
}

export { SessionManager };