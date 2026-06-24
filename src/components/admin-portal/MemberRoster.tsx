"use client";

import { Users } from "lucide-react";
import MemberRow from "@/components/admin-portal/MemberRow";
import EmptyState from "@/components/common/EmptyState";
import type { StoreMember } from "@/types/adminDemo";

interface MemberRosterProps {
  members: StoreMember[];
  onChanged: () => void;
}

// Bordered roster container. Zero members → EmptyState (store-4 in the seed).
const MemberRoster = ({ members, onChanged }: MemberRosterProps) => {
  if (members.length === 0) {
    return (
      <div className="bg-card border border-border">
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          headline="No members yet"
          subcopy="Invite someone to get started."
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border px-4">
      {members.map((m) => (
        <MemberRow key={m.memberId} member={m} onChanged={onChanged} />
      ))}
    </div>
  );
};

export default MemberRoster;
