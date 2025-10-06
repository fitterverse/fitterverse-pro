// src/pages/Settings.tsx
import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useApp } from "@/state/appStore";

type Profile = {
  name?: string;
  goal?: string;
};

export default function Settings() {
  // Cast to any to stay compatible with your existing store shape.
  const { profile, setProfile } = (useApp() as any) || { profile: {}, setProfile: () => {} };

  const [name, setName] = React.useState<string>((profile?.name as string) || "");
  const [goal, setGoal] = React.useState<string>((profile?.goal as string) || "");

  function save() {
    (setProfile as (p: Profile) => void)({ name, goal });
    alert("Saved!");
  }

  return (
    <div className="container max-w-xl space-y-6 py-8">
      <Card>
        <h2 className="mb-4 text-xl font-semibold">Profile</h2>
        <div className="space-y-4">
          <Input
            label="First name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
          />
          <Input
            label="Main goal"
            value={goal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setGoal(e.target.value)
            }
          />
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-xl font-semibold">Export / Import</h2>
        <div className="text-sm text-slate-400">
          Future: sync or export your data.
        </div>
      </Card>
    </div>
  );
}
