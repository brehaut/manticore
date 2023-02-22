export function debounce(action: () => void): () => void {
    let animationFrameId: number | undefined;

    return () => {
        if (animationFrameId) return;
        animationFrameId = requestAnimationFrame(() => {
            animationFrameId = undefined;
            action();
        });
    };
}