export interface Observer {
    on_state_update?: () => void;
}

export class Subject {
    observers: Observer[] = [];
    add_observer = (observer: Observer) => {
        this.observers.push(observer);
    };
    remove_observer = (observer: Observer) => {
        const observer_index = this.observers.indexOf(observer);
        if (observer_index !== -1) {
            this.observers.splice(observer_index, 1);
        } else {
            console.error("No such observer exists!");
        }
    };
    notify_all = () => {
        for (const o of this.observers) {
            if (o.on_state_update) {
                o.on_state_update();
            }
        }
    };
}
