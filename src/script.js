/////////////////////////////////////////////////////////////////////////
///// IMPORT
import './main.css'
import * as THREE from 'three'
//import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'

// import { injectSpeedInsights } from '@vercel/speed-insights';        //se lo installi si bugga tutto...non funziona più il npm run dev, fai solamente all'ultima build definitiva

// injectSpeedInsights();
/////////////////////////////////////////////////////////////////////////
const circle = document.querySelector('.cursor');
const links = document.querySelectorAll('a');

window.addEventListener("mousemove", moveCircle);
const navbar = document.querySelector('.navbar');
navbar.addEventListener("click", () => {
    // window.open('https://dumbospace.it/', '_blank');
    isZoom = true;
    points.forEach((point) => {
        point.element.classList.remove('visible');
    });
    disableOrbitControlsLimits();
    animateCamera();
    // toggleVisibility(null, true);
    linkAnimOut();
    sideWindow.classList.remove('visible');
    for(let i = 0; i < sideWindowContent.length; i++){
        sideWindowContent[i].element.classList.remove('visible');
    }
})
gsap.set(circle, {
    xPercent: -50,
    yPercent: -50
});

function moveCircle(e) {
    gsap.set(circle, {
        x: e.clientX,
        y: e.clientY
    });
}

function linkAnimIn(value) {
    circle.classList.add('difference');
    gsap.to(circle, {
        duration: 0.3,
        scale: value
    })
}

function linkAnimOut() {
    circle.classList.remove('difference');
    gsap.to(circle, {
        duration: 0.3,
        scale: 1
    })
}

// Add an event listener to the window object
// window.addEventListener('DOMContentLoaded', (event) => {        //per mobile
//     // Check if the browser is running on a mobile device
//     if (window.matchMedia('(max-width: 768px)').matches) {
//       // Add a class to the body element to hide the address bar
//     document.body.classList.add('hide-address-bar');
//     }
// });


//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER

const loadingBarElement = document.querySelector('.loading-video')
const titleElement = document.querySelector('.title')
const buttonElement = document.querySelector('.button-container')
    buttonElement.addEventListener('mouseover', e => {
        linkAnimIn(1.6);})
    buttonElement.addEventListener('mouseout', e => {
        linkAnimOut();})
const loadingManager = new THREE.LoadingManager(
    () => { // Loading complete
        // console.log('Loading complete...')
        gsap.delayedCall(0.5, () =>{                //gsap animation after 0.5 seconds  
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value: 1})
            loadingBarElement.classList.add('ended')
            // loadingBarElement.style.transform = ''
        })
        // ...
        
        // Remove the loading bar after the animation
        gsap.delayedCall(2, () => {
            // Animate the title to fade in and move to the center
            gsap.to(titleElement, { duration: 0.5, opacity: 1 })
            gsap.to(titleElement, { duration: 1, y: '50%', ease: 'power2.out' })
            gsap.to(buttonElement, { duration: 0.7, opacity: 1 ,delay: 1})
            gsap.to(buttonElement, { duration: 1, y: '50%', delay: 1, ease: 'power2.out' })
            loadingBarElement.style.display = 'none';
            loadingBarElement.remove(loadingBarElement);
        })
        
    },
    (item, loaded, total) => {   // Progress
        // const progressRatio = loaded / total
        // // console.log(`${(loaded / total * 100).toFixed(2)}% ${item}`)
        // loadingBarElement.style.transform = `scaleX(${progressRatio})`
    },
    (error) => {    // Error
        console.error('Error loading:', error)
    }
)

const dracoLoader = new DRACOLoader(loadingManager)
const loader = new GLTFLoader(loadingManager)
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
dracoLoader.setDecoderConfig({ type: 'js' })
loader.setDRACOLoader(dracoLoader)

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div')
document.body.appendChild(container)

/////////////////////////////////////////////////////////////////////////

