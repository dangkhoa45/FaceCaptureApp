"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useEmployees } from "@/hooks/useEmployeeList";
import { getNextIdFromEmployees } from "@/lib/helps";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CAPTURE_ANGLES = [
  {
    id: "straight",
    name: "Chính diện",
    instruction: "Nhìn thẳng vào camera",
    image: "/images/face_angle_1.png",
  },
  {
    id: "left",
    name: "Trái",
    instruction: "Xoay mặt sang trái",
    image: "/images/face_angle_4.png",
  },
  {
    id: "right",
    name: "Phải",
    instruction: "Xoay mặt sang phải",
    image: "/images/face_angle_3.png",
  },
  {
    id: "top",
    name: "Ngẩng Lên",
    instruction: "Ngẩng đầu lên",
    image: "/images/face_angle_2.png",
  },
  {
    id: "bottom",
    name: "Cúi Xuống",
    instruction: "Cúi đầu xuống",
    image: "/images/face_angle_5.png",
  },
];

const TEST_ANGLE = {
  id: "test",
  name: "Ảnh Test",
  instruction: "Chụp ảnh test cuối cùng",
  image: "/images/face_angle_1.png",
};

export default function FaceCaptureApp() {
  const [activeAngle, setActiveAngle] = useState<string>(CAPTURE_ANGLES[0].id);
  const [capturedImages, setCapturedImages] = useState<Record<string, string>>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const [captureSetId, setCaptureSetId] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const testVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const testStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const { data: employees, loading: employeesLoading } = useEmployees();

  useEffect(() => {
    if (!employeesLoading && employees.length > 0) {
      const maxId = getNextIdFromEmployees(employees);
      setCaptureSetId(maxId);
    }
  }, [employeesLoading, employees]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (showTestDialog) {
      startTestCamera();
    } else {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }, [showTestDialog]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setFeedbackMessage("Đưa khuôn mặt vào khung hình và giữ yên");
    } catch (error) {
      console.error("Không thể truy cập camera:", error);
      setFeedbackMessage(
        "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập."
      );
    }
  };

  const startTestCamera = async () => {
    try {
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      testStreamRef.current = stream;

      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Không thể truy cập camera cho ảnh test:", error);
      toast({
        title: "Lỗi camera",
        description:
          "Không thể truy cập camera cho ảnh test. Vui lòng kiểm tra quyền truy cập.",
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (blob: Blob): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", blob, "image.jpg");
    formData.append("is_private", "1");

    try {
      const response = await fetch(
        "https://dev4.tadalabs.vn/api/method/upload_file",
        {
          method: "POST",
          headers: {
            Authorization: "token a6b73e5e5d8b4f4:87aaa4e073c8b9f",
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.message && result.message.file_url) {
        return result.message.file_url;
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi khi upload",
        description: "Không thể upload ảnh lên server.",
        variant: "destructive",
      });
      return null;
    }
  };

  const captureImage = (angleId: string) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const fileUrl = await uploadImage(blob);
          if (fileUrl) {
            setCapturedImages((prev) => ({
              ...prev,
              [angleId]: fileUrl,
            }));

            const currentIndex = CAPTURE_ANGLES.findIndex(
              (angle) => angle.id === angleId
            );
            if (currentIndex < CAPTURE_ANGLES.length - 1) {
              setActiveAngle(CAPTURE_ANGLES[currentIndex + 1].id);
            }

            setFeedbackMessage("Đã chụp và upload ảnh thành công!");

            const updatedImages = {
              ...capturedImages,
              [angleId]: fileUrl,
            };
            const capturedCount = Object.keys(updatedImages).length;

            if (capturedCount === CAPTURE_ANGLES.length) {
              setIsComplete(true);
              setTimeout(() => {
                setShowTestDialog(true);
              }, 500);
            }
          }
        }
      }, "image/jpeg");
    }
  };

  const captureTestImage = () => {
    const videoElement = testVideoRef.current;
    if (!videoElement) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const fileUrl = await uploadImage(blob);
          if (fileUrl) {
            const updated = {
              ...capturedImages,
              [TEST_ANGLE.id]: fileUrl,
            };

            setCapturedImages(updated);
            setShowTestDialog(false);
            uploadEmployeeData(updated);
          }
        }
      }, "image/jpeg");
    }
  };

  const retakeImage = (angleId: string) => {
    setCapturedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[angleId];
      return newImages;
    });

    setActiveAngle(angleId);

    setIsComplete(false);
  };
  const showTestCaptureDialog = () => {
    setShowTestDialog(true);
  };

  const uploadEmployeeData = async (images: Record<string, string>) => {
    setIsUploading(true);
    const angleOrder = ["straight", "left", "right", "top", "bottom", "test"];
    const employeeData: Record<string, string> = {
      first_name: "nhân viên 1",
      gender: "Male",
      date_of_joining: "2025-01-01",
      date_of_birth: "2003-06-20",
    };

    angleOrder.forEach((angle, index) => {
      const fileUrl = images[angle];
      if (fileUrl) {
        employeeData[`custom_face_images${index + 1}`] = fileUrl;
      }
    });

    try {
      const response = await fetch(
        "https://dev4.tadalabs.vn/api/resource/Employee",
        {
          method: "POST",
          headers: {
            Authorization: "token a6b73e5e5d8b4f4:87aaa4e073c8b9f",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Đã tạo nhân viên mới và lưu ảnh.",
        });
        setCapturedImages({});
        setActiveAngle(CAPTURE_ANGLES[0].id);
        setIsComplete(false);

        const currentNumber = parseInt(captureSetId.replace("HR-EMP-", ""), 10);
        const nextNumber = currentNumber + 1;
        const padded = nextNumber.toString().padStart(5, "0");
        setCaptureSetId(`HR-EMP-${padded}`);
        
      } else {
        throw new Error(result.message || "Gửi dữ liệu thất bại");
      }
    } catch (error) {
      console.error("Upload employee error:", error);
      toast({
        title: "Lỗi khi gửi dữ liệu nhân viên",
        description: "Không thể gửi dữ liệu lên hệ thống.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const currentAngle = CAPTURE_ANGLES.find((angle) => angle.id === activeAngle);

  return (
    <div className="min-h-screen bg-blue-50 py-4 px-2 md:px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 px-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-40 mr-4">
              <Image
                src="/images/logo-vacif-removebg.png"
                alt="VaciF - Focusing On Value"
                width={160}
                height={60}
                className="h-auto"
              />
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-blue-700">
              Thu thập Gương mặt
            </h1>
            <p className="text-gray-600">
              ID Bộ ảnh:{" "}
              <span className="font-mono text-blue-800">
                HR-EMP-{captureSetId}
              </span>
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {/* Khu vực camera và hướng dẫn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video feed */}
            <Card className="overflow-hidden border-blue-200">
              <div className="p-3 border-b bg-blue-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-blue-800">Camera</h3>
                  <p className="text-sm font-medium text-blue-700">
                    Đang chụp: {currentAngle?.name || "Chưa chọn góc"}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="relative">
                  <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay hướng dẫn */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-full m-auto mt-[12%] border-dashed"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/30 backdrop-blur-sm rounded-full p-2">
                      <Button
                        onClick={() => captureImage(activeAngle)}
                        className="rounded-full h-16 w-16 p-0 bg-blue-700 hover:bg-blue-600"
                      >
                        <Camera className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <div className="bg-blue-100 px-4 py-2 rounded-full">
                      <p className="text-sm font-medium text-blue-800">
                        {currentAngle?.instruction || "Chọn góc để chụp"}
                      </p>
                    </div>
                  </div>
                </div>

                {feedbackMessage && (
                  <div className="mt-2 text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>{feedbackMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Hình mẫu */}
            <Card className="overflow-hidden border-blue-200">
              <div className="p-3 border-b bg-blue-100">
                <h3 className="text-lg font-medium text-blue-800">Hình mẫu</h3>
              </div>
              <div className="p-4">
                <div className="aspect-[4/3] bg-blue-50 rounded-lg overflow-hidden">
                  <img
                    src={currentAngle?.image || "/placeholder.svg"}
                    alt={`Mẫu ${currentAngle?.name || ""}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Danh sách ảnh đã chụp */}
          <Card className="border-blue-200">
            <div className="p-4 bg-blue-100 border-b">
              <h3 className="text-lg font-medium text-blue-800">Ảnh đã chụp</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {CAPTURE_ANGLES.map((angle) => {
                  const isActive = activeAngle === angle.id;
                  const isCaptured = angle.id in capturedImages;

                  return (
                    <div
                      key={angle.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                        ${
                          isActive
                            ? "border-blue-600 ring-2 ring-blue-400/30"
                            : isCaptured
                            ? "border-blue-500"
                            : "border-blue-200"
                        }
                      `}
                      onClick={() => setActiveAngle(angle.id)}
                    >
                      <div className="aspect-square bg-blue-50">
                        {isCaptured ? (
                          <img
                            src={capturedImages[angle.id] || "/placeholder.svg"}
                            alt={`Ảnh ${angle.name} đã chụp`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center p-2">
                              <img
                                src={angle.image || "/placeholder.svg"}
                                alt={`Mẫu ${angle.name}`}
                                className="max-h-full mx-auto opacity-50"
                              />
                            </div>
                          </div>
                        )}

                        {/* Overlay trạng thái */}
                        {isCaptured && (
                          <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-1">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}

                        {/* Nút chụp lại */}
                        {isCaptured && (
                          <div
                            className="absolute bottom-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              retakeImage(angle.id);
                            }}
                          >
                            <RefreshCw className="h-4 w-4 text-blue-700" />
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-1 text-center">
                        {angle.name}
                      </div>
                    </div>
                  );
                })}

                {/* Ô ảnh test */}
                <div
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${
                      TEST_ANGLE.id in capturedImages
                        ? "border-blue-500"
                        : "border-blue-200"
                    }
                  `}
                >
                  <div className="aspect-square bg-blue-50">
                    {TEST_ANGLE.id in capturedImages ? (
                      <img
                        src={
                          capturedImages[TEST_ANGLE.id] || "/placeholder.svg"
                        }
                        alt="Ảnh test đã chụp"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center p-2">
                          <p className="text-sm text-blue-400">Ảnh test</p>
                          <p className="text-xs text-blue-400 mt-1">
                            Chụp sau khi hoàn thành
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Overlay trạng thái */}
                    {TEST_ANGLE.id in capturedImages && (
                      <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-1 text-center">
                    Ảnh Test
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Nút hoàn thành */}
          <div className="mt-4 flex justify-center">
            <Button
              disabled={!isComplete || isUploading}
              onClick={showTestCaptureDialog}
              className="w-full max-w-xs bg-blue-700 hover:bg-blue-600"
              size="lg"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Tiếp tục chụp ảnh test
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog chụp ảnh test */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-md bg-blue-50 border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-blue-800">
              Chụp ảnh test cuối cùng
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="relative">
              <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video
                  ref={testVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Overlay hướng dẫn */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-full m-auto mt-[12%] border-dashed"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-blue-600">
                Đây là ảnh test cuối cùng trước khi lưu bộ ảnh
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTestDialog(false)}
              className="border-blue-300 text-blue-700"
            >
              Hủy
            </Button>
            <Button
              onClick={captureTestImage}
              className="bg-blue-700 hover:bg-blue-600"
            >
              <Camera className="h-4 w-4 mr-2" />
              Chụp ảnh test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
