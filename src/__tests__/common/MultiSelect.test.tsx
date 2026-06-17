/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MultiSelect from "@/components/common/MultiSelect";

const options = ["AssistRx", "Caremark", "OptumRx", "Express Scripts"];

describe("MultiSelect", () => {
  it("trigger shows 'All' when nothing is selected", () => {
    render(<MultiSelect options={options} selected={[]} onChange={() => {}} />);
    expect(screen.getByTestId("multiselect-trigger")).toHaveTextContent("All");
  });

  it("trigger shows 'N selected' when items are selected", () => {
    render(
      <MultiSelect
        options={options}
        selected={["Caremark", "OptumRx"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId("multiselect-trigger")).toHaveTextContent(
      "2 selected",
    );
  });

  it("opens panel when trigger is clicked", () => {
    render(<MultiSelect options={options} selected={[]} onChange={() => {}} />);
    expect(screen.queryByTestId("multiselect-panel")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    expect(screen.getByTestId("multiselect-panel")).toBeInTheDocument();
  });

  it("toggling an unselected option calls onChange with the option added", () => {
    const onChange = jest.fn();
    render(
      <MultiSelect options={options} selected={[]} onChange={onChange} />,
    );
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    fireEvent.click(screen.getByLabelText("Caremark"));
    expect(onChange).toHaveBeenCalledWith(["Caremark"]);
  });

  it("toggling a selected option calls onChange with the option removed", () => {
    const onChange = jest.fn();
    render(
      <MultiSelect
        options={options}
        selected={["Caremark"]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    fireEvent.click(screen.getByLabelText("Caremark"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("'Clear all' button only renders when something is selected", () => {
    const { rerender } = render(
      <MultiSelect options={options} selected={[]} onChange={() => {}} />,
    );
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    expect(screen.queryByTestId("multiselect-clear")).not.toBeInTheDocument();

    rerender(
      <MultiSelect
        options={options}
        selected={["Caremark"]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId("multiselect-clear")).toBeInTheDocument();
  });

  it("clicking 'Clear all' calls onChange with empty array", () => {
    const onChange = jest.fn();
    render(
      <MultiSelect
        options={options}
        selected={["Caremark", "OptumRx"]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    fireEvent.click(screen.getByTestId("multiselect-clear"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("search filters the visible options", () => {
    render(<MultiSelect options={options} selected={[]} onChange={() => {}} />);
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "care" },
    });
    expect(screen.getByLabelText("Caremark")).toBeInTheDocument();
    expect(screen.queryByLabelText("AssistRx")).not.toBeInTheDocument();
  });

  it("outside mousedown closes the panel", () => {
    render(
      <div>
        <MultiSelect options={options} selected={[]} onChange={() => {}} />
        <div data-testid="outside">outside</div>
      </div>,
    );
    fireEvent.click(screen.getByTestId("multiselect-trigger"));
    expect(screen.getByTestId("multiselect-panel")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByTestId("multiselect-panel")).not.toBeInTheDocument();
  });
});