///// SCENE CREATION
const scene = new THREE.Scene()
scene.background = new THREE.Color('#d6e5ff')


// Create a fog effect
const fog = new THREE.FogExp2(0xd6e5ff, 0.003); // Use exponential fog
// const fog = new THREE.Fog(0x000000, 0.002); // Use linear fog

// Add the fog to the scene
scene.fog = fog;

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true}) // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight) // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding // set color encoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5


container.appendChild(renderer.domElement) // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 10, 2000)
camera.position.set(180, 100, 40)
scene.add(camera)

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
let width = window.innerWidth
let height = window.innerHeight
window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/////////////////////////////////////////////////////////////////////////
// Axes Helper
// const axesHelper=new THREE.AxesHelper(5)
// scene.add(axesHelper)

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)

/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0x696969, 0.9)
scene.add(ambient)

const sunLight = new THREE.DirectionalLight(0xb4b78a, 0.55)
sunLight.position.set(9,70,4.1)
scene.add(sunLight)


// const cameraHelper = new THREE.CameraHelper(sunLight.shadow.camera)
// scene.add(cameraHelper)
/////////////////////////////////////////////////////////////////////////

////////////Sun and Moon///////////////
document.querySelector('#checkbox').addEventListener('change', () => {
    toggleLigthMode();
});

