
import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import Webcam from 'react-webcam';

const WebcamPose = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [repCount, setRepCount] = useState(0);
    const [isUp, setIsUp] = useState(false);

    const runPosenet = async () => {
        await tf.setBackend('webgl');
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        setInterval(() => {
            detect(detector);
        }, 100);
    };

    const detect = async (detector) => {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            const poses = await detector.estimatePoses(video);
            drawCanvas(poses, videoWidth, videoHeight, canvasRef);
            countReps(poses);
        }
    };

    const drawCanvas = (poses, videoWidth, videoHeight, canvas) => {
        const ctx = canvas.current.getContext("2d");
        canvas.current.width = videoWidth;
        canvas.current.height = videoHeight;

        poses.forEach(({ keypoints }) => {
            keypoints.forEach(keypoint => {
                if (keypoint.score > 0.5) {
                    ctx.beginPath();
                    ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#00FF00';
                    ctx.fill();
                }
            });
        });
    };
    
    // Simple bicep curl rep counter
    const countReps = (poses) => {
        if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            const shoulder = keypoints.find(k => k.name === 'left_shoulder');
            const elbow = keypoints.find(k => k.name === 'left_elbow');
            const wrist = keypoints.find(k => k.name === 'left_wrist');

            if (shoulder && elbow && wrist && shoulder.score > 0.5 && elbow.score > 0.5 && wrist.score > 0.5) {
                const angle = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) - Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
                const angleDegrees = Math.abs(angle * 180 / Math.PI);

                if (angleDegrees > 160 && !isUp) {
                    setIsUp(true);
                }
                if (angleDegrees < 60 && isUp) {
                    setRepCount(prevCount => prevCount + 1);
                    setIsUp(false);
                }
            }
        }
    };

    useEffect(() => { runPosenet() }, []);

    return (
        <div>
            <Webcam
                ref={webcamRef}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zIndex: 9,
                    width: 640,
                    height: 480,
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zIndex: 9,
                    width: 640,
                    height: 480,
                }}
            />
            <div style={{ position: 'absolute', top: '500px', left: '10px', color: 'white', fontSize: '24px' }}>
                Reps: {repCount}
            </div>
        </div>
    );
};

export default WebcamPose;
