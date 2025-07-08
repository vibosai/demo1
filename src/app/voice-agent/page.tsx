"use client";

import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoveLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type MicrophonePermission = "unknown" | "checking" | "granted" | "denied" | "error";

export default function VoiceAgent() {
  const connectionRef = useRef<RealtimeSession | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState<MicrophonePermission>("unknown");
  const router = useRouter();

  // Function to check microphone permission (passive check only)
  const checkMicrophonePermission = useCallback(async (requestIfNeeded: boolean = false): Promise<boolean> => {
    try {
      if (requestIfNeeded) {
        setMicPermission("checking");
      }

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          "Your browser doesn't support microphone access. Please use a modern browser like Chrome, Firefox, or Safari."
        );
        setMicPermission("error");
        return false;
      }

      // Check current permission status first
      if (navigator.permissions && !requestIfNeeded) {
        try {
          const permission = await navigator.permissions.query({ name: "microphone" as PermissionName });
          if (permission.state === "denied") {
            setMicPermission("denied");
            return false;
          }
          if (permission.state === "granted") {
            setMicPermission("granted");
            setError(null);
            return true;
          }
          // If permission is "prompt", we'll only request if explicitly asked
          if (permission.state === "prompt" && !requestIfNeeded) {
            setMicPermission("unknown");
            return false;
          }
        } catch {
          // Permission API might not be supported, continue with getUserMedia
          console.warn("Permission API not supported");
        }
      }

      // Only request permission if explicitly requested
      if (requestIfNeeded) {
        try {
          console.log("Requesting microphone permission...");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately as we only needed to check permission
          stream.getTracks().forEach((track) => track.stop());
          setMicPermission("granted");
          setError(null);
          console.log("Microphone permission granted");
          return true;
        } catch (err: unknown) {
          console.error("Microphone permission error:", err);

          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
          const errorName =
            err instanceof DOMException
              ? err.name
              : err instanceof Error && "name" in err
              ? (err as Error & { name: string }).name
              : "UnknownError";

          if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
            setError(
              "Microphone access denied. Please click 'Allow' when the browser prompts you, or check your browser settings."
            );
            setMicPermission("denied");
          } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
            setError("No microphone found. Please connect a microphone and try again.");
            setMicPermission("error");
          } else if (errorName === "NotReadableError") {
            setError(
              "Microphone is already in use by another application. Please close other applications using the microphone and try again."
            );
            setMicPermission("error");
          } else {
            setError(`Microphone error: ${errorMessage}`);
            setMicPermission("error");
          }
          return false;
        }
      }

      return false;
    } catch (error: unknown) {
      console.error("Error checking microphone permission:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to check microphone permission: ${errorMessage}`);
      setMicPermission("error");
      return false;
    }
  }, []);

  const connectSession = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus("connecting");

      if (!connectionRef.current) {
        setError("No connection reference available");
        setConnectionStatus("disconnected");
        return;
      }

      // Always check microphone permission before connecting
      console.log("Checking microphone permission before connecting...");
      const hasPermission = await checkMicrophonePermission(true); // Request permission if needed

      if (!hasPermission) {
        console.warn("Microphone permission not granted, aborting connection");
        setConnectionStatus("disconnected");
        // Don't set to error here as the permission states are already handled
        return;
      }

      // Additional safety check - ensure permission is actually granted
      if (micPermission !== "granted") {
        console.warn("Microphone permission state is not 'granted', waiting...");
        setError("Microphone permission is required before connecting. Please grant permission and try again.");
        setConnectionStatus("disconnected");
        return;
      }

      console.log("Microphone permission granted, proceeding with connection...");
      console.log("Fetching session from API...");
      const resp = await fetch("/api/session");

      if (!resp.ok) {
        const errorData = await resp.json();
        console.error("API Error:", errorData);
        const errorMessage = `Failed to create session: ${errorData.error || "Unknown error"}`;
        setError(errorMessage);
        setConnectionStatus("error");
        return;
      }

      const { data } = await resp.json();
      console.log("Session data received:", data);

      if (!data?.client_secret?.value) {
        console.error("No client secret received from API");
        const errorMessage = "Invalid session data received";
        setError(errorMessage);
        setConnectionStatus("error");
        return;
      }

      console.log("Connecting to realtime session...");
      await connectionRef.current.connect({
        apiKey: data.client_secret.value,
      });

      setConnectionStatus("connected");
      setIsListening(true);
      console.log("Connected to the session successfully.");
    } catch (error) {
      console.error("Connection error:", error);
      const errorMessage = `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      setError(errorMessage);
      setConnectionStatus("error");
    }
  }, [checkMicrophonePermission, micPermission]);

  const requestMicrophonePermission = useCallback(async () => {
    console.log("Explicitly requesting microphone permission...");
    const hasPermission = await checkMicrophonePermission(true);
    return hasPermission;
  }, [checkMicrophonePermission]);

  const disconnectSession = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      setConnectionStatus("disconnected");
      setError(null);
      setIsListening(false);
      setIsMuted(false);
      console.log("Disconnected from the session.");
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (connectionRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);

      // Call the mute method on the RealtimeSession
      try {
        connectionRef.current.mute(newMutedState);
        console.log(`Session ${newMutedState ? "muted" : "unmuted"}`);
      } catch (error) {
        console.error("Error toggling mute:", error);
        // Revert the state if the call fails
        setIsMuted(!newMutedState);
        setError(`Failed to ${newMutedState ? "mute" : "unmute"} the session`);
      }
    }
  }, [isMuted]);

  const handleBackBtn = useCallback(() => {
    router.push("/"); // Navigate back to the home page
  }, [router]);

  useEffect(() => {
    const agent = new RealtimeAgent({
      name: "Assistant",
      instructions:
        "You are a helpful and respectful voice assistant that communicates in English and responds to voice commands in a natural, conversational manner. You are specialized in providing information about robots — including their technologies, types, components, applications, behavior, and real-world use cases. Users can ask you anything related to robotics, from industrial robots to humanoid, autonomous, or AI-powered systems. You must never generate or respond with any offensive, inappropriate, or harmful content. Always prioritize user safety and well-being. If you are unsure about a request or if it's unrelated to robotics, politely decline to assist or redirect the user appropriately.",
    });

    connectionRef.current = new RealtimeSession(agent);

    // Check microphone permission on mount (passive check only)
    checkMicrophonePermission(false);

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
      }
    };
  }, [checkMicrophonePermission]);

  // Debug function to test microphone access

  const getStatusText = () => {
    if (micPermission === "denied") return "Microphone Access Denied";
    if (micPermission === "checking") return "Checking Microphone...";
    if (micPermission === "error") return "Microphone Error";

    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Failed";
      default:
        return micPermission === "granted" ? "Ready to Connect" : "Disconnected";
    }
  };

  const getStatusIcon = () => {
    if (micPermission === "denied") return <MicOff className="w-5 h-5 text-[#ff4444]" />;
    if (micPermission === "checking") return <Loader2 className="w-5 h-5 text-[#00fff7] animate-spin" />;
    if (micPermission === "error") return <AlertCircle className="w-5 h-5 text-[#ff4444]" />;

    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-5 h-5 text-[#00fff7]" />;
      case "connecting":
        return <Loader2 className="w-5 h-5 text-[#00fff7] animate-spin" />;
      case "error":
        return <WifiOff className="w-5 h-5 text-[#ff4444]" />;
      default:
        return micPermission === "granted" ? (
          <Mic className="w-5 h-5 text-[#00fff7]" />
        ) : (
          <WifiOff className="w-5 h-5 text-[#aaa]" />
        );
    }
  };

  return (
    <div className="h-full bg-[#0c0c0c] text-white font-['Orbitron',sans-serif] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0f0f0f] flex-shrink-0">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[#00fff7] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] rounded-lg">
                <MoveLeft onClick={handleBackBtn} className="w-6 h-6 text-black cursor-pointer" />
              </div>
              <div>
                <h1 className="text-2xl font-bold  text-[#00fff7]">vibOS</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-[#aaa]">{getStatusText()}</span>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                  connectionStatus === "connected"
                    ? isMuted
                      ? "bg-[#ff4444] text-white"
                      : "bg-[#00fff7] text-[#000]"
                    : connectionStatus === "connecting" || micPermission === "checking"
                    ? "bg-[#1a1a1a] text-[#00fff7] border border-[#00fff7]"
                    : micPermission === "denied"
                    ? "bg-[#ff4444] text-white"
                    : micPermission === "error"
                    ? "bg-[#ff4444] text-white"
                    : "bg-[#1a1a1a] text-[#aaa]"
                }`}
              >
                {connectionStatus === "connected"
                  ? isMuted
                    ? "MUTED"
                    : "LIVE"
                  : connectionStatus === "connecting"
                  ? "CONNECTING"
                  : micPermission === "denied"
                  ? "BLOCKED"
                  : micPermission === "error"
                  ? "ERROR"
                  : micPermission === "checking"
                  ? "CHECKING"
                  : "OFFLINE"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 px-4 py-8 mx-auto overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Microphone Permission Prompt */}
          {micPermission === "unknown" && (
            <Alert className="bg-[#1a1a1a] border-[#00fff7] text-[#00fff7]">
              <Mic className="w-4 h-4 text-[#00fff7]" />
              <AlertDescription className="font-['Inter',sans-serif]">
                <strong>Microphone Access Needed:</strong> Click the button below to grant microphone permissions and
                start using the voice assistant.
                <Button
                  onClick={requestMicrophonePermission}
                  variant="outline"
                  size="sm"
                  className="mt-2 ml-2 bg-[#00fff7] text-[#000] border-[#00fff7] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] font-['Orbitron',sans-serif]"
                >
                  <Mic className="w-3 h-3 mr-1" />
                  Grant Permission
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Microphone Permission Alert */}
          {micPermission === "denied" && (
            <Alert className="bg-[#1a1a1a] border-[#ff4444] text-[#ff4444]">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="font-['Inter',sans-serif]">
                <strong>Microphone Access Blocked:</strong> Please enable microphone permissions to use the voice
                assistant.
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <strong>To enable microphone access:</strong>
                  </p>
                  <ul className="space-y-1 text-sm list-disc list-inside">
                    <li>Look for the microphone icon in your browser&apos;s address bar</li>
                    <li>Click it and select &quot;Always allow&quot; for microphone access</li>
                    <li>Or go to your browser settings and enable microphone for this site</li>
                    <li>Refresh the page after changing permissions</li>
                  </ul>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={requestMicrophonePermission}
                      variant="outline"
                      size="sm"
                      className="bg-[#00fff7] text-[#000] border-[#00fff7] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] font-['Orbitron',sans-serif]"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                      className="bg-[#1a1a1a] text-[#aaa] border-[#1a1a1a] hover:bg-[#1a1a1a] font-['Orbitron',sans-serif]"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Microphone Error Alert */}
          {micPermission === "error" && (
            <Alert className="bg-[#1a1a1a] border-[#ff4444] text-[#ff4444]">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="font-['Inter',sans-serif]">
                <strong>Microphone Error:</strong> There was an issue accessing your microphone.
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    <strong>Common solutions:</strong>
                  </p>
                  <ul className="space-y-1 text-sm list-disc list-inside">
                    <li>Check if another application is using your microphone</li>
                    <li>Ensure your microphone is properly connected</li>
                    <li>Try refreshing the page</li>
                    <li>Check your browser&apos;s microphone permissions</li>
                  </ul>
                  <Button
                    onClick={requestMicrophonePermission}
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-[#00fff7] text-[#000] border-[#00fff7] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] font-['Orbitron',sans-serif]"
                  >
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Microphone Checking Alert */}
          {micPermission === "checking" && (
            <Alert className="bg-[#1a1a1a] border-[#00fff7] text-[#00fff7] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <AlertDescription className="font-['Inter',sans-serif]">
                Checking microphone permissions...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="bg-[#1a1a1a] border-[#ff4444] text-[#ff4444] flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="font-['Inter',sans-serif]">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {connectionStatus === "connected" && (
            <Alert className="bg-[#1a1a1a] border-[#00fff7] text-[#00fff7] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#00fff7]" />
              <AlertDescription className="font-['Inter',sans-serif]">
                Successfully connected to voice assistant. You can now start speaking!
              </AlertDescription>
            </Alert>
          )}

          {/* Main Control Card */}
          <Card className="border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-[#00fff7] font-['Orbitron',sans-serif]">
                VibOS Voice Assistant
              </CardTitle>
              <CardDescription className="text-lg text-[#aaa] font-['Inter',sans-serif]">
                Start a conversation with your AI assistant using voice commands
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Indicator */}
              <div className="flex items-center justify-center p-6 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a]">
                <div className="space-y-2 text-center">
                  <div className="flex justify-center">
                    {connectionStatus === "connected" ? (
                      <div className="relative">
                        <div
                          className={`h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                            isMuted ? "bg-[#ff4444] animate-pulse" : "bg-[#00fff7] animate-pulse"
                          }`}
                        >
                          {isMuted ? (
                            <MicOff className="w-8 h-8 text-white" />
                          ) : (
                            <Mic className="w-8 h-8 text-[#000]" />
                          )}
                        </div>
                        {isListening && !isMuted && (
                          <>
                            <div className="absolute inset-0 border-4 border-[#00fff7] rounded-full animate-ping opacity-50"></div>
                            <div className="absolute inset-0 border-2 border-[#00fff7] rounded-full animate-pulse opacity-75"></div>
                          </>
                        )}
                      </div>
                    ) : connectionStatus === "connecting" || micPermission === "checking" ? (
                      <div className="flex items-center justify-center w-20 h-20 bg-[#00fff7] rounded-full">
                        <Loader2 className="w-8 h-8 text-[#000] animate-spin" />
                      </div>
                    ) : micPermission === "denied" ? (
                      <div className="flex items-center justify-center w-20 h-20 bg-[#ff4444] rounded-full">
                        <MicOff className="w-8 h-8 text-white" />
                      </div>
                    ) : micPermission === "error" ? (
                      <div className="flex items-center justify-center w-20 h-20 bg-[#ff4444] rounded-full">
                        <AlertCircle className="w-8 h-8 text-white" />
                      </div>
                    ) : micPermission === "granted" ? (
                      <div className="flex items-center justify-center w-20 h-20 bg-[#00fff7] rounded-full">
                        <Mic className="w-8 h-8 text-[#000]" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-20 h-20 bg-[#1a1a1a] rounded-full border border-[#aaa]">
                        <MicOff className="w-8 h-8 text-[#aaa]" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#aaa] font-['Inter',sans-serif]">
                    {connectionStatus === "connected"
                      ? isMuted
                        ? "Microphone muted - Click unmute to speak"
                        : "Listening for your voice..."
                      : connectionStatus === "connecting"
                      ? "Establishing connection..."
                      : micPermission === "checking"
                      ? "Checking microphone access..."
                      : micPermission === "denied"
                      ? "Microphone access required"
                      : micPermission === "error"
                      ? "Microphone error detected"
                      : micPermission === "granted"
                      ? "Ready to connect"
                      : "Microphone access needed"}
                  </p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex flex-col space-y-4">
                {connectionStatus === "connected" ? (
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <Button
                        onClick={toggleMute}
                        variant="outline"
                        size="lg"
                        className={`flex-1 transition-all duration-300 font-['Orbitron',sans-serif] ${
                          isMuted
                            ? "bg-[#ff4444] text-white border-[#ff4444] hover:bg-[#cc3333] hover:shadow-[0_0_12px_#ff4444]"
                            : "bg-[#00fff7] text-[#000] border-[#00fff7] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7]"
                        }`}
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-5 h-5 mr-2" />
                            Unmute
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-5 h-5 mr-2" />
                            Mute
                          </>
                        )}
                      </Button>
                    </div>

                    {isMuted && (
                      <div className="p-3 border border-[#ff4444] rounded-lg bg-[#1a1a1a]">
                        <p className="text-sm text-center text-[#ff4444] font-['Inter',sans-serif]">
                          <VolumeX className="inline w-4 h-4 mr-1" />
                          Your microphone is muted. The assistant can&apos;t hear you.
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={disconnectSession}
                      variant="outline"
                      size="lg"
                      className="w-full bg-[#ff4444] text-white border-[#ff4444] hover:bg-[#cc3333] hover:shadow-[0_0_12px_#ff4444] font-['Orbitron',sans-serif]"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Call
                    </Button>
                  </div>
                ) : micPermission === "denied" ? (
                  <Button
                    onClick={requestMicrophonePermission}
                    size="lg"
                    className="w-full bg-[#00fff7] text-[#000] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] font-['Orbitron',sans-serif]"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Grant Microphone Permission
                  </Button>
                ) : micPermission === "checking" ? (
                  <Button
                    disabled
                    size="lg"
                    className="w-full bg-[#1a1a1a] text-[#aaa] border border-[#1a1a1a] font-['Orbitron',sans-serif]"
                  >
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking Permissions...
                  </Button>
                ) : micPermission === "error" ? (
                  <Button
                    onClick={requestMicrophonePermission}
                    size="lg"
                    className="w-full bg-[#ff4444] text-white hover:bg-[#cc3333] hover:shadow-[0_0_12px_#ff4444] font-['Orbitron',sans-serif]"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Fix Microphone Issue
                  </Button>
                ) : micPermission === "unknown" ? (
                  <Button
                    onClick={requestMicrophonePermission}
                    size="lg"
                    className="w-full bg-[#00fff7] text-[#000] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] font-['Orbitron',sans-serif]"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Check Microphone Access
                  </Button>
                ) : (
                  <Button
                    onClick={connectSession}
                    size="lg"
                    className="w-full bg-[#00fff7] text-[#000] hover:bg-[#00fff7] hover:shadow-[0_0_12px_#00fff7] font-['Orbitron',sans-serif]"
                    disabled={connectionStatus === "connecting"}
                  >
                    {connectionStatus === "connecting" ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Phone className="w-5 h-5 mr-2" />
                        Start Voice Session
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-[#00fff7] font-['Orbitron',sans-serif]">
                  <Mic className="w-5 h-5 mr-2 text-[#00fff7]" />
                  Voice Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[#aaa] font-['Inter',sans-serif]">
                  Advanced speech-to-text powered by OpenAI&apos;s Realtime API for natural conversations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_0_10px_rgba(0,255,247,0.1)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-[#00fff7] font-['Orbitron',sans-serif]">
                  <Volume2 className="w-5 h-5 mr-2 text-[#00fff7]" />
                  Natural Speech
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[#aaa] font-['Inter',sans-serif]">
                  High-quality text-to-speech with natural voice synthesis for seamless interaction.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
