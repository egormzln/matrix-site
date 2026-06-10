import { ImageResponse } from "next/og";
import { profile } from "@/lib/content/profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${profile.name} — ${profile.role}`;

/** Terminal-styled Open Graph card, generated at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "#020804",
        color: "#00ff66",
        fontFamily: "monospace",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#1a5c36" }}>
        guest@egormzln:~$ whoami
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 32,
          fontSize: 72,
          fontWeight: 700,
          color: "#aaffcc",
          letterSpacing: 4,
        }}
      >
        {profile.name}
      </div>
      <div style={{ display: "flex", marginTop: 16, fontSize: 40 }}>
        {profile.role}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 30,
          color: "#1a5c36",
        }}
      >
        {profile.about}
      </div>
      <div style={{ display: "flex", marginTop: 64, fontSize: 28 }}>
        <span style={{ color: "#1a5c36" }}>guest@egormzln:~$ </span>
        <span
          style={{
            marginLeft: 12,
            width: 22,
            height: 36,
            background: "#00ff66",
            display: "flex",
          }}
        />
      </div>
    </div>,
    size,
  );
}
