"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ownerStoresService } from "@/services/adminDemo";

// Drops a fresh mock store card (no Stripe, no charge). Caller reloads its list.
const AddStoreButton = ({ onAdded }: { onAdded: () => void }) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      const store = await ownerStoresService.addStore();
      toast({ title: `${store.name} added (demo — no charge)` });
      onAdded();
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Failed to add store",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button disabled={busy} onClick={handle}>
      <Plus className="mr-2 h-4 w-4" />
      Add store
    </Button>
  );
};

export default AddStoreButton;
