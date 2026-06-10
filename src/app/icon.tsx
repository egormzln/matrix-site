import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Terminal-prompt favicon, generated at build time. */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020804",
        color: "#00ff66",
        fontSize: 40,
        fontFamily: "monospace",
        borderRadius: 8,
      }}
    >
      &gt;_
    </div>,
    size,
  );
}
