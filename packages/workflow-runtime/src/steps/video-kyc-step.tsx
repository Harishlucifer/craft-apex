import React, { useState, useEffect, useRef } from "react";
import { registerStepComponent, type StepComponentProps } from "../step-component-registry";
import { Card, CardContent, Button, toast } from "@craft-apex/ui";

const VideoKycStep = ({ step, value, onChange, context }: StepComponentProps) => {
    const [cameraAllowed, setCameraAllowed] = useState<boolean | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [showCameraLoader, setShowCameraLoader] = useState(true);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    // Start camera on mount
    useEffect(() => {
        let mounted = true;
        const startCamera = async () => {
            setCameraAllowed(false);
            setShowCameraLoader(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: true
                });
                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                streamRef.current = stream;
                setCameraAllowed(true);
                setShowCameraLoader(false);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Camera error:", error);
                if (mounted) {
                    setCameraAllowed(false);
                    setShowCameraLoader(false);
                }
            }
        };

        startCamera();
        return () => {
            mounted = false;
            stopCamera();
        };
    }, []);

    // Recording timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (cameraAllowed && videoRef.current && streamRef.current && !recordedVideoUrl && !showResult) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [cameraAllowed, recordedVideoUrl, showResult]);

    const startRecording = () => {
        if (!streamRef.current) return;

        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedVideoUrl(url);

            // Also notify form state if needed
            onChange({ ...value, videoBlobUrl: url });
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const retakeVideo = () => {
        setRecordedVideoUrl(null);
        recordedChunksRef.current = [];
        setShowResult(false);
        onChange({ ...value, videoBlobUrl: null });

        // Re-attach stream
        if (cameraAllowed && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(e => console.error(e));
        }
    };

    const handleProceed = () => {
        toast.success("Analyzing your video for document verification...");
        setTimeout(() => {
            stopCamera();
            setShowResult(true);
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (showResult && recordedVideoUrl) {
        return (
            <div className="w-full max-w-4xl mx-auto space-y-6">
                <Card className="border-0 shadow-lg  overflow-hidden bg-white">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center">
                                <i className="ri-shield-check-fill text-3xl"></i>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-1">Verification Successful</h4>
                                <p className="text-emerald-100 text-sm">Your video has been recorded and analyzed.</p>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6 sm:p-8 text-center space-y-6">
                        <div className="alert alert-success border-0 mb-3 rounded-3 flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 p-4">
                            <i className="ri-checkbox-circle-fill text-xl"></i>
                            <span className="font-bold">You can proceed to the next step.</span>
                        </div>
                        <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-md max-w-2xl mx-auto">
                            <video
                                src={recordedVideoUrl}
                                controls
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <Button variant="outline" onClick={retakeVideo} className="mt-4">
                            <i className="ri-refresh-line mr-2"></i> Retake Video
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg rounded-[2rem] overflow-hidden bg-white">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center">
                            <i className="ri-video-fill text-white text-3xl"></i>
                        </div>
                        <div className="text-white">
                            <h4 className="text-xl font-bold mb-1">Video KYC Verification</h4>
                            <p className="text-blue-100 text-sm">
                                Record a video showing your documents
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-6 sm:p-8 text-center">
                    {/* Instructions */}
                    {cameraAllowed && !isRecording && !recordedVideoUrl && (
                        <div className="bg-blue-50/50 border border-blue-100 flex items-start gap-3 mb-6 p-4 rounded-2xl text-left">
                            <i className="ri-information-fill text-2xl text-blue-500 mt-1"></i>
                            <div>
                                <h6 className="font-bold text-slate-800 mb-2">Recording Instructions</h6>
                                <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                    <li>Show your face clearly to the camera</li>
                                    <li>Display your Voter ID, Driving License, or other ID documents</li>
                                    <li>Ensure good lighting and clear visibility</li>
                                    <li>Recording should be at least 10 seconds</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Camera Loading */}
                    {showCameraLoader && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <i className="ri-loader-4-line animate-spin text-4xl text-blue-500"></i>
                            <p className="text-slate-500 font-medium">Initializing camera...</p>
                        </div>
                    )}

                    {/* Camera View or Recorded Video */}
                    {cameraAllowed && (
                        <div className="mb-6">
                            {!recordedVideoUrl ? (
                                <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-sm relative max-w-2xl mx-auto">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />

                                    {/* Recording Indicator */}
                                    {isRecording && (
                                        <div className="absolute top-4 left-4">
                                            <div className="flex items-center gap-2 bg-rose-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                                                <span className="flex items-center justify-center bg-white text-rose-500 rounded-full w-6 h-6">
                                                    <i className="ri-record-circle-fill animate-pulse"></i>
                                                </span>
                                                <span className="font-bold tabular-nums tracking-wide">{formatTime(recordingTime)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="max-w-2xl mx-auto space-y-4">
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
                                        <i className="ri-checkbox-circle-fill text-2xl"></i>
                                        <span className="font-semibold">Recording Completed! Review your video below.</span>
                                    </div>
                                    <div className="aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
                                        <video
                                            src={recordedVideoUrl}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Camera Blocked */}
                    {!cameraAllowed && !showCameraLoader && (
                        <div className="mt-6 max-w-lg mx-auto">
                            <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
                                        <i className="ri-camera-off-fill text-3xl"></i>
                                    </div>
                                </div>
                                <h5 className="font-bold text-rose-600 text-lg mb-2">Camera Access Denied</h5>
                                <p className="text-slate-600 mb-6 text-sm">
                                    Please allow camera and microphone access to continue with video KYC verification.
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Button onClick={() => window.location.reload()} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
                                        <i className="ri-refresh-line mr-2"></i> Try Again
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Control Buttons */}
                    {cameraAllowed && (
                        <div className="flex justify-center gap-4 mb-6 mt-6">
                            {!recordedVideoUrl ? (
                                !isRecording ? (
                                    <Button
                                        onClick={startRecording}
                                        className="rounded-full shadow-md font-bold px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <i className="ri-record-circle-fill mr-2 text-xl"></i> Start Recording
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={stopRecording}
                                        className="rounded-full shadow-md font-bold px-6 py-6 bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                                    >
                                        <i className="ri-stop-circle-fill mr-2 text-xl"></i> Stop Recording
                                    </Button>
                                )
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={retakeVideo}
                                    className="rounded-full font-bold px-6 border-2"
                                >
                                    <i className="ri-refresh-line mr-2 text-xl"></i> Retake Video
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {cameraAllowed && recordedVideoUrl && (
                        <div className="flex justify-center mt-8 pt-6 border-t border-slate-100">
                            <Button
                                onClick={handleProceed}
                                className="px-8 py-6 rounded-2xl font-bold shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white text-lg w-full max-w-sm"
                            >
                                Process Video <i className="ri-arrow-right-line ml-2"></i>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VideoKycStep;

registerStepComponent("VIDEO_KYC_RESULT", VideoKycStep);
