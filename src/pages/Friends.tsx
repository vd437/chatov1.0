import { useState } from "react";
import { Search, UserPlus, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendRequestsSection } from "@/components/FriendRequestsSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

const mockFriends: Friend[] = [
  { id: "1", name: "John Doe", avatar: "", online: true },
  { id: "2", name: "Jane Smith", avatar: "", online: false },
  { id: "3", name: "Bob Johnson", avatar: "", online: true },
  { id: "4", name: "Alice Williams", avatar: "", online: false },
  { id: "5", name: "Charlie Brown", avatar: "", online: true },
];

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteFriend = () => {
    if (selectedFriend) {
      setFriends(friends.filter((f) => f.id !== selectedFriend.id));
      toast({
        title: "Friend removed",
        description: `${selectedFriend.name} has been removed from your friends list`,
      });
      setDeleteDialogOpen(false);
      setSelectedFriend(null);
    }
  };

  const openDeleteDialog = (friend: Friend) => {
    setSelectedFriend(friend);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-muted-foreground mt-1">
              You have {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/user-search")}>
            <UserPlus className="h-4 w-4" />
            Add Friend
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Friends</TabsTrigger>
            <TabsTrigger value="requests">Friend Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Friends List */}
            <div className="space-y-2">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? "No friends found" : "No friends yet"}
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/user/${friend.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        {friend.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {friend.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(friend);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="pt-4">
            <FriendRequestsSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedFriend?.name} from your friends list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFriend}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Friends;
