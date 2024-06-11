async function setupCamera() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false
    });
    video.srcObject = stream;
    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function main() {
    const video = await setupCamera();
    video.play();

    const model = await handpose.load();

    const leftCanvas = document.getElementById('izquierdaCanvas');
    const rightCanvas = document.getElementById('derechaCanvas');
    const leftCtx = leftCanvas.getContext('2d');
    const rightCtx = rightCanvas.getContext('2d');

    async function detectHands() {
        const predictions = await model.estimateHands(video);

        leftCtx.clearRect(0, 0, leftCanvas.width, leftCanvas.height);
        rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);

        const hands = { left: null, right: null };

        predictions.forEach(prediction => {
            const landmarks = prediction.landmarks;
            const handType = prediction.label;

            if (handType === 'left') {
                hands.left = landmarks;
            } else if (handType === 'right') {
                hands.right = landmarks;
            }
        });

        if (hands.left) {
            drawHand(hands.left, leftCtx);
        }

        if (hands.right) {
            drawHand(hands.right, rightCtx);
        }

        requestAnimationFrame(detectHands);
    }

    function drawHand(landmarks, ctx) {
        for (let i = 0; i < landmarks.length; i++) {
            const [x, y] = landmarks[i];
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
        }
    }

    detectHands();
}

main();
