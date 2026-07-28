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
import { createDebateAction } from "@/features/social/actions";

export function CreateDebateDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const mutation = useMutation({
    mutationFn: () =>
      createDebateAction({
        title,
        prompt,
        options: options.filter((o) => o.trim()),
      }),
    onSuccess: (result) => {
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["debates"] });
      router.push(`/debates/${result.slug}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Start debate</Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-white">Start a debate</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <Input
            placeholder="Debate title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-white/10 bg-black/40"
          />
          <textarea
            placeholder="What's the debate about?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            rows={3}
          />
          {options.map((opt, i) => (
            <Input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              className="border-white/10 bg-black/40"
            />
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOptions([...options, ""])}
          >
            Add option
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending || title.length < 3 || options.filter((o) => o.trim()).length < 2}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create debate
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
