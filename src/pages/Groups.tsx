import { useState, useEffect } from "react";
import { Users, Plus, Search, Crown, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  avatar_url?: string;
  member_count: number;
  is_admin: boolean;
  created_at: string;
}

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    fetchGroups();
  }, [currentUserId]);

  const fetchGroups = async () => {
    const { data: memberGroups } = await supabase
      .from("group_members")
      .select(`
        is_admin,
        groups (
          id,
          name,
          avatar_url,
          created_at
        )
      `)
      .eq("user_id", currentUserId);

    if (memberGroups) {
      const groupsWithCounts = await Promise.all(
        memberGroups.map(async (mg: any) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", mg.groups.id);

          return {
            id: mg.groups.id,
            name: mg.groups.name,
            avatar_url: mg.groups.avatar_url,
            member_count: count || 0,
            is_admin: mg.is_admin,
            created_at: mg.groups.created_at,
          };
        })
      );
      setGroups(groupsWithCounts);
    }
  };

  const filteredGroups = groups.filter((group) =>
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
                        // Navigate to group settings
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

export default Groups;
