import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = path.resolve(__dirname, "../..");

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

describe("admin task manager layout", () => {
  test("uses a full-screen operational shell instead of a centered scroll stack", () => {
    const adminPage = readSource("app/admin/page.tsx");
    const adminView = readSource("components/admin-view.tsx");
    const styles = readSource("app/globals.css");

    expect(adminPage).toContain("<AdminView data={data}");
    expect(adminView).toContain('className="admin-shell"');
    expect(adminView).toContain('className="admin-sidebar"');
    expect(adminView).toContain('className="admin-topbar"');
    expect(adminView).toContain('className="admin-board"');
    expect(adminView).toContain('href="#usuarios"');
    expect(adminView).toContain('href="#evidencias"');
    expect(adminView).toContain('href="#matches"');
    expect(styles).toContain(".admin-shell");
    expect(styles).toContain(".admin-sidebar");
    expect(styles).toContain(".admin-board");
    expect(styles).toContain("height: 100vh");
  });
});
