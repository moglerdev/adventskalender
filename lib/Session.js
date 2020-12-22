

class SessionManager {
    constructor(){
        var lastname = sessionStorage.getItem("key");
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