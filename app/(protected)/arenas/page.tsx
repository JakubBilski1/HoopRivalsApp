"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pen, PlusIcon, Trash } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import Loading from "@/app/loading";
import ButtonLoading from "@/app/button-loading"

interface Arena {
  id: number;
  name: string;
  location: string;
  imageUrl: string;
}

interface NewArena {
  name: string;
  location: string;
  imageFile: File | null;
}

export default function ArenasPage() {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [newArena, setNewArena] = useState<NewArena>({
    name: "",
    location: "",
    imageFile: null,
  });
  // If editing, store the arena object, otherwise null
  const [editingArena, setEditingArena] = useState<Arena | null>(null);
  const [arenaToDelete, setArenaToDelete] = useState<Arena | null>(null);
  const [loading, setLoading] = useState(false);

  // New loading states for add, update, and delete
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingArenaId, setDeletingArenaId] = useState<number | null>(null);

  const fetchArenas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/arenas");
      if (!res.ok) {
        throw new Error("Failed to fetch arenas");
      }
      const newArenas: Arena[] = await res.json();
      setArenas(newArenas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArenas();
  }, []);

  const addArena = async () => {
    if (!newArena.imageFile) {
      console.error("No image file selected.");
      return;
    }
    setIsAdding(true);
    const formData = new FormData();
    formData.append("name", newArena.name);
    formData.append("location", newArena.location);
    formData.append("image", newArena.imageFile);

    try {
      const res = await fetch("/api/arenas", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to add arena");
      }
      fetchArenas();
      toast.success("Arena added successfully");
      // Reset the form
      setNewArena({ name: "", location: "", imageFile: null });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const updateArena = async () => {
    if (!editingArena) return;
    setIsUpdating(true);
    const formData = new FormData();
    formData.append("id", editingArena.id.toString());
    formData.append("name", newArena.name);
    formData.append("location", newArena.location);
    if (newArena.imageFile) {
      formData.append("image", newArena.imageFile);
    }

    try {
      const res = await fetch(`/api/arenas/${editingArena.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to update arena");
      }
      fetchArenas();
      toast.success("Arena updated successfully");
      setEditingArena(null);
      setNewArena({ name: "", location: "", imageFile: null });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteArena = async (id: number) => {
    setDeletingArenaId(id);
    try {
      const res = await fetch(`/api/arenas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete arena");
      }
      toast.success("Arena deleted successfully");
      fetchArenas();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingArenaId(null);
    }
  };

  const handleEditClick = (arena: Arena) => {
    setEditingArena(arena);
    setNewArena({ name: arena.name, location: arena.location, imageFile: null });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-4 w-full">
      {/* Sidebar */}
      {/* <div className="md:h-[83vh] md:w-1/4 bg-brand-dark p-4 overflow-auto rounded-md border">
        <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>
        <Input
          placeholder="Search arenas..."
          className="bg-gray-800 border-gray-700 mb-4"
        />
      </div> */}

      {/* Main Content */}
      <div className="md:h-[83vh] flex-1 bg-brand-dark p-4 overflow-auto rounded-md border">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Arenas</h1>
          {/* Dialog for adding arena */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-orange-500 text-white cursor-pointer">
                <PlusIcon className="mr-2" /> Add Arena
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-brand-dark text-white border-0">
              <DialogTitle className="text-white">Add New Arena</DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    className="bg-gray-800 border-gray-700"
                    value={newArena.name}
                    onChange={(e) =>
                      setNewArena({ ...newArena, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    className="bg-gray-800 border-gray-700"
                    value={newArena.location}
                    onChange={(e) =>
                      setNewArena({ ...newArena, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Upload Photo</Label>
                  <Input
                    type="file"
                    className="bg-gray-800 border-gray-700"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewArena({
                          ...newArena,
                          imageFile: e.target.files[0],
                        });
                      }
                    }}
                  />
                </div>
                <Button
                  className="bg-brand-orange hover:bg-orange-500"
                  onClick={addArena}
                  disabled={isAdding}
                >
                  {isAdding ? <ButtonLoading /> : "Add Arena"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog for editing */}
          {editingArena && (
            <Dialog
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingArena(null);
                  setNewArena({ name: "", location: "", imageFile: null });
                }
              }}
            >
              <DialogContent className="bg-brand-dark text-white border-0">
                <DialogTitle className="text-white">Edit Arena</DialogTitle>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      className="bg-gray-800 border-gray-700"
                      value={newArena.name}
                      onChange={(e) =>
                        setNewArena({ ...newArena, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      className="bg-gray-800 border-gray-700"
                      value={newArena.location}
                      onChange={(e) =>
                        setNewArena({ ...newArena, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Upload New Photo (optional)</Label>
                    <Input
                      type="file"
                      className="bg-gray-800 border-gray-700"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewArena({
                            ...newArena,
                            imageFile: e.target.files[0],
                          });
                        }
                      }}
                    />
                  </div>
                  <Button
                    className="bg-brand-orange hover:bg-orange-500"
                    onClick={updateArena}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <ButtonLoading /> : "Update Arena"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading && (
          <div className="flex justify-center">
            <Loading />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {arenas.length ? (
            arenas.map((arena) => (
              <Card
                key={arena.id}
                className="bg-gray-800 border-gray-700 p-0 gap-0"
              >
                <img
                  src={`data:image/png;base64,${arena.imageUrl}`}
                  alt={arena.name}
                  className="h-48 w-full object-cover rounded-t-md"
                />
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-brand-orange">
                      {arena.name}
                    </h3>
                    <p className="text-sm text-gray-400">{arena.location}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 cursor-pointer"
                          onClick={() => setArenaToDelete(arena)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-brand-dark text-white border-0">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove arena {arena.name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await deleteArena(arena.id);
                              setArenaToDelete(null);
                            }}
                          >
                            {deletingArenaId === arena.id ? (
                              <ButtonLoading />
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 cursor-pointer"
                      onClick={() => handleEditClick(arena)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-400 col-span-full">No arenas added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
