"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import StatusPill from "@/components/admin-portal/StatusPill";
import { memberStatusPill } from "@/components/admin-portal/statusPresentation";
import { storeMemberService } from "@/services/adminDemo";
import type { ActionResult, StoreMember } from "@/types/adminDemo";

interface MemberRowProps {
  member: StoreMember;
  // Re-fetch the roster after a state-changing action (suspend/un-suspend).
  onChanged: () => void;
}

// One roster row. Actions are derived from accountStatus (DATA_CONTRACT §2.3):
//   active → [Send recovery, Suspend] · invite_pending → [Resend invite]
//   suspended → [Un-suspend]. Secondary line shows email · jobTitle (demo-only).
const MemberRow = ({ member, onChanged }: MemberRowProps) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const pill = memberStatusPill[member.accountStatus];
  const display = member.name || member.email;

  const run = async (fn: () => Promise<ActionResult>) => {
    setBusy(true);
    try {
      const res = await fn();
      toast({ title: res.message, variant: res.ok ? "default" : "destructive" });
      onChanged();
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Action failed",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border py-3.5 last:border-0 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-info/15 text-info">
            {member.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold">{display}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {member.email}
            {member.jobTitle ? ` · ${member.jobTitle}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 md:justify-end">
        <StatusPill tone={pill.tone}>{pill.label}</StatusPill>
        <div className="flex gap-2">
          {member.accountStatus === "active" && (
            <>
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => run(() => storeMemberService.sendRecovery(member.memberId))}
              >
                Send recovery
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => run(() => storeMemberService.suspendMember(member.memberId))}
              >
                Suspend
              </Button>
            </>
          )}
          {member.accountStatus === "invite_pending" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => run(() => storeMemberService.resendInvite(member.memberId))}
            >
              Resend invite
            </Button>
          )}
          {member.accountStatus === "suspended" && (
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => run(() => storeMemberService.unsuspendMember(member.memberId))}
            >
              Un-suspend
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberRow;
