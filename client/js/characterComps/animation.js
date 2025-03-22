export class Animation {
    constructor(avatar, animationManager, state) {
        this.avatar = avatar;
        this.footJoints = avatar.footJoints;
        this.animationTime = 0;
        this.walkSpeed = 3; // Adjust this to change animation speed
        
        // Add this animation to the animation manager
        animationManager.addAnimatable(this);
        this.state = state.action;
    }

    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;

        // Only animate if state is not idle
        if (this.state !== 'idle') {
            // Animate each foot in a walking motion
            for (const [key, joint] of Object.entries(this.footJoints)) {
                // Create offset for each foot to be out of sync
                let timeOffset = 0;
                if (key === 'frontRight' || key === 'backLeft') {
                    timeOffset = Math.PI;
                }
                
                // Calculate rotation based on state
                let rotationAmount = 0.5; // Default walking rotation
                if (this.state === 'running') {
                    rotationAmount = 0.8; // Larger rotation for running
                    this.walkSpeed = 5; // Faster animation for running
                } else {
                    this.walkSpeed = 3; // Normal walking speed
                }
                
                const rotation = Math.sin(this.animationTime * this.walkSpeed + timeOffset) * rotationAmount;
                
                // Apply rotation around x-axis for walking motion
                joint.rotation.x = rotation;
            }
        } else {
            // Reset foot positions when idle
            for (const joint of Object.values(this.footJoints)) {
                joint.rotation.x = 0;
            }
        }
    }
}
