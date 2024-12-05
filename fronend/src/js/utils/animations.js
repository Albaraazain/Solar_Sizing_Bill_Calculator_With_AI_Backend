import { gsap } from "gsap";

export const animations = {
    fadeIn: (element, duration = 0.5, delay = 0) => {
        return gsap.fromTo(element,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration,
                delay,
                ease: "power2.out"
            }
        );
    },

    fadeOut: (element, duration = 0.3) => {
        return gsap.to(element, {
            opacity: 0,
            y: -20,
            duration,
            ease: "power2.in"
        });
    },

    slideIn: (element, direction = 'right', duration = 0.5) => {
        const xValue = direction === 'right' ? 100 : -100;
        return gsap.fromTo(element,
            {
                opacity: 0,
                x: xValue
            },
            {
                opacity: 1,
                x: 0,
                duration,
                ease: "power2.out"
            }
        );
    },

    staggerChildren: (parent, childSelector, staggerTime = 0.1) => {
        const children = parent.querySelectorAll(childSelector);
        return gsap.fromTo(children,
            {
                opacity: 0,
                y: 20
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: staggerTime,
                ease: "power2.out"
            }
        );
    },

    shake: (element, intensity = 5) => {
        return gsap.to(element, {
            x: intensity,
            duration: 0.1,
            repeat: 3,
            yoyo: true,
            ease: "power2.inOut"
        });
    }
};
