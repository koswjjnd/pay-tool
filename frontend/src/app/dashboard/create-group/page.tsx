"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUserStore } from '@/store/userStore';

export default function CreateGroupPage() {
  const router = useRouter();
  const { userId } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    totalAmount: "",
    totalPeople: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.description ||
      !formData.totalAmount ||
      !formData.totalPeople
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation CreateGroup($input: CreateGroupInput!) {
            createGroup(input: $input) {
              id
              totalAmount
              totalPeople
              description
              status
            }
          }`,
          variables: {
            input: {
              leaderId: userId,
              totalAmount: parseFloat(formData.totalAmount),
              totalPeople: parseInt(formData.totalPeople),
              description: formData.description,
            },
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
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: e.target.value })
              }
              placeholder="Enter total amount"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total People
            </label>
            <Input
              type="number"
              value={formData.totalPeople}
              onChange={(e) =>
                setFormData({ ...formData, totalPeople: e.target.value })
              }
              placeholder="Enter number of people"
              min="1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
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
