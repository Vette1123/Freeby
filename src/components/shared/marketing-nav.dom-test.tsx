import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";

// Mock next/navigation — must come before importing the component.
const mockPathname = vi.fn<() => string>(() => "/");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

// next-themes ThemeToggle reads context; stub it to a plain button.
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <button type="button" aria-label="Toggle theme" />,
}));

import { MarketingNav } from "@/components/shared/marketing-nav";

type Props = ComponentProps<typeof MarketingNav>;

function renderNav(props: Partial<Props> = {}) {
  return render(<MarketingNav isAuthenticated={false} {...props} />);
}

/**
 * Injects the tracked sections into the DOM (BEFORE rendering the nav) so
 * the scroll-spy observer finds them by id when its effect runs.
 */
function mountSections() {
  ["features", "pricing", "faq"].forEach((id) => {
    const el = document.createElement("section");
    el.id = id;
    el.textContent = id;
    document.body.appendChild(el);
  });
}

function renderWithSections(props: Partial<Props> = {}) {
  mountSections();
  return renderNav(props);
}

/**
 * Drives the IntersectionObserver mock: mark exactly one section visible.
 * Returns the observer instance the nav created.
 */
function getObserver() {
  // The mock stores instances on a static holder; we reach it via the
  // global class's __instances. Instead, simpler: the mock fires callback
  // on observe() — but our nav observes then waits for visibility changes.
  // We expose a helper on the global to drive it.
  return (globalThis as unknown as {
    __lastIntersectionObserver?: {
      setVisible: (ids: string[]) => void;
      setNoneVisible: () => void;
    };
  }).__lastIntersectionObserver;
}

describe("MarketingNav", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/");
    document.body.innerHTML = "";
  });

  it("renders brand, nav links, and auth CTAs", () => {
    renderNav();
    expect(screen.getByText("Freeby")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pricing" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start free/i })).toBeInTheDocument();
  });

  it("shows 'Dashboard' instead of auth links when authenticated", () => {
    renderNav({ isAuthenticated: true });
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /start free/i })).not.toBeInTheDocument();
  });

  it("all nav links point at the right hrefs", () => {
    renderNav();
    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
      "href",
      "/#features",
    );
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/#pricing",
    );
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute(
      "href",
      "/#faq",
    );
  });

  it("highlights the Features link when the features section is in view", async () => {
    renderWithSections();
    const obs = getObserver();
    expect(obs).toBeDefined();
    act(() => obs!.setVisible(["features"]));
    // State update from the observer callback is async — wait for re-render.
    await waitFor(() => {
      const featuresLink = screen.getByRole("link", { name: "Features" });
      const pill = featuresLink.querySelector(".bg-primary");
      expect(pill).not.toBeNull();
    });
  });

  it("clears the highlight when no section is in view (e.g. scrolled to hero)", async () => {
    renderWithSections();
    const obs = getObserver();
    // First activate features...
    act(() => obs!.setVisible(["features"]));
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Features" }).querySelector(".bg-primary"),
      ).not.toBeNull();
    });
    // ...then nothing is visible (user scrolled back to the hero).
    act(() => obs!.setNoneVisible());
    await waitFor(() => {
      for (const label of ["Features", "Pricing", "FAQ"]) {
        const link = screen.getByRole("link", { name: label });
        expect(link.querySelector(".bg-primary")).toBeNull();
      }
    });
  });

  it("does not spy sections on non-landing routes (no active pill)", () => {
    mockPathname.mockReturnValue("/pricing");
    renderWithSections();
    // On /pricing the spy never activates, so no pill anywhere.
    for (const label of ["Features", "Pricing", "FAQ"]) {
      const link = screen.getByRole("link", { name: label });
      expect(link.querySelector(".bg-primary")).toBeNull();
    }
  });

  it("mobile menu toggles open and closed on hamburger click", async () => {
    const user = userEvent.setup();
    renderNav();
    const menuButton = screen.getByRole("button", {
      name: /open menu/i,
    });
    await user.click(menuButton);
    // Menu open: the close button is now labelled.
    expect(
      screen.getByRole("button", { name: /close menu/i }),
    ).toBeInTheDocument();
    // Mobile links are visible.
    expect(screen.getAllByText("Features").length).toBeGreaterThanOrEqual(2);

    await user.click(
      screen.getByRole("button", { name: /close menu/i }),
    );
    expect(
      screen.queryByRole("button", { name: /close menu/i }),
    ).not.toBeInTheDocument();
  });
});
