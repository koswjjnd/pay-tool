"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    totalAmount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.totalAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation CreateGroup($description: String!, $totalAmount: Float!, $leaderId: Long!) {
            createGroup(description: $description, totalAmount: $totalAmount, leaderId: $leaderId) {
              id
            }
          }`,
          variables: {
            description: formData.description,
            totalAmount: parseFloat(formData.totalAmount),
            leaderId: parseInt(userId || "0"),
          },
        }),
      });

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      toast.success("Group created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create Group</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter group description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount
            </label>
            <Input
              type="number"
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
              placeholder="Enter total amount"
              step="0.01"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Group"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
} 