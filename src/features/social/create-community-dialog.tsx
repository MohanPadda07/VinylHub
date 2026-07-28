"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCommunityAction } from "@/features/social/actions";

export function CreateCommunityDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: () => createCommunityAction({ name, description, type: "GENERAL" }),
    onSuccess: (result) => {
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      router.push(`/communities/${result.slug}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          Create community
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-white">Create community</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <Input
            placeholder="Community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-white/10 bg-black/40"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            rows={3}
          />
          <Button type="submit" disabled={mutation.isPending || name.length < 2}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
