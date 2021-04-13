class Room {
    constructor(id) {
        this.roomId = id;
        this.started = false;
        this.users = [];
    }

    addUser(user) {
        (this.users).push(user); 
    }

    delUser(user) {
        const index = (this.users).indexOf(user);
        if(index > -1) {
            (this.users).splice(index, 1);
        }
    }
    // setStarted(bool) {
    //     this.started = bool;
    // }
}

module.exports = Room