// Create stars for the background
/**
 * Represents the DOM element with the ID 'background-stars'.
 * This variable is used to access and manipulate the element
 * that likely represents the background stars in a visual context,
 * such as a webpage or application.
 */
const backgroundStars = document.getElementById('background-stars');
/**
 * Represents the count of stars.
 *
 * This variable holds the numerical value for the total number of stars.
 * The value is an integer that can be used for calculations or display
 * related to star-related counts or metrics.
 *
 * @type {number}
 */
const starCount = 350;  // Number of stars to create
/**
 * An array representing a collection of stars.
 * This array is intended to store information about stars,
 * which can include various properties of each star such as its name,
 * classification, brightness, or other relevant data.
 *
 * Note: The array is currently empty and can be populated with star objects or data as needed.
 */
let stars = [];  // Array to hold each star's position and speed

/**
 * Creates background stars by generating a specified number of star elements,
 * positioning them randomly on the screen, and adding them to a container.
 * The stars are then stored in a global array for further manipulation or animation.
 *
 * @return {void} This function does not return a value. It updates the DOM with star elements
 *                and populates the global star array.
 */
function createBackgroundStars() {
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.width = Math.random() * 2 + 'px';
        star.style.height = star.style.width;
        
        const starObj = {
            element: star,
            x: Math.random() * window.innerWidth,   // Random X position
            y: Math.random() * window.innerHeight,  // Random Y position
            speed: Math.random() * 0.2 + 0.05       // Small random speed for slow movement
        };
        
        star.style.top = starObj.y + 'px';
        star.style.left = starObj.x + 'px';
        
        backgroundStars.appendChild(star);
        stars.push(starObj);  // Add each star to the array
    }
}

/**
 * Animates the movement of star elements on the screen by updating their positions.
 * The stars are moved vertically based on their speed, and reset to the top of the screen
 * when they move out of view. Their positions are updated in a continuous animation loop.
 *
 * @return {void} This function does not return a value.
 */
function animateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        // star.x += star.speed * 0.1;
        if (star.y > window.innerHeight) {
            star.y = 0;  // Reset to top
            star.x = Math.random() * window.innerWidth;  // Reset X position
        }

        star.element.style.top = star.y + 'px';
        star.element.style.left = star.x + 'px';  // Update horizontal (X) position
    });

    requestAnimationFrame(animateStars);
}

createBackgroundStars();  // Create the stars
animateStars();  // Start the animation loop
