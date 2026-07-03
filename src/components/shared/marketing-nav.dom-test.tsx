import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
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
 * Sets the URL hash and dispatches `hashchange` so the nav's listener
 * re-syncs its active state — mirrors what the browser does on anchor nav.
 */
function setHash(hash: string) {
  const url = new URL(window.location.href);
  url.hash = hash;
  window.history.replaceState({}, "", url);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/** Whether a desktop nav link currently shows the active ring/pill. */
function linkIsActive(label: string) {
  const link = screen.getAllByRole("link", { name: label })[0];
  // Active links render an inset ring span; inactive ones render the hover
  // bg span (bg-transparent). We detect active by the ring class.
  return Boolean(link.querySelector(".ring-primary\\/20"));
}

describe("MarketingNav", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/");
    document.body.innerHTML = "";
    window.location.hash = "";
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

  it("highlights Features when the hash is #features", () => {
    renderNav();
    act(() => setHash("features"));
    expect(linkIsActive("Features")).toBe(true);
    expect(linkIsActive("Pricing")).toBe(false);
    expect(linkIsActive("FAQ")).toBe(false);
  });

  it("switches the highlight to Pricing when the hash changes", () => {
    renderNav();
    act(() => setHash("features"));
    expect(linkIsActive("Features")).toBe(true);
    act(() => setHash("pricing"));
    expect(linkIsActive("Features")).toBe(false);
    expect(linkIsActive("Pricing")).toBe(true);
  });

  it("clears the highlight when the hash is cleared (logo click)", () => {
    renderNav();
    act(() => setHash("pricing"));
    expect(linkIsActive("Pricing")).toBe(true);
    // Logo navigates to "/" — no hash.
    act(() => setHash(""));
    expect(linkIsActive("Features")).toBe(false);
    expect(linkIsActive("Pricing")).toBe(false);
    expect(linkIsActive("FAQ")).toBe(false);
  });

  it("never highlights links on non-landing routes", () => {
    mockPathname.mockReturnValue("/pricing");
    renderNav();
    act(() => setHash("features"));
    expect(linkIsActive("Features")).toBe(false);
    expect(linkIsActive("Pricing")).toBe(false);
    expect(linkIsActive("FAQ")).toBe(false);
  });

  it("mobile menu toggles open and closed on hamburger click", async () => {
    const user = userEvent.setup();
    renderNav();
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    await user.click(menuButton);
    expect(
      screen.getByRole("button", { name: /close menu/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Features").length).toBeGreaterThanOrEqual(2);

    await user.click(screen.getByRole("button", { name: /close menu/i }));
    expect(
      screen.queryByRole("button", { name: /close menu/i }),
    ).not.toBeInTheDocument();
  });
});
