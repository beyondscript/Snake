<template>
    <main class="mainContainer">
    	<div class="scoreContainer">
	        <p class="score">
	            Score: <span id="scoreCounter">{{ scoreCounter }}</span>
	        </p>
	    </div>

	    <div class="canvasContainer">
	        <canvas ref="canvas" id="gameCanvas" width="288" height="288"></canvas>
	    </div>

	    <div class="controls" v-if="enableButtons == true">
	        <button class="button" @click="setDirection('LEFT')">
	            <i class="fa-solid fa-square-caret-left"></i>
	        </button>

	        <div>
	            <button class="button" @click="setDirection('UP')">
	                <i class="fa-solid fa-square-caret-up"></i>
	            </button>

	            <br>

	            <button class="button" @click="setDirection('DOWN')">
	                <i class="fa-solid fa-square-caret-down"></i>
	            </button>
	        </div>

	        <button class="button" @click="setDirection('RIGHT')">
	            <i class="fa-solid fa-square-caret-right"></i>
	        </button>
	    </div>

	    <div class="linkContainer">
	    	<Transition name="bounce" mode="out-in">
		    	<button class="gameButtons" type="button" @click="startGame" v-if="isGameStarted == false">Start</button>

		    	<div v-else>
		    		<Transition name="bounce" mode="out-in">
		    			<button class="gameButtons" type="button" @click="pauseGame" v-if="isGamePaused == false">Pause</button>
		    			<button class="gameButtons" type="button" @click="resumeGame" v-else>Resume</button>
		    		</Transition>
		    	</div>
		    </Transition>

	    	<router-link class="link" :to="{name: 'Home'}">Back</router-link>
	    </div>
    </main>
</template>

