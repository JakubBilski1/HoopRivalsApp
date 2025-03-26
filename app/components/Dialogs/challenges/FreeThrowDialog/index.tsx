"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type FreeThrowDialogProps = {
  onChallengeAdded: () => void;
};

export default function FreeThrowDialog({ onChallengeAdded }: FreeThrowDialogProps) {
  const [open, setOpen] = useState(false); // State for dialog open/close
  const [data, setData] = useState({
    date: new Date(),
    attempts: "",
    madeShots: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const addChallenge = async () => {
    try {
      const response = await fetch("/api/challenge/freethrows", {
        method: "POST",
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          date: data.date,
          madeShots: parseInt(data.madeShots),
          attempts: parseInt(data.attempts),
        }),
      });
      let error = "";
      if (!response.ok) {
        error = await response.text();
      }
      if (response.status === 200) {
        toast.success("Free throw challenge added!");
        onChallengeAdded(); // Update stats and leaderboard immediately
        setOpen(false); // Close the dialog after a successful addition
      } else if (response.status === 400) {
        toast.error(error);
      }
    } catch (error) {
      console.error("Error adding challenge:", error);
      toast.error("Error adding challenge");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full p-2">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Free Throw Entry</DialogTitle>
          <DialogDescription>
            Enter the details for your free throw attempts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          <Input
            type="date"
            placeholder="Date"
            name="date"
            value={data.date.toISOString().split("T")[0]}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Attempts"
            name="attempts"
            value={data.attempts}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Made Shots"
            name="madeShots"
            value={data.madeShots}
            onChange={handleChange}
            className="w-full"
          />
          <Button variant="outline" onClick={addChallenge}>
            Save Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
