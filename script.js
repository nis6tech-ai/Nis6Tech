// Setup
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();

// Camera setup for a cinematic feel
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 3D Liquid Silk Cloud ---
const particlesCount = 8000;
const posArray = new Float32Array(particlesCount * 3);
const velocityArray = new Float32Array(particlesCount);

for (let i = 0; i < particlesCount; i++) {
    posArray[i * 3] = (Math.random() - 0.5) * 60;
    posArray[i * 3 + 1] = (Math.random() - 0.5) * 40;
    posArray[i * 3 + 2] = (Math.random() - 0.5) * 40;
    velocityArray[i] = Math.random();
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x007bff,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

// Mouse Interactivity
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update Particles (Silk Flow)
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Horizontal drift
        positions[i3] += Math.sin(elapsedTime * 0.2 + positions[i3 + 1] * 0.1) * 0.01;

        // Vertical silk wave
        positions[i3 + 1] += Math.cos(elapsedTime * 0.3 + positions[i3] * 0.1) * 0.01;

        // Depth pulse
        positions[i3 + 2] += Math.sin(elapsedTime * 0.4 + i) * 0.005;

        // Mouse "Wind" effect
        positions[i3] += mouseX * 0.1;
        positions[i3 + 1] -= mouseY * 0.1;

        // Wrap around boundaries
        if (positions[i3] > 30) positions[i3] = -30;
        if (positions[i3] < -30) positions[i3] = 30;
        if (positions[i3 + 1] > 20) positions[i3 + 1] = -20;
        if (positions[i3 + 1] < -20) positions[i3 + 1] = 20;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;

    // Gentle overall rotation
    particleSystem.rotation.y = elapsedTime * 0.03;

    // Smooth Camera Move
    gsap.to(camera.position, {
        x: mouseX * 8,
        y: -mouseY * 8 + 5,
        duration: 3,
        ease: 'power2.out'
    });
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// GSAP Animations (Refined)
gsap.registerPlugin(ScrollTrigger);

// Hero Entrance (Cleaned up as logo is the main visual now)
const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.5 } });
tl.from('.logo img', { y: -50, opacity: 0 });

// Section Animations (Excluding services which has its own staggered animation)
const sections = document.querySelectorAll('section:not(#hero):not(#services)');
sections.forEach(section => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
    });
});

// Staggered Animations for Services
const servicesGrid = document.querySelector('.services-grid');
if (servicesGrid) {
    gsap.from(servicesGrid.children, {
        scrollTrigger: {
            trigger: servicesGrid,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        y: 40, // Reduced vertical shift
        scale: 0.95, // Subtle scale-in
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Interactive Tilt effect for Service Cards
const cards = document.querySelectorAll('.service-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.5,
            ease: 'power2.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'back.out(1.2)'
        });
    });
});

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const interactiveElements = document.querySelectorAll('a, button, input, textarea, .card, .service-card, .project-card, .view-project-btn');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
    });
    gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3
    });
});

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        follower.classList.add('cursor-active');
        gsap.to(cursor, { scale: 0, duration: 0.2 });
    });
    el.addEventListener('mouseleave', () => {
        follower.classList.remove('cursor-active');
        gsap.to(cursor, { scale: 1, duration: 0.2 });
    });
});

// Stats Counter Animation
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(number => {
    const target = parseInt(number.getAttribute('data-target'));

    gsap.to(number, {
        scrollTrigger: {
            trigger: number,
            start: 'top 90%',
            toggleActions: 'play none none none'
        },
        innerText: target,
        duration: 2,
        snap: { innerText: 1 }, // Only whole numbers
        ease: 'power2.out'
    });
});
// Project Slider Logic
const projectWrapper = document.querySelector('.project-slider-wrapper');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');

if (projectWrapper && prevBtn && nextBtn) {
    const scrollAmount = 530; // Card width (500) + gap (30)

    nextBtn.addEventListener('click', () => {
        projectWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        projectWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
}

// Testimonial Free Scroll & Drag
const testimonialCarousel = document.querySelector('.testimonial-carousel');
let isTestimonialDown = false;
let startTestimonialX;
let testimonialScrollLeft;

if (testimonialCarousel) {
    const dots = document.querySelectorAll('.dot');
    const cardWidth = 600 + 48; // Card width + gap (3rem)

    // Handle initial active state
    if (dots.length > 0) dots[0].classList.add('active');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // Update active class
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');

            // Scroll to position
            testimonialCarousel.scrollTo({
                left: cardWidth * index,
                behavior: 'smooth'
            });
        });
    });

    testimonialCarousel.addEventListener('scroll', () => {
        const scrollIndex = Math.round(testimonialCarousel.scrollLeft / cardWidth);
        if (dots[scrollIndex]) {
            dots.forEach(d => d.classList.remove('active'));
            dots[scrollIndex].classList.add('active');
        }
    });

    testimonialCarousel.addEventListener('mousedown', (e) => {
        isTestimonialDown = true;
        testimonialCarousel.style.cursor = 'grabbing';
        startTestimonialX = e.pageX - testimonialCarousel.offsetLeft;
        testimonialScrollLeft = testimonialCarousel.scrollLeft;
    });

    testimonialCarousel.addEventListener('mouseleave', () => {
        isTestimonialDown = false;
        testimonialCarousel.style.cursor = 'grab';
    });

    testimonialCarousel.addEventListener('mouseup', () => {
        isTestimonialDown = false;
        testimonialCarousel.style.cursor = 'grab';
    });

    testimonialCarousel.addEventListener('mousemove', (e) => {
        if (!isTestimonialDown) return;
        e.preventDefault();
        const x = e.pageX - testimonialCarousel.offsetLeft;
        const walk = (x - startTestimonialX) * 2;
        testimonialCarousel.scrollLeft = testimonialScrollLeft - walk;
    });
}
