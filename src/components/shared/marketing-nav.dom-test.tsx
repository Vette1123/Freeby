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

// Map of section id -> its document-relative top position (px).
// Positions mimic the real landing page layout (hero, then features,
// pricing, faq stacked below).
const SECTION_TOPS: Record<string, number> = {
  features: 800,
  pricing: 2000,
  faq: 3200,
};

/**
 * Mounts the tracked sections into the DOM and stubs getBoundingClientRect
 * so the nav's scroll-spy sees them at the given document positions.
 * `scrollY` controls window.scrollY (what the scroll handler reads).
 */
function mountSections(scrollY = 0) {
  Object.entries(SECTION_TOPS).forEach(([id, top]) => {
    const el = document.createElement("section");
    el.id = id;
    el.textContent = id;
    // getBoundingClientRect().top is viewport-relative = documentTop - scrollY
    const spy = vi.fn(() => ({
      top: top - scrollY,
      bottom: top - scrollY + 400,
      height: 400,
      width: 800,
      left: 0,
      right: 800,
      x: 0,
      y: top - scrollY,
      toJSON: () => ({}),
    }));
    el.getBoundingClientRect = spy as HTMLElement["getBoundingClientRect"];
    document.body.appendChild(el);
  });
  Object.defineProperty(window, "scrollY", {
    writable: true,
    value: scrollY,
    configurable: true,
  });
}

/** Triggers the nav's scroll handler (rAF-throttled) and flushes it. */
async function flushScroll() {
  await act(async () => {
    window.dispatchEvent(new Event("scroll"));
    // rAF is async — let it resolve before act flushes.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 0));
  });
}

function renderNav(props: Partial<Props> = {}) {
  return render(<MarketingNav isAuthenticated={false} {...props} />);
}

/** Whether a desktop nav link currently shows the active pill. */
function linkIsActive(label: string) {
  const link = screen.getAllByRole("link", { name: label })[0];
  return Boolean(link.querySelector(".ring-primary\\/20"));
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

  it("highlights nothing when at the top of the page (hero)", async () => {
    mountSections(0);
    renderNav();
    await flushScroll();
    expect(linkIsActive("Features")).toBe(false);
    expect(linkIsActive("Pricing")).toBe(false);
    expect(linkIsActive("FAQ")).toBe(false);
  });

  it("highlights Features when scrolled into the features section", async () => {
    mountSections(900);
    renderNav();
    await flushScroll();
    expect(linkIsActive("Features")).toBe(true);
    expect(linkIsActive("Pricing")).toBe(false);
  });

  it("switches highlight to Pricing when scrolled further down", async () => {
    mountSections(2100);
    renderNav();
    await flushScroll();
    expect(linkIsActive("Features")).toBe(false);
    expect(linkIsActive("Pricing")).toBe(true);
    expect(linkIsActive("FAQ")).toBe(false);
  });

  it("highlights FAQ at the bottom of the page", async () => {
    mountSections(3300);
    renderNav();
    await flushScroll();
    expect(linkIsActive("FAQ")).toBe(true);
  });

  it("never highlights on non-landing routes", async () => {
    mockPathname.mockReturnValue("/pricing");
    mountSections(900);
    renderNav();
    await flushScroll();
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
