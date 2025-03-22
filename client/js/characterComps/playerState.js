export class PlayerState {
    constructor() {
        // Base stats
        this.power = 1;
        this.defence = 1; 
        this.devouring = 1;
        this.speed = 5;
        
        // Status attributes
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.hunger = 100; // Starts full
        
        // State tracking
        this.element = 'none'; // Current elemental affinity
        this.action = 'idle'; // Current action state
    }

    // Health methods
    damage(amount) {
        const actualDamage = amount / this.defence;
        this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
        return this.currentHealth <= 0;
    }

    heal(amount) {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }

    // Hunger methods
    consume(amount) {
        this.hunger = Math.min(100, this.hunger + amount);
    }

    depleteHunger(amount) {
        this.hunger = Math.max(0, this.hunger - amount);
        return this.hunger <= 0;
    }

    // State changes
    setElement(element) {
        this.element = element;
    }

    setAction(action) {
        this.action = action;
    }

    // Stat modifications
    increaseStat(stat, amount) {
        if (this[stat] !== undefined) {
            this[stat] += amount;
        }
    }

    // Returns current state as object
    getStatus() {
        return {
            power: this.power,
            defence: this.defence,
            devouring: this.devouring,
            speed: this.speed,
            health: this.currentHealth,
            maxHealth: this.maxHealth,
            hunger: this.hunger,
            element: this.element,
            action: this.action
        };
    }
}
