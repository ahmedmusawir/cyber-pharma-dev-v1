/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import SettingsForm from "@/components/admin-portal/SettingsForm";
import { settingsService } from "@/services/adminDemo";
import type { PharmacySettings } from "@/types/adminDemo";

const settings: PharmacySettings = {
  storeId: "store-1",
  pharmacyName: "Hyde Park Pharmacy",
  contactPerson: "Daniel Brooks",
  phone: "(312) 555-0142",
  address: "4820 S Cottage Grove Ave, Chicago, IL 60615",
  pharmacySoftware: "PioneerRx",
};

// Intent (K9): editing a field and saving routes the EDITED value through the
// settings service for the correct store — not a no-op, not the old value.
describe("SettingsForm", () => {
  it("saves edited values through the settings service", async () => {
    const spy = jest
      .spyOn(settingsService, "saveSettings")
      .mockResolvedValue({ ok: true, message: "Settings saved" });

    render(<SettingsForm settings={settings} />);

    fireEvent.change(screen.getByDisplayValue("Hyde Park Pharmacy"), {
      target: { value: "Hyde Park Rx" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        storeId: "store-1",
        pharmacyName: "Hyde Park Rx",
      })
    );
  });
});
