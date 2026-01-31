/**
 * Moayad Portfolio - JavaScript
 * Three.js 3D Background & Interactive Features
 */

// ===========================
// Three.js 3D Particle Background
// ===========================

class ParticleBackground {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.particles = null;
        this.grid = null;
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        // Position camera
        this.camera.position.z = 50;
        
        // Create elements
        this.createParticles();
        this.createGrid();
        this.createConnections();
        
        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Start animation
        this.animate();
    }
    
    createParticles() {
        const particleCount = 800; // Reduced for subtlety
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        const colorPalette = [
            new THREE.Color(0x00f5ff), // Cyan
            new THREE.Color(0x0080ff), // Blue
            new THREE.Color(0x8b5cf6), // Purple
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
            
            // Color
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Size
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Custom shader material for glowing particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Subtle movement
                    pos.x += sin(time * 0.5 + position.y * 0.05) * 2.0;
                    pos.y += cos(time * 0.3 + position.x * 0.05) * 2.0;
                    pos.z += sin(time * 0.4 + position.z * 0.05) * 1.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= 0.4; // Reduced opacity for subtlety
                    
                    // Subtle glow effect
                    vec3 glow = vColor * (1.0 + alpha * 0.3);
                    
                    gl_FragColor = vec4(glow, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createGrid() {
        const gridSize = 100;
        const divisions = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        const step = gridSize / divisions;
        const halfSize = gridSize / 2;
        
        const color1 = new THREE.Color(0x00f5ff);
        const color2 = new THREE.Color(0x0080ff);
        
        // Horizontal lines
        for (let i = 0; i <= divisions; i++) {
            const y = -halfSize + i * step;
            positions.push(-halfSize, y, -20, halfSize, y, -20);
            
            const t = i / divisions;
            const color = color1.clone().lerp(color2, t);
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
        
        // Vertical lines
        for (let i = 0; i <= divisions; i++) {
            const x = -halfSize + i * step;
            positions.push(x, -halfSize, -20, x, halfSize, -20);
            
            const t = i / divisions;
            const color = color1.clone().lerp(color2, t);
            colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.08, // Reduced for subtlety
            blending: THREE.AdditiveBlending
        });
        
        this.grid = new THREE.LineSegments(geometry, material);
        this.grid.rotation.x = Math.PI * 0.3;
        this.scene.add(this.grid);
    }
    
    createConnections() {
        // Create floating geometric shapes
        const geometries = [
            new THREE.IcosahedronGeometry(3, 0),
            new THREE.OctahedronGeometry(2.5, 0),
            new THREE.TetrahedronGeometry(2, 0)
        ];
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            wireframe: true,
            transparent: true,
            opacity: 0.15 // Reduced for subtlety
        });
        
        this.floatingShapes = [];
        
        for (let i = 0; i < 3; i++) { // Fewer shapes for subtlety
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const mesh = new THREE.Mesh(geometry, material.clone());
            
            mesh.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 50
            );
            
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.5 + 0.5,
                floatOffset: Math.random() * Math.PI * 2
            };
            
            this.scene.add(mesh);
            this.floatingShapes.push(mesh);
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = this.clock.getElapsedTime();
        
        // Smooth mouse following
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        
        // Update particles
        if (this.particles) {
            this.particles.material.uniforms.time.value = time;
            this.particles.rotation.y = this.mouse.x * 0.1;
            this.particles.rotation.x = this.mouse.y * 0.1;
        }
        
        // Update grid
        if (this.grid) {
            this.grid.rotation.z = time * 0.05;
            this.grid.material.opacity = 0.06 + Math.sin(time) * 0.02; // More subtle pulsing
        }
        
        // Update floating shapes
        this.floatingShapes.forEach((shape) => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;
            
            shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.02;
        });
        
        // Camera subtle movement
        this.camera.position.x = this.mouse.x * 5;
        this.camera.position.y = this.mouse.y * 5;
        this.camera.lookAt(this.scene.position);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ===========================
// Typing Animation
// ===========================

class TypingAnimation {
    constructor(element, texts, typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000) {
        this.element = element;
        this.texts = texts;
        this.typeSpeed = typeSpeed;
        this.deleteSpeed = deleteSpeed;
        this.pauseTime = pauseTime;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let timeout = this.isDeleting ? this.deleteSpeed : this.typeSpeed;
        
        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            timeout = this.pauseTime;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            timeout = 500;
        }
        
        setTimeout(() => this.type(), timeout);
    }
}

// ===========================
// Navigation
// ===========================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }
    
    init() {
        // Scroll effect
        window.addEventListener('scroll', () => this.onScroll());
        
        // Mobile menu toggle
        this.mobileMenuBtn?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Close mobile menu on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.mobileMenu?.classList.add('hidden');
            });
        });
        
        // Smooth scroll for nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.smoothScroll(e));
        });
    }
    
    onScroll() {
        if (window.scrollY > 50) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
    
    toggleMobileMenu() {
        this.mobileMenu?.classList.toggle('hidden');
    }
    
    smoothScroll(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// ===========================
// Skills Animation
// ===========================

class SkillsAnimation {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-progress');
        this.animated = false;
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animateSkills();
                    this.animated = true;
                }
            });
        }, { threshold: 0.3 });
        
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
            observer.observe(skillsSection);
        }
    }
    
    animateSkills() {
        this.skillBars.forEach((bar, index) => {
            const progress = bar.dataset.progress;
            setTimeout(() => {
                bar.style.width = `${progress}%`;
            }, index * 100);
        });
    }
}

// ===========================
// Contact Form
// ===========================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        
        this.init();
    }
    
    init() {
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
        `;
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = `
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Message Sent!
            `;
            submitBtn.classList.remove('bg-gradient-to-r', 'from-neon-cyan', 'to-neon-blue');
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            this.form.reset();
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }, 1500);
        
        console.log('Form submitted:', data);
    }
}

// ===========================
// Scroll Reveal Animation
// ===========================

class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.service-card, .skill-category, .contact-form-container');
        
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, { threshold: 0.1 });
        
        this.elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
}

// ===========================
// Initialize Everything
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js background
    new ParticleBackground();
    
    // Initialize typing animation
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        new TypingAnimation(typingElement, [
            'IT Specialist',
            'AI Integration Expert',
            'Programmer',
            'System Administrator',
            'AI-Powered Developer',
            'Web Developer'
        ]);
    }
    
    // Initialize navigation
    new Navigation();
    
    // Initialize skills animation
    new SkillsAnimation();
    
    // Initialize contact form
    new ContactForm();
    
    // Initialize scroll reveal
    new ScrollReveal();
    
    console.log('%c Moayad Portfolio ', 'background: linear-gradient(135deg, #00f5ff, #0080ff); color: #0a0a0f; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
    console.log('%c Built with Three.js & Tailwind CSS ', 'color: #00f5ff; font-size: 12px;');
});

// ===========================
// Performance Optimization
// ===========================

// Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Optimize scroll handlers
window.addEventListener('scroll', throttle(() => {
    // Parallax effect for hero section
    const hero = document.getElementById('home');
    if (hero) {
        const scrolled = window.scrollY;
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
}, 16));
