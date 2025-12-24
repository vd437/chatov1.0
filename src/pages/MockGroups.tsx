import { useState } from "react";
import { Users, Plus, Search, Crown, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMockAuth } from "@/contexts/MockAuthContext";
import { useMockData } from "@/contexts/MockDataContext";

const MockGroups = () => {
  const navigate = useNavigate();
  const { user } = useMockAuth();
  const { groups, getGroupMembers, getUserMembership } = useMockData();
  const [searchQuery, setSearchQuery] = useState("");

  // Get groups where user is a member
  const userGroups = groups
    .filter((group) => {
      const membership = getUserMembership(group.id, user?.id || "");
      return membership && !membership.is_banned;
    })
    .map((group) => {
      const members = getGroupMembers(group.id);
      const membership = getUserMembership(group.id, user?.id || "");
      return {
        ...group,
        member_count: members.length,
        is_admin: membership?.is_admin || false,
      };
    });

  const filteredGroups = userGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Groups</h1>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => navigate("/create-group")}
            >
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="p-4 space-y-2">
          {filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No groups yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a group to start chatting with friends
              </p>
              <Button onClick={() => navigate("/create-group")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          )}
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-soft transition-all cursor-pointer"
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={group.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {group.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{group.name}</h3>
                    {group.is_admin && (
                      <Crown className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{group.member_count} members</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {group.is_admin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/group/${group.id}/profile`);
                      }}
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockGroups;