<script>
	import { ref, onMounted, onBeforeUnmount } from 'vue';
	import { Preferences } from '@capacitor/preferences';
	import { encrypt, decrypt } from "../../js/crypto.js";
	import Swal from 'sweetalert2';
	import { useRouter } from 'vue-router';

	export default {
	    setup() {
	        const canvas = ref(null)
	        const scoreCounter = ref(0)
	        const gridSize = 12
	        const snake = ref([{ x: 180, y: 180 }, { x: 168, y: 180 }, { x: 156, y: 180 }])
	        const router = useRouter()
	        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
	        const excludedKeys = ['enableButtons', 'enableSounds']
	        const enableButtons = ref(true)
        	const enableSounds = ref(true)
        	const opposite = {
		      	LEFT: "RIGHT",
		      	RIGHT: "LEFT",
		      	UP: "DOWN",
		      	DOWN: "UP"
		    }
		    const swipeThreshold = 25

	        let direction = "RIGHT"
	        let directionQueue = []
	        let score = 0
	        let encodedScore = null
	        let keys = null
	        let speed = 200
	        let speedIncreaser = 1
	        let redFoodEaten = 0
	        let blueFoodTimer = null
	        let nextBlueFoodAt = Math.floor(Math.random() * 5) + 5
	        let redFood = ref(null)
	        let blueFood = ref(null)
	        let touchStartX = 0, touchStartY = 0
	        let isGameStarted = ref(false)
	        let countGameLoops = 0
	        let isGamePaused = ref(false)
	        let gameLoopTimeout = null
	        let isGameOver = ref(false)
	        let mutedAudioBuffer = null
	        let fruitEatBuffer = null
			let superFruitEatBuffer = null
			let gameOverBuffer = null

	        function spawnFood() {
	        	const validPositions = []
			    const snakePositions = new Set(snake.value.map(seg => `${seg.x},${seg.y}`))

			    for (let x = 0; x < canvas.value.width; x += gridSize) {
			        for (let y = 0; y < canvas.value.height; y += gridSize) {
			            if (!snakePositions.has(`${x},${y}`)) {
			                validPositions.push({ x, y })
			            }
			        }
			    }

			    if (validPositions.length === 0) return null

			    const randomIndex = Math.floor(Math.random() * validPositions.length)

			    return validPositions[randomIndex]
	        }

	        function spawnBlueFood() {
	        	const validPositions = []
			    const snakePositions = new Set(snake.value.map(seg => `${seg.x},${seg.y}`))
			    const redPos = redFood.value ? `${redFood.value.x},${redFood.value.y}` : null

			    for (let x = 0; x < canvas.value.width; x += gridSize) {
			        for (let y = 0; y < canvas.value.height; y += gridSize) {
			            const key = `${x},${y}`

			            if (!snakePositions.has(key) && key !== redPos) {
			                validPositions.push({ x, y })
			            }
			        }
			    }

			    if (validPositions.length === 0) return null

			    const randomIndex = Math.floor(Math.random() * validPositions.length)

			    return validPositions[randomIndex]
	        }

	        const createAudioBuffer = async (audioUrl) => {
			    const response = await fetch(audioUrl, { cache: 'force-cache' })
			    const arrayBuffer = await response.arrayBuffer()

			    return await audioContext.decodeAudioData(arrayBuffer)
			}

			const playSound = (audioBuffer) => {
			    const source = audioContext.createBufferSource()

			    source.buffer = audioBuffer

			    source.connect(audioContext.destination)

			    source.start()
			}

	        const setDirection = (newDirection) => {
	        	if (!isGameStarted.value || isGamePaused.value) return

	            const lastDir = directionQueue.length > 0 ? directionQueue[directionQueue.length - 1] : direction

			    if (newDirection !== opposite[lastDir] && newDirection !== lastDir) {
			        if (directionQueue.length < 2) {
			          	directionQueue.push(newDirection)
			        }
			    }
	        }

	        const gameLoop = () => {
	        	if (!isGameStarted.value && countGameLoops == 1) return

	        	if (!canvas.value || isGamePaused.value) return

	        	if (isGameOver.value) return

	        	if (countGameLoops == 0) {
	        		countGameLoops++
	        	}

	            update()

	            draw()

	            gameLoopTimeout = setTimeout(gameLoop, speed)
	        }

	        const getScores = async(excludedKeys) => {
			  	const { keys } = await Preferences.keys()
			  	const filteredKeys = keys.filter(key => !excludedKeys.includes(key))
			  	const results = []

			  	for (const key of filteredKeys) {
			    	const { value } = await Preferences.get({ key })

			    	results.push({ key, score: decrypt(value) })
			  	}

			  	return results
			}

	        const saveScore = async() => {
    			keys = await getScores(excludedKeys)
    			keys = keys.length
    			
    			encodedScore = encrypt(score)

    			if (keys >= 1) {
    				keys++

    				await Preferences.set({
				        key: keys,
				        value: encodedScore
				    })
    			}
    			else {
    				await Preferences.set({
				        key: 1,
				        value: encodedScore
				    })
    			}
	        }

	        const resetGame = () => {
	        	clearTimeout(gameLoopTimeout)

				scoreCounter.value = 0

			  	score = 0

			  	speed = 200

			  	speedIncreaser = 1

			  	direction = "RIGHT"

			  	directionQueue = []

			  	snake.value = [{ x: 180, y: 180 }, { x: 168, y: 180 }, { x: 156, y: 180 }]

			  	redFood.value = spawnFood()

			  	blueFood.value = null

			  	redFoodEaten = 0

			  	isGameOver.value = false

			  	gameLoop()
			}

	        const update = () => {
	        	if (directionQueue.length > 0) {
			        direction = directionQueue.shift()
			    }

	            let head = { ...snake.value[0] }

	            const moves = { "LEFT": [-gridSize, 0], "UP": [0, -gridSize], "RIGHT": [gridSize, 0], "DOWN": [0, gridSize] }

	            head.x += moves[direction][0]
	            head.y += moves[direction][1]

	            if (snake.value.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
	            	if (enableSounds.value) {
	            		playSound(gameOverBuffer)
	            	}

	            	isGameOver.value = true

	                saveScore()

	                Swal.fire({
						title: 'Game over',
						html: `
							<div class="swalText" style="display: block;">Do you want to restart or go back?</div>
							<div class="swalButtonsContainer">
						    	<button id="swalRestartButton" class="swalButtons swalRestartButton">Restart</button>
						    	<button id="swalExitButton" class="swalButtons swalExitButton">Back</button>
						    </div>
						`,
						showConfirmButton: false,
  						showCancelButton: false,
						allowEscapeKey: false,
					    allowOutsideClick: false,
					    backdrop: true,
					    didOpen: () => {
						    const restartButton = document.getElementById('swalRestartButton')

						    restartButton.addEventListener('click', async() => {
						       	await Swal.close()

						        resetGame()
						    })

						    const exitButton = document.getElementById('swalExitButton')

						    exitButton.addEventListener('click', async() => {
						        await Swal.close()

						        router.push({ name: 'Home' })
						    })
						}
					})

					return
	            }

	            head.x = (head.x + canvas.value.width) % canvas.value.width
	            head.y = (head.y + canvas.value.height) % canvas.value.height

	            if (head.x === redFood.value.x && head.y === redFood.value.y) {
	            	if (enableSounds.value) {
	            		playSound(fruitEatBuffer)
	            	}

	                score += 5

	                redFoodEaten++

	                redFood.value = spawnFood()

	                speed = Math.max(50, speed - speedIncreaser)

	                if (redFoodEaten >= nextBlueFoodAt) {
	                    redFoodEaten = 0

	                    nextBlueFoodAt = Math.floor(Math.random() * 5) + 5

	                    if (speedIncreaser < 5) {
					        speedIncreaser++
					    }

	                    blueFood.value = spawnBlueFood()

	                    blueFoodTimer = setTimeout(() => {
	                        blueFood.value = null
	                    }, 5000)
	                }
	            }
	            else {
	                snake.value.pop()
	            }

	            if (blueFood.value && head.x === blueFood.value.x && head.y === blueFood.value.y) {
	            	if (enableSounds.value) {
	            		playSound(superFruitEatBuffer)
	            	}

	                score += 50

	                blueFood.value = null

	                clearTimeout(blueFoodTimer)
	            }

	            snake.value.unshift(head)

	            scoreCounter.value = score
	        }

	        const startGame = () => {
	        	if (enableSounds.value) {
	            	playSound(mutedAudioBuffer)
	            }

	        	isGameStarted.value = true

	        	gameLoop()

	        	window.addEventListener("keydown", handleKeydown)

	            canvas.value.addEventListener("touchstart", handleTouchStart)
	            canvas.value.addEventListener("touchend", handleTouchEnd)
	        }

	        const pauseGame = () => {
	        	isGamePaused.value = true

	        	window.removeEventListener("keydown", handleKeydown)

	            canvas.value.removeEventListener("touchstart", handleTouchStart)
	            canvas.value.removeEventListener("touchend", handleTouchEnd)
	        }

	        const resumeGame = () => {
	        	isGamePaused.value = false
	        	
	        	gameLoop()

	        	window.addEventListener("keydown", handleKeydown)

	            canvas.value.addEventListener("touchstart", handleTouchStart)
	            canvas.value.addEventListener("touchend", handleTouchEnd)
	        }

	        const draw = () => {
			    const ctx = canvas.value.getContext("2d")

			    ctx.fillStyle = "#8DA259"

			    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

			    ctx.fillStyle = "red"

			    ctx.beginPath()

			    ctx.arc(redFood.value.x + gridSize / 2, redFood.value.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2)

			    ctx.fill()

			    if (blueFood.value) {
			        ctx.fillStyle = "blue"

			        ctx.beginPath()

			        ctx.arc(blueFood.value.x + gridSize / 2, blueFood.value.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2)

			        ctx.fill()
			    }

			    ctx.fillStyle = "lime"

			    snake.value.forEach((segment, index) => {
			        const isHead = index === 0
			        const radius = isHead ? gridSize / 2 : gridSize / 2

			        ctx.beginPath()

			        ctx.arc(segment.x + gridSize / 2, segment.y + gridSize / 2, radius, 0, Math.PI * 2)

			        ctx.fill()
			    })
			}

	        const handleKeydown = (event) => {
	            const keyDirectionMap = {
	                ArrowLeft: "LEFT",
	                ArrowUp: "UP",
	                ArrowRight: "RIGHT",
	                ArrowDown: "DOWN"
	            }

	            if (keyDirectionMap[event.key]) {
	            	event.preventDefault()
	            	
	                setDirection(keyDirectionMap[event.key])
	            }
	        }

	        const handleTouchStart = (event) => {
	            touchStartX = event.touches[0].clientX
	            touchStartY = event.touches[0].clientY
	        }

	        const handleTouchEnd = (event) => {
				const touchEndX = event.changedTouches[0].clientX
				const touchEndY = event.changedTouches[0].clientY

				const diffX = touchEndX - touchStartX
				const diffY = touchEndY - touchStartY

				if (Math.abs(diffX) > Math.abs(diffY)) {
					if (Math.abs(diffX) > swipeThreshold) {
						setDirection(diffX > 0 ? "RIGHT" : "LEFT")
					}
				}
				else {
					if (Math.abs(diffY) > swipeThreshold) {
						setDirection(diffY > 0 ? "DOWN" : "UP")
					}
				}
			}

	        onMounted(async() => {
	        	if (localStorage.getItem('CapacitorStorage.enableButtons') !== null) {
		            enableButtons.value = JSON.parse(decrypt(localStorage.getItem('CapacitorStorage.enableButtons')))
	            }

	        	redFood.value = spawnFood()

	            blueFood.value = null

	            gameLoop()

	            canvas.value.addEventListener('touchmove', (e) => {
			        e.preventDefault()
			    }, { passive: false })

	            if (localStorage.getItem('CapacitorStorage.enableSounds') !== null) {
	            	enableSounds.value = JSON.parse(decrypt(localStorage.getItem('CapacitorStorage.enableSounds')))
	            }

	            if (enableSounds.value) {
	            	mutedAudioBuffer = await createAudioBuffer('/audios/mutedAudio.mp3')

	            	fruitEatBuffer = await createAudioBuffer('/audios/fruitEat.mp3')

	    			superFruitEatBuffer = await createAudioBuffer('/audios/superFruitEat.mp3')

	    			gameOverBuffer = await createAudioBuffer('/audios/gameOver.mp3')
	            }
	        })

	        onBeforeUnmount(() => {
	        	canvas.value.removeEventListener('touchmove', (e) => {
			        e.preventDefault()
			    })

	            window.removeEventListener("keydown", handleKeydown)

	            canvas.value.removeEventListener("touchstart", handleTouchStart)
	            canvas.value.removeEventListener("touchend", handleTouchEnd)
	        })

	        return {
	            canvas,
	            scoreCounter,
	            setDirection,
	            enableButtons,
	            isGameStarted,
	            startGame,
	            isGamePaused,
	            pauseGame,
	            resumeGame
	        }
	    }
	}
