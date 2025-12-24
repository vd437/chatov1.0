import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinGroup() {
  const navigate = useNavigate();
  const { inviteCode } = useParams();
  const [code, setCode] = useState(inviteCode ?? "");

  const normalized = useMemo(() => code.trim().toUpperCase(), [code]);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto p-4">
        <header className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Join Group</h1>
            <p className="text-sm text-muted-foreground">Enter an invite code to join a group.</p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={normalized}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABCD1234"
              aria-label="Group invite code"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/groups")}>
                Back to Groups
              </Button>
              <Button className="flex-1" onClick={() => navigate("/groups")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
