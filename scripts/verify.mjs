import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const privacy = readFileSync(new URL("../privacy.html", import.meta.url));
const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../support.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../support.js", import.meta.url), "utf8");

const PRIVACY_SHA256 = "ac7d68cd85dd4d4b7d8af21ea2801d5a859c10608393c1f7cef56d46a05b4e54";
const CONTACT = "developer@arcemdigitalsolutions.com";

function luminance(hex) {
  const n = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test("privacy.html is byte-for-byte unchanged", () => {
  assert.equal(createHash("sha256").update(privacy).digest("hex"), PRIVACY_SHA256);
});

test("the support page is not a redirect", () => {
  assert.doesNotMatch(index, /http-equiv\s*=\s*["']refresh["']/i);
  assert.match(index, /<h1>Park Pilot support<\/h1>/);
  assert.match(index, /id="how-it-works"/);
  assert.match(index, /id="faq"/);
  assert.match(index, /id="contact"/);
});

test("contact address matches privacy.html and is not invented", () => {
  const privacyText = privacy.toString("utf8");
  assert.match(privacyText, new RegExp(CONTACT));
  const mailtos = [...index.matchAll(/mailto:([^"'?\s]+)/g)].map((m) => decodeURIComponent(m[1]));
  assert.ok(mailtos.length >= 1);
  assert.deepEqual([...new Set(mailtos)], [CONTACT]);
  assert.match(index, new RegExp(CONTACT));
  assert.match(index, new RegExp(`data-email="${CONTACT}"`));
  assert.match(js, /getAttribute\("data-email"\)/);
  assert.match(js, new RegExp(`mailto:${CONTACT.replace(".", "\\.")}`));
  assert.doesNotMatch(`${index}\n${js}\n${css}`, /lorem ipsum|todo|placeholder copy/i);
});

test("required support topics and Queue-Times credit are present", () => {
  assert.match(index, /Where do the wait times come from/);
  assert.match(index, /What happens with no signal/);
  assert.match(index, /Which parks are supported/);
  assert.match(index, /Where does the weather come from/);
  assert.match(index, /href="privacy\.html"/);
  assert.match(index, /Powered by Queue-Times\.com/);
  assert.match(index, /https:\/\/queue-times\.com\/en-US/);
  assert.match(index, /how it works/i);
});

test("accessibility basics are in the page and stylesheet", () => {
  assert.match(index, /<html lang="en">/);
  assert.match(index, /name="viewport"/);
  assert.match(index, /class="skip"/);
  assert.match(index, /<label for="faq-search">/);
  assert.match(index, /aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-color-scheme:\s*dark/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("text and control colors used on the page clear WCAG AA", () => {
  assert.ok(contrast("#1c1c1e", "#ffffff") >= 7);
  assert.ok(contrast("#48484a", "#ffffff") >= 4.5);
  assert.ok(contrast("#054a9a", "#ffffff") >= 4.5);
  assert.ok(contrast("#1c1c1e", "#ea641e") >= 4.5);
  assert.ok(contrast("#1c1c1e", "#cd7731") >= 4.5);
  assert.ok(contrast("#8a3b0e", "#ffffff") >= 4.5);
  assert.ok(contrast("#f2f2f7", "#000000") >= 7);
  assert.ok(contrast("#aeaeb2", "#000000") >= 4.5);
  assert.ok(contrast("#6cb4ff", "#000000") >= 4.5);
  assert.ok(contrast("#6cb4ff", "#1c1c1e") >= 4.5);
  assert.ok(contrast("#ffb07a", "#000000") >= 4.5);
  assert.ok(contrast("#8e8e93", "#ffffff") >= 3);
  assert.ok(contrast("#ea641e", "#ffffff") >= 3);
});