</script>

<style scoped>
	.mainContainer {
	    min-height: calc(var(--vh) * 100 - 154.4px);
	    margin-top: 10px;
	}

	.scoreContainer {
	    display: flex;
	    justify-content: center;
	    margin-bottom: 10px;
	}

	.score {
	    font-size: 16px;
	    color: darkcyan;
	    margin: 0;
	}

	.canvasContainer {
	    display: flex;
	    justify-content: center;
	}

	canvas {
	    display: block;
	}

	.controls {
	    display: flex;
	    justify-content: center;
	    margin-top: 10px;
	}

	.button {
	    width: 48px;
	    height: 48px;
	    font-size: 24px;
	    background-color: #333333;
	    color: #00A6ED;
	    cursor: pointer;
	    border-radius: 5px;
	    border: none;
	    margin: 5px;
	    -webkit-tap-highlight-color: transparent;
	}

	.linkContainer {
		justify-content: center;
		gap: 10px;
		padding-bottom: 10px;
		margin-top: 10px;
	}

	.gameButtons {
		height: 36px;
	    width: 108px;
	    display: flex;
	    background-color: darkcyan;
	    color: #ffffff;
	    font-size: 18px;
	    text-decoration: none;
	    justify-content: center;
	    align-items: center;
	    border: none;
	    border-radius: 5px;
	    cursor: pointer;
	    -webkit-tap-highlight-color: transparent;
	}

	.link {
		background-color: darkred;
	}
</style>
