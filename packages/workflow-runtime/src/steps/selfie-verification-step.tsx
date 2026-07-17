import { registerStepComponent } from "../step-component-registry";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@craft-apex/ui";
import { Button } from "@craft-apex/ui";

type StepStatus = "pending" | "checking" | "passed";

export const SelfieVerification = (props: any) => {
    const { context } = props;

    // States
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState("");

    // Liveness checks
    const [lookStraight, setLookStraight] = useState<StepStatus>("pending");
    const [smile, setSmile] = useState<StepStatus>("pending");
    const [blink, setBlink] = useState<StepStatus>("pending");

    const [allPassed, setAllPassed] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize Camera on Mount
    useEffect(() => {
        let mounted = true;
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false
                });
                if (!mounted) {
                    mediaStream.getTracks().forEach(t => t.stop());
                    return;
                }
                setStream(mediaStream);
                setCameraActive(true);
                setPermissionError("");
            } catch (err: any) {
                console.error("Camera error:", err);
                if (mounted) {
                    setPermissionError("Camera access denied or unavailable. Please check permissions.");
                }
            }
        };

        startCamera();

        return () => {
            mounted = false;
        };
    }, []);

    // Ensure video plays when stream is available
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Play error:", e));
        }
    }, [stream]);

    // Stop Camera helper
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    // Clean up on unmount or stream change
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Manual start camera (if retrying)
    const retryCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });
            setStream(mediaStream);
            setCameraActive(true);
            setPermissionError("");
        } catch (err: any) {
            console.error("Camera error:", err);
            setPermissionError("Camera access denied or unavailable.");
        }
    };

    // Liveness Simulation Sequence
    useEffect(() => {
        if (cameraActive && !capturedImage && !allPassed) {
            let timeout1: NodeJS.Timeout, timeout2: NodeJS.Timeout, timeout3: NodeJS.Timeout, timeout4: NodeJS.Timeout;

            // Start checking "Look straight"
            setLookStraight("checking");
            timeout1 = setTimeout(() => {
                setLookStraight("passed");
                setSmile("checking");

                timeout2 = setTimeout(() => {
                    setSmile("passed");
                    setBlink("checking");

                    timeout3 = setTimeout(() => {
                        setBlink("passed");

                        timeout4 = setTimeout(() => {
                            setAllPassed(true);
                        }, 500);

                    }, 2500); // Blink takes 2.5s
                }, 2500); // Smile takes 2.5s
            }, 2000); // Look straight takes 2s

            return () => {
                clearTimeout(timeout1);
                clearTimeout(timeout2);
                clearTimeout(timeout3);
                clearTimeout(timeout4);
            };
        }
    }, [cameraActive, capturedImage, allPassed]);

    // Capture Image
    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 480;
            canvas.height = video.videoHeight || 640;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Draw current video frame to canvas
                // Mirror the canvas because the video is mirrored
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageUrl = canvas.toDataURL("image/png");
                setCapturedImage(imageUrl);
                stopCamera();
            }
        }
    };

    const retakeSelfie = () => {
        setCapturedImage(null);
        setAllPassed(false);
        setLookStraight("pending");
        setSmile("pending");
        setBlink("pending");
        retryCamera();
    };

    const renderCheckItem = (label: string, icon: string, status: StepStatus, isActive: boolean) => {
        return (
            <div className={`relative flex w-full items-center justify-between rounded-2xl p-5 mb-4 transition-all duration-500 overflow-hidden ${status === "passed" ? "bg-emerald-50 border-emerald-200"
                : status === "checking" ? "bg-blue-600 shadow-[0_8px_30px_rgb(37,99,235,0.2)] border-transparent -translate-y-1"
                    : "bg-white border-slate-100 shadow-sm opacity-60 hover:opacity-100"
                } border`}>
                {status === "checking" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                )}

                <div className="flex items-center gap-4 relative z-10">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl transition-all duration-300 ${status === "passed" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : status === "checking" ? "bg-white/20 text-white backdrop-blur-sm"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                        {status === "passed" ? <i className="ri-check-line"></i> : icon}
                    </div>
                    <span className={`text-[16px] font-bold tracking-tight transition-colors duration-300 ${status === "passed" ? "text-emerald-900"
                        : status === "checking" ? "text-white"
                            : "text-slate-600"
                        }`}>
                        {label}
                    </span>
                </div>

                <div className="relative z-10">
                    {status === "passed" && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in duration-300">
                            <i className="ri-check-double-line text-lg"></i>
                        </div>
                    )}
                    {status === "checking" && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold backdrop-blur-md animate-pulse">
                            <i className="ri-loader-4-line animate-spin"></i>
                            <span>Scanning</span>
                        </div>
                    )}
                    {status === "pending" && (
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-dashed"></div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2.5rem]">
                <CardContent className="p-2 md:p-3">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* LEFT: Camera / Preview Area */}
                        <div className="w-full lg:w-1/2 flex flex-col items-center relative">
                            {/* The Viewfinder Frame */}
                            <div className="relative w-full aspect-[3/4] max-h-[600px] overflow-hidden rounded-[2rem] bg-slate-900 shadow-inner group">

                                {!cameraActive && !capturedImage && !permissionError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900">
                                        <i className="ri-loader-4-line text-4xl text-blue-500 animate-spin mb-4"></i>
                                        <p className="text-slate-400 font-medium">Initializing camera...</p>
                                    </div>
                                )}

                                {permissionError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900 text-center p-8">
                                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                            <i className="ri-camera-off-line text-3xl text-red-500"></i>
                                        </div>
                                        <p className="text-red-400 font-medium mb-6">{permissionError}</p>
                                        <Button onClick={retryCamera} className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-6">
                                            Try Again
                                        </Button>
                                    </div>
                                )}

                                {/* Video Element */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    onLoadedMetadata={(e) => { e.currentTarget.play().catch(() => { }); }}
                                    className={`absolute inset-0 h-full w-full object-cover scale-x-[-1] transition-opacity duration-1000 ${cameraActive && !capturedImage ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                                />

                                {/* Face Guide Overlay */}
                                {cameraActive && !capturedImage && (
                                    <div className="absolute inset-0 pointer-events-none z-20">
                                        {/* Dark overlay with transparent cutout for face */}
                                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                            <defs>
                                                <mask id="face-hole">
                                                    <rect width="100%" height="100%" fill="white" />
                                                    <ellipse cx="50%" cy="45%" rx="35%" ry="45%" fill="black" />
                                                </mask>
                                            </defs>
                                            <rect width="100%" height="100%" fill="rgba(15, 23, 42, 0.4)" mask="url(#face-hole)" />
                                        </svg>

                                        {/* Guide Box */}
                                        <div className="absolute top-[5%] left-[10%] right-[10%] bottom-[15%] border-2 border-white/20 rounded-[4rem] flex items-center justify-center transition-colors duration-500">
                                            {/* Corner brackets */}
                                            <div className={`absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 rounded-tl-[3.5rem] transition-colors duration-500 ${allPassed ? 'border-emerald-400' : 'border-blue-500'}`}></div>
                                            <div className={`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-[3.5rem] transition-colors duration-500 ${allPassed ? 'border-emerald-400' : 'border-blue-500'}`}></div>
                                            <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-[3.5rem] transition-colors duration-500 ${allPassed ? 'border-emerald-400' : 'border-blue-500'}`}></div>
                                            <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 rounded-br-[3.5rem] transition-colors duration-500 ${allPassed ? 'border-emerald-400' : 'border-blue-500'}`}></div>
                                        </div>

                                        {/* Scanning animation */}
                                        {!allPassed && (
                                            <div className="absolute left-[10%] right-[10%] h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] z-30 opacity-50"
                                                style={{ animation: 'scansweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Image Preview */}
                                {capturedImage && (
                                    <>
                                        <img
                                            src={capturedImage}
                                            alt="Captured Selfie"
                                            className="absolute inset-0 h-full w-full object-cover z-20"
                                        />
                                        <div className="absolute inset-0 z-30 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none flex flex-col justify-end p-8">
                                            <div className="flex items-center justify-center gap-3 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-emerald-400 shadow-lg animate-in slide-in-from-bottom-4">
                                                <i className="ri-shield-check-fill text-2xl"></i>
                                                <span className="font-bold tracking-wide">Verification Complete</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Hidden Canvas for capturing */}
                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* RIGHT: Status & Controls */}
                        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 lg:p-8">
                            <div className="flex-1">
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Live Checking</h3>
                                        <p className="text-slate-500 mt-1 font-medium">Position your face inside the frame</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                        <i className="ri-user-smile-line text-2xl"></i>
                                    </div>
                                </div>

                                <div className="space-y-4 relative">
                                    {/* Connecting Line */}
                                    <div className="absolute left-11 top-10 bottom-10 w-0.5 bg-slate-100 -z-10 rounded-full"></div>

                                    {renderCheckItem("Look straight into camera", "😐", lookStraight, lookStraight === "checking")}
                                    {renderCheckItem("Smile naturally", "😊", smile, smile === "checking")}
                                    {renderCheckItem("Blink your eyes", "👁", blink, blink === "checking")}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 mt-8 border-t border-slate-100 space-y-4">
                                {!capturedImage ? (
                                    <Button
                                        onClick={captureSelfie}
                                        disabled={!allPassed}
                                        className={`group relative w-full h-16 rounded-2xl text-[16px] font-bold tracking-wide transition-all duration-300 overflow-hidden ${allPassed
                                            ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-[0_8px_30px_rgb(15,23,42,0.2)] hover:-translate-y-0.5'
                                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200/50'
                                            }`}
                                    >
                                        {allPassed && (
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                                        )}
                                        <div className="relative flex items-center justify-center gap-3">
                                            {allPassed ? (
                                                <><i className="ri-camera-lens-fill text-2xl"></i> Capture Photo</>
                                            ) : (
                                                <><i className="ri-lock-line text-xl"></i> Complete checks to capture</>
                                            )}
                                        </div>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={retakeSelfie}
                                        variant="outline"
                                        className="w-full h-16 rounded-2xl text-[16px] font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300"
                                    >
                                        <i className="ri-refresh-line mr-2 text-xl"></i> Retake Photo
                                    </Button>
                                )}


                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <style>{`
                @keyframes scansweep {
                    0% { top: 5%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 95%; opacity: 0; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default SelfieVerification;

registerStepComponent("SELFIE_VERIFICATION", SelfieVerification);
