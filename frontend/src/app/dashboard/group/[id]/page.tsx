"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    // Group details fetching will be implemented here
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Group Details</h1>
        <div className="space-y-4">
          {/* Group details will be implemented here */}
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