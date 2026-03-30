import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";

type DropsheetRow = {
  id: number;
  loadNumber: string;
  loadNumberShort: string | null;
  trailer: string | null;
  percentCompleted: number;
  loadedAt: string | null;
  dropWeight: number;
  driverId: number | null;
  driverName: string | null;
  allLoaded: boolean;
  loaderName: string | null;
};

type LoaderRow = {
  id: number;
  name: string;
  isActive: boolean;
};

type TrailerRow = {
  id: number;
  name: string;
};

type QueryState<T> = {
  current: T;
  loading: boolean;
  error: Error | null;
  refresh: ReturnType<typeof vi.fn>;
};

const {
  goto,
  getDropsheets,
  getLoaders,
  getTrailers,
  updateDropsheetPickedByLoader,
  updateDropsheetTrailer,
} = vi.hoisted(() => ({
  goto: vi.fn(),
  getDropsheets: vi.fn<(date: string) => QueryState<DropsheetRow[]>>(),
  getLoaders: vi.fn<() => QueryState<LoaderRow[]>>(),
  getTrailers: vi.fn<() => QueryState<TrailerRow[]>>(),
  updateDropsheetPickedByLoader: vi.fn(),
  updateDropsheetTrailer: vi.fn(),
}));

vi.mock("$app/navigation", () => ({
  goto,
}));

vi.mock("$lib/dropsheets.remote", () => ({
  getDropsheets,
  updateDropsheetPickedByLoader,
}));

vi.mock("$lib/loaders.cached", () => ({
  getLoaders,
}));

vi.mock("$lib/trailers.cached", () => ({
  getTrailers,
}));

vi.mock("$lib/trailers.remote", () => ({
  updateDropsheetTrailer,
}));

import DropsheetsPage from "./+page.svelte";

function createQueryState<T>(
  current: T,
  overrides: Partial<QueryState<T>> = {},
): QueryState<T> {
  return {
    current,
    loading: false,
    error: null,
    refresh: vi.fn(),
    ...overrides,
  };
}

