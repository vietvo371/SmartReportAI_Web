import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAIPredictions(generate: boolean = false) {
  return useQuery({
    queryKey: ["ai-predictions", generate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (generate) params.append("generate", "true");
      
      const res = await fetch(`/api/ai?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      return res.json();
    },
  });
}

export function useAnalyzeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { image_url?: string; image_base64?: string }) => {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to analyze image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-predictions"] });
    },
  });
}

export function useAnalyzeImageFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64 }),
      });
      
      if (!res.ok) throw new Error("Failed to analyze image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-predictions"] });
    },
  });
}

// Utility function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function useGeneratePredictions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate_multiple: true }),
      });
      if (!res.ok) throw new Error("Failed to generate predictions");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-predictions"] });
    },
  });
}

// Hook để check AI service health
export function useAIServiceHealth() {
  return useQuery({
    queryKey: ["ai-service-health"],
    queryFn: async () => {
      const AI_SERVICE_URL = "http://localhost:8000";
      const res = await fetch(`${AI_SERVICE_URL}/health`);
      if (!res.ok) throw new Error("AI service not healthy");
      return res.json();
    },
    retry: 3,
    retryDelay: 1000,
  });
}