let isLightOn = true;
function toggleLigthMode() {
    if (isLightOn) {
        gsap.to(ambient, {
            intensity: 0.0,
            duration: 1
        })
        gsap.to(sunLight, {
            intensity: 0.0,
            duration: 1,
            onComplete: function(){
                strada.visible = false;
            }
        },)        
        isLightOn = false;
        //remove visiblity to strada
    } else {
        gsap.to(ambient, {
            intensity: 0.9,
            duration: 1
        })
        gsap.to(sunLight, {
            intensity: 0.55,
            duration: 1
        }) 
        strada.visible = true;
        isLightOn = true;
    }
    
}
/////////////////////////////////////////////////////////////////////////
// Add event listener to the button
const button = document.querySelector('.my-button')
// Delay the event listener by 1 second
setTimeout(function() {
    button.addEventListener('click', function() {
        isIntro = false;
        linkAnimOut();
    if(!isIntro) {
        changeUAlphaValue()
        introAnimation();
        // Make the button disappear
        buttonElement.style.opacity = '0'
        buttonElement.remove(button)
        // Make the title disappear
        // titleElement.style.opacity = '0'
        // titleElement.parentNode.removeChild(titleElement)
        gsap.to(titleElement, {
            duration: 3,
            top: -250,
            delay: 1,
            // opacity: 0,
            scale: 3,
            onComplete: function(){
                titleElement.style.opacity = '0'
                titleElement.parentNode.removeChild(titleElement)
            }
        });


    }
    })
}, 4000) // 1000 milliseconds = 1 second
// Function to change the uAlpha value
function changeUAlphaValue() {
    gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value: 0.0, })
}
//////////////////////////////////////////////////////////////////////////

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms:{
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main() {
            gl_FragColor = vec4(255.0, 255.0, 255.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

////////////////////////////////////////////////////////////////////////


///// LOADING GLB/GLTF MODEL FROM BLENDER
// let myModel;
// let spazioBianco;
// let binarioCentrale;
// let baia;
// let vascello;
// let temporanea;
// let officina;
let alberi;
let alberi2;
let strada;

loader.load('models/gltf/DumboMappa3D.glb', function (gltf) {
    const children = [...gltf.scene.children];
    for (const child of children) {
        scene.add(child)
        console.log(child);
        switch (child.name){
            case 'Albero1':
                alberi = child;
                alberi.children[1].material.opacity = 1;
                break;
            case 'Albero2':
                alberi2 = child;
                alberi2.children[1].material.opacity = 1.5;
                break;
        //     case 'Spazio_Bianco_(Bianco)':
        //         spazioBianco = child;
        //         // console.log(spazioBianco.children[1].material);
        //         for(let i = 0; i < spazioBianco.children.length; i++){
        //         }
        // console.log(child.name)
        //         break;
        //     case 'Binario Centrale':
        //         binarioCentrale = child;
        // console.log(child.name)
        //         break;
        //     case 'Baia':
        //         baia = child;
        // console.log(child.name)
        //         break;
        //     case 'Vascello_(Rosso)':
        //         vascello = child;
        // console.log(child.name)
        //         break;
        //     case 'Temporanea_(Magenta)001':
        //         temporanea = child;
        // console.log(child.name)
        //         break;
        //     case 'Officina_(Petrolio)':
        //         officina = child;                
        // console.log(child.name)
        //         break;
            case 'Strada':
                strada = child
        console.log(child.name)
            default:
                break;
        }
    }
})

function ToggleTreeVisibility(visibility){
    if(visibility){
        gsap.to(alberi.position, {duration: 2, x: alberi.position.x, y: 0, z: alberi.position.z})
        gsap.to(alberi2.position, {duration: 2, x: alberi2.position.x, y: 0, z: alberi2.position.z})
    }
    else{
        gsap.to(alberi.position, {duration: 2, x: alberi.position.x, y: -22, z: alberi.position.z})
        gsap.to(alberi2.position, {duration: 2, x: alberi2.position.x, y: -22, z: alberi2.position.z})
    }
}

//POI: Points Of INTEREST
const points = [
    {
        position: new THREE.Vector3(3, 2, 18),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-100, 2, -18),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(-115, 2, 45),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(-120, 2, 15),
        element: document.querySelector('.point-3')
    },
    {
        position: new THREE.Vector3(-120, 2, -15),
        element: document.querySelector('.point-4')
    },
    {
        position: new THREE.Vector3(100,  2, 6),
        element: document.querySelector('.point-5')
    },
    {
        position: new THREE.Vector3(-255, 2, -20),
        element: document.querySelector('.point-6')
    },
]

// Get the side window
const sideWindow = document.querySelector('.side-window');
// Get the side window content
const sideWindowContent=[
    {element: sideWindow.querySelector('.content0')},
    {element: sideWindow.querySelector('.content1')},
    {element: sideWindow.querySelector('.content2')},
    {element: sideWindow.querySelector('.content3')},
    {element: sideWindow.querySelector('.content4')},
    {element: sideWindow.querySelector('.content5')},
    {element: sideWindow.querySelector('.content6')}
]

//GET Exit Button
const exitButton = document.querySelector('.exit-button');
    exitButton.addEventListener('mouseover', e => {
        linkAnimIn(1.6);})
    exitButton.addEventListener('mouseout', e => {
        linkAnimOut();})

//Get Link Button
const linkButton = document.querySelector('.side-my-button');
    linkButton.addEventListener('mouseover', e => {
        linkAnimIn(1.6);})
    linkButton.addEventListener('mouseout', e => {
        linkAnimOut();})


// Function to update the side window background image
function updateSideWindowBackground(imageURL) {
    sideWindow.style.backgroundImage = `url(${imageURL})`;
}

/////////////////////////////////////////////////////////////////////////
let isIntro = new Boolean();
isIntro = true;
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
    controls.enabled = false; // Disable orbit controls to animate the camera
    isZoom = true;
    // Initial camera position
    camera.position.set(377, 80, 280);        //PUNTO 1
    camera.rotation.set(-0.42, 0.85, 0.32);
    // Animate camera position and rotation
    gsap.to(camera.position, {      //PUNTO 2 (DUMBO CUBI):
        duration: 4,
        delay: 1,
        x: 86.1,
        y: 12,
        z: 49.3,
        ease: "power1.out", // Easing function for smooth transition
        onComplete: function()  //Only once Completed the animation, do... p.s. puoi usare anche: () => 
        {
            gsap.to(camera.position, {      //PUNTO 3 (SPAZIO BIANCO DI LATO):
                duration: 3.5,
                delay: .2,
                x: -110,
                y: 16,
                z: 61.5,
                ease: "power1.inOut", // Easing function for smooth transition
                onComplete: function(){
                    gsap.to(camera.position, {      //PUNTO 4 (IN FONDO, INTERRAIL):
                        duration: 3,
                        delay: .5,
                        x: -253,
                        y: 25,
                        z: 70,
                        ease: "power1.inOut", // Easing function for smooth transition
                        onComplete: function(){
                            gsap.to(camera.position, {      //PUNTO 6 (OFFICINA):
                                duration: 5,
                                delay: 0.5,
                                x: 20.4,
                                y: 20.9,
                                z: 13,
                                ease: "power1.inOut", // Easing function for smooth transition
                                onComplete: function(){
                                    gsap.to(camera.position, {      //PUNTO HOME:
                                        duration: 2,
                                        delay: 0,
                                        x: 112,
                                        y: 108,
                                        z: 155,
                                        ease: "power1.in", // Easing function for smooth transition
                                        onComplete: function(){
                                            isZoom = false;
                                            points.forEach(point => {
                                                point.element.addEventListener('mouseover', e => {
                                                    linkAnimIn(0.6);
                                                });
                                                point.element.addEventListener('mouseout', e => {
                                                    linkAnimOut();
                                                });
                                                point.element.classList.add('visible')
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    });

    gsap.to(camera.rotation, {      //PUNTO 2 (DUMBO CUBI):
        duration: 4,
        delay: 1,
        x: -0.12,
        y: 0.89,
        z: 0.09,
        ease: "power1.out", // Easing function for smooth transition
        onComplete: function()  //Only once Completed the animation, do... p.s. puoi usare anche: () => 
        {
            gsap.to(camera.rotation, {      //PUNTO 3 (SPAZIO BIANCO DI LATO):
                duration: 3.5,
                delay: .2,
                x: -0.07,
                y: -0.1,
                z: 0.01,
                ease: "power1.inOut", // Easing function for smooth transition
                onComplete: function(){
                    gsap.to(camera.rotation, {      //PUNTO 4 (IN FONDO, INTERRAIL):
                        duration: 3,
                        delay: 0.5,
                        x: -0.1,
                        y: -0.80,
                        z: -0.1,
                        ease: "power1.inOut", // Easing function for smooth transition
                        onComplete: function(){
                            gsap.to(camera.rotation, {      //PUNTO 6 (OFFICINA):
                                duration: 5,
                                delay: 0.5,
                                x: -0.16,
                                y: -1.18,
                                z: -0.14,
                                ease: "power1.inOut", // Easing function for smooth transition
                                onComplete: function(){
                                    gsap.to(camera.rotation, {      //PUNTO HOME:
                                        duration: 2,
                                        delay: 0,
                                        x: -0.61,
                                        y: 0.54,
                                        z: 0.34,
                                        ease: "power1.in", // Easing function for smooth transition
                                        
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    });
}
// introAnimation(); // Call intro animation on start

// Add event listeners to the points
let cameraTarget = new THREE.Vector3(0.0,0.0,0.0);
let cameraPointPosition = new THREE.Vector3(0.0,0.0,0.0);
let cameraRotation = new THREE.Euler(0,0,0, 'XYZ');
let isZoom = new Boolean();
isZoom = false;
points.forEach((point, index) => {
    point.element.addEventListener('click', () => {
        // controls.enabled = false; // Disable orbit controls to animate the camera
        // Handle the click event for the point

        if (!isIntro)
        {
            linkAnimOut();
            
            // disableOrbitControlsLimits();
            switch(index) {
                case 0:
                    // toggleVisibility(spazioBianco, false);
                    // cameraTarget = new THREE.Vector3(-3, 5, 13);
                    cameraPointPosition = new THREE.Vector3(27, 9.8, 32.6);
                    cameraRotation = new THREE.Euler(-0.14, 0.99, 0.11, 'XYZ');
                    updateSideWindowBackground('https://cdn.zero.eu/uploads/2021/06/dumbo-6.jpeg');
                    manageWidget(index);
                    break;
                case 1:
                    // toggleVisibility(binarioCentrale, false);
                    // cameraTarget = new THREE.Vector3(-5, 5, -18);
                    cameraPointPosition = new THREE.Vector3(-122, 8, 3.2);
                    cameraRotation = new THREE.Euler(-0.16, -1.08, -0.14, 'XYZ');
                    updateSideWindowBackground('https://dumbospace.it/wp-content/uploads/2017/06/binario-centrale-copertina-800x600.jpg');
                    manageWidget(index);
                    break;
                case 2:
                    // toggleVisibility(baia, false);
                    // cameraTarget = new THREE.Vector3(-120, 5, 40);
                    cameraPointPosition = new THREE.Vector3(-105, 6.5, 51);
                    cameraRotation = new THREE.Euler(-0.18, 1.13, 0.16, 'XYZ');
                    updateSideWindowBackground('https://dumbospace.it/wp-content/uploads/2017/06/baia-semivuota-allestimento-1-800x600.jpg');
                    manageWidget(index);
                    break;
                case 3:
                    // toggleVisibility(vascello, false);
                    // cameraTarget = new THREE.Vector3(-120, 5, 13);
                    cameraPointPosition = new THREE.Vector3(-104, 8.7, 30);
                    cameraRotation = new THREE.Euler(-0.25, 0.84, 0.18, 'XYZ');
                    updateSideWindowBackground('https://dumbospace.it/wp-content/uploads/2019/06/5a-800x600.jpg');
                    manageWidget(index);
                    break;
                case 4:
                    // toggleVisibility(temporanea, false);
                    // cameraTarget = new THREE.Vector3(-120, 5, -18);
                    cameraPointPosition = new THREE.Vector3(-100, 9.5, -4.9);
                    cameraRotation = new THREE.Euler(-0.25, 0.84, 0.18, 'XYZ');
                    updateSideWindowBackground('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/a3/d7/5a/caption.jpg?w=1100&h=-1&s=1');
                    manageWidget(index);
                    break;
                case 5:
                    // toggleVisibility(officina, false);
                    // cameraTarget = new THREE.Vector3(100, 5, -18);
                    cameraPointPosition = new THREE.Vector3(77, 15, 16.5);
                    cameraRotation = new THREE.Euler(-0.44, -1.14, -0.41, 'XYZ');
                    updateSideWindowBackground('https://dumbospace.it/wp-content/uploads/2021/11/QUESTA-800x600.jpg');
                    manageWidget(index);
                    break;
                case 6:
                    // toggleVisibility(officina, false);
                    // cameraTarget = new THREE.Vector3(100, 5, -18);
                    cameraPointPosition = new THREE.Vector3(-262, 9.6, -9.3);
                    cameraRotation = new THREE.Euler(-0.11, -0.77, -0.11, 'XYZ');
                    updateSideWindowBackground('https://dumbospace.it/wp-content/uploads/2019/07/Capannone-edited-800x600.jpg');
                    manageWidget(index);
                    break;
                default:
                    console.error('Invalid point index');
            }
            animateCamera(index);
        }
    });
});
/////////////////////////////////////////////////////////////////////////

//FUNCTION to manage the widget

function manageWidget(index){
    if(!isZoom){
        sideWindow.classList.add('visible');
        sideWindowContent[index].element.classList.add('visible');
    }
    else{
        sideWindow.classList.remove('visible');
        for(let i = 0; i < sideWindowContent.length; i++){
            sideWindowContent[i].element.classList.remove('visible');
        }
    }
}

/////////////////////////////////////////////////////////////////////////
const pointLight = new THREE.PointLight( 0xffffff, 0, 70 );
pointLight.castShadow = true;
pointLight.power = 0;
let isPointOfInterest = false;
//Function to animate the camera to the target point
function animateCamera(index){
    if(isZoom === false){
        if(!isLightOn){
            pointLight.power = 0;
            //add a point light in the position of the clicked point
            pointLight.position.x = points[index].position.x + 20 ;
            pointLight.position.y = points[index].position.y + 50;
            pointLight.position.z = points[index].position.z + 3 ;
            if(index == 0){     //spazio bianco case
                pointLight.position.x = points[index].position.x;
                pointLight.position.y = points[index].position.y + 50;
                pointLight.position.z = points[index].position.z - 5;
            }
            if(index == 1){     //binario centrale case
                pointLight.position.x = points[index].position.x - 10 ;
                pointLight.position.y = points[index].position.y + 50;
                pointLight.position.z = points[index].position.z + 5 ;
            }
            if(index == 2){     //baia case
                pointLight.distance = 60; 
                pointLight.position.x = points[index].position.x + 5 ;
                pointLight.position.y = points[index].position.y + 50;
                pointLight.position.z = points[index].position.z - 8 ;
            }
            if(index == 5){     //officina case
                pointLight.position.x = points[index].position.x - 10 ;
                pointLight.position.y = points[index].position.y + 50;
                pointLight.position.z = points[index].position.z - 5 ;
            }

            scene.add(pointLight);
            gsap.to(pointLight, {
                power: 50,
                duration: 5,
            })
        }
        isZoom = true;
        //remove visible from points
        points.forEach((point) => {
            point.element.classList.remove('visible');
        });
        disableOrbitControlsLimits();
        // console.log('Was at home position, going to target position')
        if(index == 6){         //casi speciali in cui non si zooma
            exitButton.classList.add('visible');
            isZoom = true;
            isPointOfInterest = true;
            return;
        }
        ToggleTreeVisibility(false);
        gsap.to(camera.rotation, {
            duration: 2.5,
            x: cameraRotation.x,
            y: cameraRotation.y,
            z: cameraRotation.z,
            ease: "power1.inOut",
        });

        gsap.to(camera.position, {
            duration: 2.5,
            x: cameraPointPosition.x,
            y: cameraPointPosition.y,
            z: cameraPointPosition.z,
            ease: "power2.inOut",
            onComplete: function()  //Only once Completed the animation, do... p.s. puoi usare anche: () => 
                {   
                    exitButton.classList.add('visible');
                    isZoom = true;
                }
                
        });
    }
    else{
        if(!isLightOn){
        gsap.to(pointLight, {
                power: 0,
                duration: 1.5,
                onComplete: function(){
                    //erase the point light from the scene
                    if(pointLight){
                        scene.remove(pointLight);
                    }
                }
            })
        }
        // console.log('Not at home position, returning to home position')
        exitButton.classList.remove('visible');
        if(isPointOfInterest){         //casi speciali in cui non si zooma
            points.forEach((point) => {
                point.element.classList.add('visible');
            });
            isZoom = false;
            isPointOfInterest = false;
            return;
        }
        ToggleTreeVisibility(true);
        // ToggleTreeVisibility(true);
        gsap.to(camera.rotation, {
            duration: 2.5,
            x: -0.61,
            y: 0.54,
            z: 0.34,
            ease: "power1.in",
        })
        gsap.to(camera.position, {
            duration: 2.5,
            x: 112,
            y: 108,
            z: 155,
            ease: "power1.in",
            onComplete: function()  //Only once Completed the animation, do... p.s. puoi usare anche: () => 
                {
                    //add visible to points
                    points.forEach((point) => {
                        point.element.classList.add('visible');
                    });

                    setOrbitControlsLimits();
                    isZoom = false;
                }
        });
        
    }
}

////////////////////////////////////////////////////////////////////////

/////////Link button//////////////

linkButton.addEventListener('click',() => {
    // Add your code to handle the link button click event here
    // Open the link in a new tab or window
    linkAnimOut();
    window.open('https://www.google.com', '_blank');
});

////////////////////////////////////////////////////////////////////////

/////////EXIT BUTTON//////////////

exitButton.addEventListener('click', () => {
    // Add your code to handle the exit button click event here
    // console.log('Exit button clicked');
    animateCamera();
    // toggleVisibility(null, true);

    linkAnimOut();
    sideWindow.classList.remove('visible');
    for(let i = 0; i < sideWindowContent.length; i++){
        sideWindowContent[i].element.classList.remove('visible');
    }
});

////////////////////////////////////////////////////////////////////////

//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 15
    controls.maxDistance = 500
    controls.enableRotate = false
    //Orizontal Limit rotation
    // controls.minAzimuthAngle = -Math.PI / 2
    // controls.maxAzimuthAngle = Math.PI /2
    //
    controls.enableZoom = false
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI /2.1
}

function disableOrbitControlsLimits(){
    controls.enableZoom = false   
    controls.enableRotate = false 
}
/////////////////////////////////////////////////////////////////////////

camera.rotation.set(-0.6,0.5,0.34);

let temp;

///////////////////////Mouse Dragging to move camera/////////////////////////

let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};
let dampingFactor = 0.5; // Adjust this value to control the damping effect (0.0 - 1.0)

// Define the boundaries for the camera movement
const cameraBounds = {
    // minX: -150,
    // maxX: 200,
    // minZ: 0,
    // maxZ: 250
    minX: -500,
    maxX: 700,
    minZ: -500,
    maxZ: 750
};

document.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
}, false);

document.addEventListener('mouseup', (e) => {
    e.preventDefault();
    isDragging = false;
}, false);

document.addEventListener('mousemove', (e) => {
    e.preventDefault();

    if (isDragging && !isZoom) {
        const deltaMove = {
            x: (e.clientX - previousMousePosition.x) * dampingFactor,
            y: (e.clientY - previousMousePosition.y) * dampingFactor
        };

        // Adjust these values to control the sensitivity of the camera movement
        const moveSpeed = 0.2;

        camera.position.x -= deltaMove.x * moveSpeed;
        camera.position.z -= deltaMove.y * moveSpeed; // Change Y movement to Z

        // Keep the Y position constant
        camera.position.y = camera.position.y;

        // Apply the boundaries
        camera.position.x = Math.max(cameraBounds.minX, Math.min(cameraBounds.maxX, camera.position.x));
        camera.position.z = Math.max(cameraBounds.minZ, Math.min(cameraBounds.maxZ, camera.position.z));
    }
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
}, false);
//////////////////////////////////////////////////////////////////////
controls.autoRotate = false

//// RENDER LOOP FUNCTION
function rendeLoop() {
    
    // Update point positions based on camera position
    if(!isZoom && !isIntro){
        for(const point of points)
            {
                let screenPosition = point.position.clone()
                screenPosition.project(camera)
                let translateX = screenPosition.x * width * 0.5
                let translateY = - screenPosition.y * height * 0.5
                temp = point.element.style.transform
                point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
                if(temp != point.element.style.transform){
                    // remove the visible class from points

                    if(isDragging){
                        points.forEach((point) => {
                            point.element.classList.remove('visible');
                        })
                    }

                }
                else{
                    // point.element.style.transform = `translate(${translateX}px, ${translateY}px)`

                    // add the visible class from points
                    if(!isDragging){
                        points.forEach((point) => {
                        point.element.classList.add('visible');
                        })
                    }
            }
        }
    }
    if(isIntro){
        controls.update() // update orbit controls
    }
    
    renderer.render(scene, camera) // render the scene using the camera

    requestAnimationFrame(rendeLoop) //loop the render function
    
}

rendeLoop() //start rendering