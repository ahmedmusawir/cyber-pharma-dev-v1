"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { settingsService } from "@/services/adminDemo";
import type { PharmacySettings } from "@/types/adminDemo";

const schema = z.object({
  pharmacyName: z.string().min(1, "Pharmacy name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  pharmacySoftware: z.string().min(1, "Pharmacy software is required"),
});
type SettingsValues = z.infer<typeof schema>;

const FIELDS: { name: keyof SettingsValues; label: string }[] = [
  { name: "pharmacyName", label: "Pharmacy name" },
  { name: "contactPerson", label: "Contact person" },
  { name: "phone", label: "Phone" },
  { name: "address", label: "Address" },
  { name: "pharmacySoftware", label: "Pharmacy software" },
];

// In-memory pharmacy settings (refresh resets). Save toasts + appends an audit
// entry via the service; storeId rides along unchanged.
const SettingsForm = ({ settings }: { settings: PharmacySettings }) => {
  const { toast } = useToast();
  const form = useForm<SettingsValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pharmacyName: settings.pharmacyName,
      contactPerson: settings.contactPerson,
      phone: settings.phone,
      address: settings.address,
      pharmacySoftware: settings.pharmacySoftware,
    },
  });

  const onSubmit = async (values: SettingsValues) => {
    try {
      const res = await settingsService.saveSettings({
        storeId: settings.storeId,
        ...values,
      });
      toast({ title: res.message });
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Save failed",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-[560px] space-y-5"
      >
        {FIELDS.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">
                  {f.label}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save changes
        </Button>
      </form>
    </Form>
  );
};

export default SettingsForm;
