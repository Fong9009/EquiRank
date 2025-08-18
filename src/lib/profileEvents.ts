type ProfileUpdateListener = () => void;

class ProfileEventEmitter {
    private listeners: ProfileUpdateListener[] = [];

    subscribe(listener: ProfileUpdateListener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    emit() {
        this.listeners.forEach(listener => listener());
    }
}

export const profileEvents = new ProfileEventEmitter();
