"use client";

import React, { useEffect, useState } from "react";
import { ShortenedUser } from "@/types/User";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddFriendDialogProps {
  open: boolean;
  onClose: () => void;
  friendSearchQuery: string;
  setFriendSearchQuery: (value: string) => void;
  selectedUserId: string | null;
  handleSelectUser: (id: string) => void;
  handleSendInvite: (userId: string) => void;
}

export const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  open,
  onClose,
  friendSearchQuery,
  setFriendSearchQuery,
  selectedUserId,
  handleSelectUser,
  handleSendInvite,
}) => {
  const [searchResults, setSearchResults] = useState<ShortenedUser[]>([]);
  useEffect(() => {
    if (friendSearchQuery) {
      handleSearchQueryChange();
    } else {
      setSearchResults(prevValue => prevValue = []);
    }
  }
  , [friendSearchQuery]);
  const handleSearchQueryChange = async () => {
    try {
      const response = await fetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          searchQuery: friendSearchQuery,
        }),
        credentials: "include",
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>Search for users to add as friend.</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search users..."
            value={friendSearchQuery}
            onChange={(e) => setFriendSearchQuery(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded p-2 w-full"
          />
          <ScrollArea className="mt-2 h-60">
            <ul className="space-y-2">
              {searchResults.map((user) => (
                <li
                  key={user.id}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer flex items-center justify-between h-12"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <span>{user.nickname}</span>
                  <div className="w-32 flex justify-end">
                    {selectedUserId === user.id && (
                      <Button
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendInvite(user.id);
                        }}
                        className="bg-brand-orange hover:bg-orange-600 text-white cursor-pointer"
                      >
                        Send Invite
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="default" onClick={onClose} className="bg-brand-orange hover:bg-orange-600 text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
