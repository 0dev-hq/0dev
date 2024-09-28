 // Mobile menu toggle
 const menuToggle = document.getElementById('menu-toggle');
 const mobileMenu = document.getElementById('mobile-menu');
 menuToggle.addEventListener('click', () => {
   mobileMenu.classList.toggle('hidden');
 });

 // JavaScript for spinning and resizing background image
 const backgroundImage = document.getElementById('background-image');
 
 let scale = .1;
 let rotation = 0;
 const animationSpeed = 0.001;

 function animateBackground() {
   rotation += animationSpeed;
   scale = 0.5 + Math.sin(rotation) * 0.1;

   backgroundImage.style.transform = `rotate(${rotation * 360}deg) scale(${scale})`;

   requestAnimationFrame(animateBackground);
 }

 backgroundImage.style.backgroundImage = 'url("/assets/background.jpg")';
 backgroundImage.style.transition = 'transform 0.1s linear';

 // Start animation
 animateBackground();