function formatLoadedAt(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

const layoutData = {
  activeTarget: "Canton" as const,
  displayName: "Loader One",
  isAdmin: false,
  selectedDate: "2026-03-24",
  userEmail: "loader@dakotasteelandtrim.com",
  userRole: "loading" as const,
};

describe("dropsheets page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-24T12:00:00-04:00"));
    goto.mockReset();
    goto.mockResolvedValue(undefined);
    getDropsheets.mockReset();
    getLoaders.mockReset();
    getTrailers.mockReset();
    updateDropsheetPickedByLoader.mockReset();
    updateDropsheetTrailer.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the legacy loading table with the expected fallbacks and completion state", async () => {
    const hiddenLoadedAt = formatLoadedAt("2026-03-24T08:00:00Z");
    const visibleLoadedAt = formatLoadedAt("2026-03-24T12:15:00Z");

    getDropsheets.mockReturnValue(
      createQueryState([
        {
          id: 42,
          loadNumber: "L-042",
          loadNumberShort: "042",
          trailer: null,
          percentCompleted: 0.875,
          loadedAt: "2026-03-24T08:00:00Z",
          dropWeight: 4.3,
          driverId: 12,
          driverName: "Dylan Driver",
          allLoaded: false,
          loaderName: null,
        },
        {
          id: 91,
          loadNumber: "L-091",
          loadNumberShort: "091",
          trailer: "TR-19",
          percentCompleted: 1,
          loadedAt: "2026-03-24T12:15:00Z",
          dropWeight: 3022.4,
          driverId: 44,
          driverName: "Taylor Driver",
          allLoaded: true,
          loaderName: "Chris",
        },
      ]),
    );
    getLoaders.mockReturnValue(
      createQueryState([{ id: 1, name: "Alex", isActive: true }]),
    );
    getTrailers.mockReturnValue(createQueryState([{ id: 9, name: "TR-9" }]));

    render(DropsheetsPage, {
      params: {},
      form: undefined,
      data: {
        ...layoutData,
      },
    });

    await expect.element(page.getByTestId("dropsheets-row-count")).not.toBeInTheDocument();
    await expect.element(page.getByText("Loading Items")).not.toBeInTheDocument();
    await expect
      .element(
        page.getByText(
          "Select a date, then tap trailer or loader cells to update the legacy loading list.",
        ),
      )
      .not.toBeInTheDocument();
    await expect.element(page.getByText("Delivery Number")).toBeInTheDocument();
    await expect.element(page.getByText("Drop Weight")).toBeInTheDocument();
    await expect.element(page.getByText("Load Number")).toBeInTheDocument();
    await expect.element(page.getByText("Trailer Number")).toBeInTheDocument();
    await expect
      .element(page.getByTestId("dropsheets-percent-completed-header"))
      .toBeInTheDocument();
    await expect.element(page.getByText("Loaded TS")).toBeInTheDocument();
    await expect
      .element(page.getByText("Loader", { exact: true }))
      .toBeInTheDocument();
    await expect.element(page.getByText("Go")).toBeInTheDocument();

    await expect.element(page.getByText("L-042")).toBeInTheDocument();
    await expect.element(page.getByRole("cell", { name: "L-042", exact: true })).toHaveClass(
      /border-b/
    );
    await expect
      .element(page.getByRole("cell", { name: "L-042", exact: true }))
      .toHaveClass(/border-slate-100/);
    await expect
      .element(page.getByText("042", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: /Change trailer for L-042/i }))
      .toHaveTextContent("NA");
    await expect
      .element(page.getByRole("button", { name: /Change trailer for L-042/i }))
      .toHaveClass(
        /bg-\[linear-gradient\(135deg,rgba\(0,88,188,0\.98\),rgba\(0,112,235,0\.98\)\)\]/
      );
    await expect
      .element(page.getByRole("button", { name: /Change trailer for L-042/i }))
      .toHaveClass(/min-h-12/);
    await expect.element(page.getByText("4.30")).toBeInTheDocument();
    await expect.element(page.getByText("87.50%")).toBeInTheDocument();
    await expect
      .element(page.getByText(hiddenLoadedAt))
      .not.toBeInTheDocument();
    await expect.element(page.getByLabelText("Completed L-042")).toBeDisabled();
    await expect
      .element(page.getByRole("button", { name: /Change loader for L-042/i }))
      .toHaveTextContent("Set Loader");

    await expect.element(page.getByText("L-091")).toBeInTheDocument();
    await expect
      .element(page.getByText("091", { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: /Change trailer for L-091/i }))
      .toHaveTextContent("TR-19");
    await expect.element(page.getByText("100.00%")).toBeInTheDocument();
    await expect.element(page.getByText(visibleLoadedAt)).toBeInTheDocument();
    await expect.element(page.getByLabelText("Completed L-091")).toBeDisabled();
    await expect
      .element(page.getByRole("button", { name: /Change loader for L-091/i }))
      .toHaveTextContent("Chris");
    await expect
      .element(page.getByRole("button", { name: /Change loader for L-091/i }))
      .toHaveClass(
        /bg-\[linear-gradient\(135deg,rgba\(0,88,188,0\.98\),rgba\(0,112,235,0\.98\)\)\]/
      );
    await expect
      .element(page.getByRole("button", { name: /Change loader for L-091/i }))
      .toHaveClass(/min-h-12/);
    await expect
      .element(page.getByLabelText("Open select category for L-042"))
      .toHaveClass(/size-12/);
  });

  it("shows the shared spinner in the refresh button while dropsheets are loading", async () => {
    getDropsheets.mockReturnValue(
      createQueryState([], { loading: true }),
    );
    getLoaders.mockReturnValue(
      createQueryState([{ id: 1, name: "Alex", isActive: true }]),
    );
    getTrailers.mockReturnValue(createQueryState([{ id: 9, name: "TR-9" }]));

    render(DropsheetsPage, {
      params: {},
      form: undefined,
      data: {
        ...layoutData,
      },
    });

    await expect.element(page.getByTestId("dropsheets-refresh-spinner")).toBeInTheDocument();
    await expect.element(page.getByText("Loading order status")).toBeInTheDocument();
    await expect.element(page.getByText("Loading dropsheets...")).not.toBeInTheDocument();
  });


  it("opens the date picker and reloads the list when a new day is chosen", async () => {
    const dayOneRefresh = vi.fn();
    const dayTwoRefresh = vi.fn();

    getDropsheets.mockImplementation((date) => {
      if (date === "2026-03-25") {
        return createQueryState(
          [
            {
              id: 91,
              loadNumber: "L-091",
              loadNumberShort: "091",
              trailer: "TR-25",
              percentCompleted: 1,
              loadedAt: "2026-03-25T08:00:00Z",
              dropWeight: 3022.4,
              driverId: 44,
              driverName: "Taylor Day Two",
              allLoaded: true,
              loaderName: "Chris",
            },
          ],
          { refresh: dayTwoRefresh },
        );
      }

      return createQueryState(
        [
          {
            id: 42,
            loadNumber: "L-042",
            loadNumberShort: "042",
            trailer: "TR-9",
            percentCompleted: 0.875,
            loadedAt: "2026-03-24T08:00:00Z",
            dropWeight: 2152.4,
            driverId: 12,
            driverName: "Dylan Driver",
            allLoaded: false,
            loaderName: "Alex",
          },
        ],
        { refresh: dayOneRefresh },
      );
    });
    getLoaders.mockReturnValue(
      createQueryState([{ id: 1, name: "Alex", isActive: true }]),
    );
    getTrailers.mockReturnValue(createQueryState([{ id: 9, name: "TR-9" }]));

    const view = render(DropsheetsPage, {
      params: {},
      form: undefined,
      data: {
        ...layoutData,
      },
    });

    await page.getByRole("button", { name: /Load date/i }).click();
    await expect
      .element(page.getByRole("button", { name: "25" }))
      .toBeInTheDocument();
    await page.getByRole("button", { name: "25" }).click();

    expect(goto).toHaveBeenCalledWith("/dropsheets?date=2026-03-25", {
      noScroll: true,
    });

    await view.rerender({
      params: {},
      form: undefined,
      data: {
        ...layoutData,
        selectedDate: "2026-03-25",
      },
    });

    expect(getDropsheets).toHaveBeenCalledWith("2026-03-25");
    await expect.element(page.getByText("L-091")).toBeInTheDocument();
    await expect.element(page.getByText("L-042")).not.toBeInTheDocument();
  });

  it("updates trailer and loader assignments from the picker modals", async () => {
    const refresh = vi.fn();
    const trailerRefresh = vi.fn();
    const loaderRefresh = vi.fn();

    getDropsheets.mockReturnValue(
      createQueryState(
        [
          {
            id: 42,
            loadNumber: "L-042",
            loadNumberShort: "042",
            trailer: null,
            percentCompleted: 0.875,
            loadedAt: "2026-03-24T08:00:00Z",
            dropWeight: 2152.4,
            driverId: 12,
            driverName: "Dylan Driver",
            allLoaded: false,
            loaderName: null,
          },
        ],
        { refresh },
      ),
    );
    getLoaders.mockReturnValue(
      createQueryState([
        { id: 1, name: "Alex", isActive: true },
        { id: 2, name: "Taylor", isActive: true },
        { id: 3, name: "Casey", isActive: false },
      ], { refresh: loaderRefresh }),
    );
    getTrailers.mockReturnValue(
      createQueryState([
        { id: 9, name: "TR-9" },
        { id: 12, name: "TR-12" },
      ], { refresh: trailerRefresh }),
    );
    updateDropsheetTrailer.mockResolvedValue(undefined);
    updateDropsheetPickedByLoader.mockResolvedValue(undefined);

    render(DropsheetsPage, {
      params: {},
      form: undefined,
      data: {
        ...layoutData,
      },
    });

    await page
      .getByRole("button", { name: /Change trailer for L-042/i })
      .click();
    await expect
      .element(page.getByRole("dialog", { name: "Select trailer" }))
      .toBeInTheDocument();
    await expect.element(page.getByRole("button", { name: "Refresh list" })).toBeInTheDocument();
    await page.getByRole("button", { name: "Refresh list" }).click();
    expect(trailerRefresh).toHaveBeenCalledOnce();
    await expect
      .element(page.getByRole("button", { name: "TR-12" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Casey" }))
      .not.toBeInTheDocument();
    await page.getByRole("button", { name: "TR-12" }).click();

    expect(updateDropsheetTrailer).toHaveBeenCalledWith({
      dropSheetId: 42,
      trailerId: 12,
    });
    expect(refresh).toHaveBeenCalledOnce();
    await expect
      .element(page.getByRole("dialog", { name: "Select trailer" }))
      .not.toBeInTheDocument();

    await page
      .getByRole("button", { name: /Change loader for L-042/i })
      .click();
    await expect
      .element(page.getByRole("dialog", { name: "Select loader" }))
      .toBeInTheDocument();
    await expect.element(page.getByRole("button", { name: "Refresh list" })).toBeInTheDocument();
    await page.getByRole("button", { name: "Refresh list" }).click();
    expect(loaderRefresh).toHaveBeenCalledOnce();
    await expect
      .element(page.getByRole("button", { name: "Alex" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Taylor" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Casey" }))
      .not.toBeInTheDocument();
    await page.getByRole("button", { name: "Taylor" }).click();

    expect(updateDropsheetPickedByLoader).toHaveBeenCalledWith({
      dropSheetId: 42,
      loaderName: "Taylor",
    });
    expect(refresh).toHaveBeenCalledTimes(2);
    await expect
      .element(page.getByRole("dialog", { name: "Select loader" }))
      .not.toBeInTheDocument();
  });

  it("navigates to select-category from the chevron action", async () => {
    getDropsheets.mockReturnValue(
      createQueryState([
        {
          id: 42,
          loadNumber: "L-042",
          loadNumberShort: "042",
          trailer: "TR-9",
          percentCompleted: 0.875,
          loadedAt: "2026-03-24T08:00:00Z",
          dropWeight: 2152.4,
          driverId: 12,
          driverName: "Dylan Driver",
          allLoaded: false,
          loaderName: "Alex",
        },
      ]),
    );
    getLoaders.mockReturnValue(
      createQueryState([{ id: 1, name: "Alex", isActive: true }]),
    );
    getTrailers.mockReturnValue(createQueryState([{ id: 9, name: "TR-9" }]));

    render(DropsheetsPage, {
      params: {},
      form: undefined,
      data: {
        ...layoutData,
      },
    });

    await page
      .getByRole("button", { name: /Open select category for L-042/i })
      .click();

    expect(goto).toHaveBeenCalledWith(
      "/select-category/42?loadNumber=L-042&deliveryNumber=L-042&driverName=Dylan+Driver&dropWeight=2152.4&returnTo=%2Fdropsheets%3Fdate%3D2026-03-24",
    );
  });

  it("shows the empty state when the selected date has no dropsheets", async () => {
    getDropsheets.mockReturnValue(createQueryState([]));
    getLoaders.mockReturnValue(
      createQueryState([{ id: 1, name: "Alex", isActive: true }]),
    );
    getTrailers.mockReturnValue(createQueryState([{ id: 9, name: "TR-9" }]));

    render(DropsheetsPage, {
      params: {},
      form: undefined,
      data: {
        ...layoutData,
      },
    });

    await expect
      .element(page.getByText("No dropsheets scheduled for this date."))
      .toBeInTheDocument();
    await expect
      .element(
        page.getByText(
          "Choose another date or refresh when dispatch publishes the schedule.",
        ),
      )
      .toBeInTheDocument();
  });
});
