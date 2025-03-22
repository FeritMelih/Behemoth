export class AnimationManager {
    constructor() {
        this.animatables = new Set();
    }

    addAnimatable(animatable) {
        this.animatables.add(animatable);
    }

    removeAnimatable(animatable) {
        this.animatables.delete(animatable);
    }

    update(deltaTime) {
        for (const animatable of this.animatables) {
            animatable.updateAnimation(deltaTime);
        }
    }
}