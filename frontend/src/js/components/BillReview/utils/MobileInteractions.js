import gsap from 'gsap';

export function initializeMobileInteractions(container) {
    let startY = 0;
    let currentY = 0;
    const initialHeight = '60vh';
    const expandedHeight = '92vh';

    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        currentY = container.getBoundingClientRect().height;
    }

    function handleTouchMove(e) {
        const deltaY = startY - e.touches[0].clientY;
        const newHeight = Math.max(
            Math.min(currentY + deltaY, window.innerHeight * 0.92),
            window.innerHeight * 0.3
        );

        gsap.to(container, {
            height: newHeight,
            duration: 0.1,
            ease: 'none'
        });
    }

    function handleTouchEnd() {
        const finalHeight = container.getBoundingClientRect().height;
        const threshold = window.innerHeight * 0.6;

        gsap.to(container, {
            height: finalHeight > threshold ? expandedHeight : initialHeight,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    const dragHandle = container.querySelector('.drag-handle');
    if (dragHandle) {
        dragHandle.addEventListener('touchstart', handleTouchStart);
        dragHandle.addEventListener('touchmove', handleTouchMove);
        dragHandle.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
        if (dragHandle) {
            dragHandle.removeEventListener('touchstart', handleTouchStart);
            dragHandle.removeEventListener('touchmove', handleTouchMove);
            dragHandle.removeEventListener('touchend', handleTouchEnd);
        }
    };
}
