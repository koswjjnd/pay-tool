"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VirtualCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Virtual Payment Card</h1>
        <div className="space-y-4">
          {/* Card details will be implemented here */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 